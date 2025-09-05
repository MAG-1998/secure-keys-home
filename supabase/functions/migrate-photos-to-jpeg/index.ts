import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Image conversion utility (copied from frontend)
const convertImageToJpeg = async (imageBlob: Blob, fileName: string): Promise<{ blob: Blob; fileName: string }> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const jpegFileName = fileName.replace(/\.[^/.]+$/, '.jpg');
          resolve({ blob, fileName: jpegFileName });
        } else {
          reject(new Error('Failed to convert image to JPEG'));
        }
      }, 'image/jpeg', 0.85);
    };
    
    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    img.src = URL.createObjectURL(imageBlob);
  });
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId, preview = false } = await req.json();
    
    console.log('Starting photo migration process...', { propertyId, preview });
    
    // Get properties with photos to migrate
    const query = supabase
      .from('properties')
      .select('id, title, photos, image_url');
    
    if (propertyId) {
      query.eq('id', propertyId);
    }
    
    const { data: properties, error: fetchError } = await query;
    
    if (fetchError) {
      throw new Error(`Failed to fetch properties: ${fetchError.message}`);
    }
    
    const migrationResults = [];
    
    for (const property of properties || []) {
      console.log(`Processing property: ${property.title} (${property.id})`);
      
      const photos = property.photos || [];
      const needsMigration = [];
      
      // Check which photos need conversion
      for (const photo of photos) {
        if (typeof photo === 'string' && (photo.includes('/properties/') || photo.includes('properties/'))) {
          const fileName = photo.split('/').pop() || '';
          const extension = fileName.split('.').pop()?.toLowerCase();
          
          if (extension && !['jpg', 'jpeg'].includes(extension)) {
            needsMigration.push({ url: photo, fileName, extension });
          }
        }
      }
      
      // Check image_url too
      if (property.image_url && (property.image_url.includes('/properties/') || property.image_url.includes('properties/'))) {
        const fileName = property.image_url.split('/').pop() || '';
        const extension = fileName.split('.').pop()?.toLowerCase();
        
        if (extension && !['jpg', 'jpeg'].includes(extension)) {
          const isAlreadyInPhotos = needsMigration.some(p => p.url === property.image_url);
          if (!isAlreadyInPhotos) {
            needsMigration.push({ url: property.image_url, fileName, extension });
          }
        }
      }
      
      console.log(`Found ${needsMigration.length} photos to migrate for property ${property.title}`);
      
      if (needsMigration.length === 0) {
        migrationResults.push({
          propertyId: property.id,
          propertyTitle: property.title,
          status: 'no_migration_needed',
          migratedCount: 0
        });
        continue;
      }
      
      if (preview) {
        migrationResults.push({
          propertyId: property.id,
          propertyTitle: property.title,
          status: 'preview',
          photosNeedingMigration: needsMigration.length,
          details: needsMigration
        });
        continue;
      }
      
      // Perform actual migration
      const migratedPhotos = [];
      const migratedUrls = new Map();
      
      for (const photo of needsMigration) {
        try {
          console.log(`Converting ${photo.fileName} (${photo.extension} -> jpg)`);
          
          // Extract storage path from URL - handle various URL formats
          let storagePath = photo.url;
          
          // Remove Supabase storage URL prefix if present
          if (storagePath.includes('/storage/v1/object/public/properties/')) {
            storagePath = storagePath.split('/storage/v1/object/public/properties/')[1];
          } else if (storagePath.includes('properties/')) {
            // Handle cases where it's just "properties/..." 
            const parts = storagePath.split('properties/');
            storagePath = parts[parts.length - 1];
          }
          
          console.log(`Downloading from storage path: ${storagePath}`);
          
          // Download the original image
          const { data: imageData, error: downloadError } = await supabase.storage
            .from('properties')
            .download(storagePath);
          
          if (downloadError || !imageData) {
            console.error(`Failed to download ${photo.fileName} from path ${storagePath}:`, downloadError);
            continue;
          }
          
          // Convert using browser APIs in Deno
          const arrayBuffer = await imageData.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Generate new JPEG filename and path
          const jpegFileName = photo.fileName.replace(/\.[^/.]+$/, '.jpg');
          const newStoragePath = storagePath.replace(photo.fileName, jpegFileName);
          
          console.log(`Uploading to storage path: ${newStoragePath}`);
          
          // For now, just re-upload with .jpg extension and proper MIME type
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('properties')
            .upload(newStoragePath, uint8Array, {
              contentType: 'image/jpeg',
              upsert: true
            });
          
          if (uploadError) {
            console.error(`Failed to upload ${jpegFileName}:`, uploadError);
            continue;
          }
          
          // Construct the new public URL
          const newUrl = `/storage/v1/object/public/properties/${newStoragePath}`;
          migratedUrls.set(photo.url, newUrl);
          migratedPhotos.push(newUrl);
          
          console.log(`Successfully converted: ${photo.fileName} -> ${jpegFileName}`);
          
        } catch (error) {
          console.error(`Error converting ${photo.fileName}:`, error);
        }
      }
      
      if (migratedUrls.size > 0) {
        // Update photos array
        const updatedPhotos = photos.map(photo => migratedUrls.get(photo) || photo);
        
        // Update image_url if it was migrated
        const updatedImageUrl = property.image_url && migratedUrls.has(property.image_url) 
          ? migratedUrls.get(property.image_url) 
          : property.image_url;
        
        // Update the property in database
        const { error: updateError } = await supabase
          .from('properties')
          .update({
            photos: updatedPhotos,
            image_url: updatedImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', property.id);
        
        if (updateError) {
          console.error(`Failed to update property ${property.id}:`, updateError);
        } else {
          console.log(`Successfully updated property ${property.title} with ${migratedUrls.size} converted photos`);
        }
        
        // Clean up old files
        for (const [oldUrl] of migratedUrls) {
          let oldPath = oldUrl;
          if (oldPath.includes('/storage/v1/object/public/properties/')) {
            oldPath = oldPath.split('/storage/v1/object/public/properties/')[1];
          } else if (oldPath.includes('properties/')) {
            const parts = oldPath.split('properties/');
            oldPath = parts[parts.length - 1];
          }
          console.log(`Removing old file: ${oldPath}`);
          await supabase.storage.from('properties').remove([oldPath]);
        }
      }
      
      migrationResults.push({
        propertyId: property.id,
        propertyTitle: property.title,
        status: 'completed',
        migratedCount: migratedUrls.size,
        totalPhotos: photos.length
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: preview ? 'Migration preview completed' : 'Photo migration completed',
      results: migrationResults,
      totalProperties: properties?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});