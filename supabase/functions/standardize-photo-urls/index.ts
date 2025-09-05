import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting URL standardization process...');
    
    // Get all properties with photos
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, photos, image_url')
      .not('photos', 'is', null);
    
    if (fetchError) {
      throw new Error(`Failed to fetch properties: ${fetchError.message}`);
    }
    
    const standardizationResults = [];
    let totalUpdated = 0;
    
    for (const property of properties || []) {
      let updated = false;
      let photoCount = 0;
      let imageUrlUpdated = false;
      
      // Process photos array
      const updatedPhotos = [];
      if (property.photos && Array.isArray(property.photos)) {
        for (const photo of property.photos) {
          if (typeof photo === 'string') {
            if (photo.includes('mvndmnkgtoygsvesktgw.supabase.co/storage/v1/object/public/properties/')) {
              // Convert full URL to relative path
              const relativePath = '/storage/v1/object/public/properties/' + 
                                 photo.split('/storage/v1/object/public/properties/')[1];
              updatedPhotos.push(relativePath);
              photoCount++;
              updated = true;
            } else {
              updatedPhotos.push(photo);
            }
          } else {
            updatedPhotos.push(photo);
          }
        }
      }
      
      // Process image_url
      let updatedImageUrl = property.image_url;
      if (property.image_url && property.image_url.includes('mvndmnkgtoygsvesktgw.supabase.co/storage/v1/object/public/properties/')) {
        updatedImageUrl = '/storage/v1/object/public/properties/' + 
                         property.image_url.split('/storage/v1/object/public/properties/')[1];
        imageUrlUpdated = true;
        updated = true;
      }
      
      // Update the property if changes were made
      if (updated) {
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
          standardizationResults.push({
            propertyId: property.id,
            propertyTitle: property.title,
            status: 'error',
            error: updateError.message
          });
        } else {
          console.log(`Standardized URLs for property: ${property.title} (${photoCount} photos, image_url: ${imageUrlUpdated})`);
          totalUpdated += photoCount + (imageUrlUpdated ? 1 : 0);
          standardizationResults.push({
            propertyId: property.id,
            propertyTitle: property.title,
            status: 'updated',
            photosUpdated: photoCount,
            imageUrlUpdated
          });
        }
      } else {
        standardizationResults.push({
          propertyId: property.id,
          propertyTitle: property.title,
          status: 'no_update_needed'
        });
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `URL standardization completed. Updated ${totalUpdated} photo URLs across ${properties?.length || 0} properties.`,
      results: standardizationResults,
      totalUpdated,
      totalProperties: properties?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('URL standardization error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});