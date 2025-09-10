import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentRecord {
  id: string;
  user_file_urls: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting document migration process...');

    // Get all document requests with file URLs pointing to properties bucket
    const { data: docRequests, error: fetchError } = await supabaseClient
      .from('halal_finance_doc_requests')
      .select('id, user_file_urls')
      .not('user_file_urls', 'is', null);

    if (fetchError) {
      console.error('Error fetching document requests:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${docRequests?.length || 0} document requests to process`);

    const migrationResults = [];

    for (const docRequest of docRequests || []) {
      const updatedUrls = [];
      
      for (const fileUrl of docRequest.user_file_urls) {
        if (typeof fileUrl === 'string' && fileUrl.includes('/storage/v1/object/public/properties/')) {
          // Extract the file path from the properties bucket
          const pathAfterProperties = fileUrl.split('/storage/v1/object/public/properties/')[1];
          
          try {
            // Download file from properties bucket
            const { data: fileData, error: downloadError } = await supabaseClient.storage
              .from('properties')
              .download(pathAfterProperties);

            if (downloadError) {
              console.error(`Error downloading file ${pathAfterProperties}:`, downloadError);
              updatedUrls.push(fileUrl); // Keep original URL if download fails
              continue;
            }

            // Upload to documents bucket
            const { error: uploadError } = await supabaseClient.storage
              .from('documents')
              .upload(pathAfterProperties, fileData, {
                contentType: fileData.type,
                upsert: true
              });

            if (uploadError) {
              console.error(`Error uploading file ${pathAfterProperties}:`, uploadError);
              updatedUrls.push(fileUrl); // Keep original URL if upload fails
              continue;
            }

            // Get the new public URL
            const { data: publicUrlData } = supabaseClient.storage
              .from('documents')
              .getPublicUrl(pathAfterProperties);

            updatedUrls.push(publicUrlData.publicUrl);
            console.log(`Successfully migrated: ${pathAfterProperties}`);

          } catch (error) {
            console.error(`Error processing file ${pathAfterProperties}:`, error);
            updatedUrls.push(fileUrl); // Keep original URL if processing fails
          }
        } else {
          updatedUrls.push(fileUrl); // Keep non-properties URLs as is
        }
      }

      // Update the document request with new URLs
      const { error: updateError } = await supabaseClient
        .from('halal_finance_doc_requests')
        .update({ user_file_urls: updatedUrls })
        .eq('id', docRequest.id);

      if (updateError) {
        console.error(`Error updating document request ${docRequest.id}:`, updateError);
      }

      migrationResults.push({
        id: docRequest.id,
        originalUrls: docRequest.user_file_urls,
        newUrls: updatedUrls,
        success: !updateError
      });
    }

    console.log('Migration process completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document migration completed',
        results: migrationResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});