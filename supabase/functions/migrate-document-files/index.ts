import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all document requests with file URLs
    const { data: docRequests, error: fetchError } = await supabase
      .from('halal_finance_doc_requests')
      .select('id, user_file_urls')
      .not('user_file_urls', 'is', null)

    if (fetchError) {
      throw fetchError
    }

    const migrationResults = []

    for (const docRequest of docRequests) {
      const fileUrls = docRequest.user_file_urls as string[]
      const newFileUrls = []

      for (const fileUrl of fileUrls) {
        if (fileUrl.includes('/storage/v1/object/public/properties/')) {
          // Extract the path after 'properties/'
          const sourcePath = fileUrl.split('/storage/v1/object/public/properties/')[1]
          
          try {
            // Download the file from properties bucket
            const { data: fileData, error: downloadError } = await supabase.storage
              .from('properties')
              .download(sourcePath)

            if (downloadError) {
              console.error(`Failed to download ${sourcePath}:`, downloadError)
              newFileUrls.push(fileUrl) // Keep original URL if download fails
              continue
            }

            // Upload to documents bucket
            const { error: uploadError } = await supabase.storage
              .from('documents')
              .upload(sourcePath, fileData, {
                upsert: true,
                contentType: fileData.type
              })

            if (uploadError) {
              console.error(`Failed to upload ${sourcePath}:`, uploadError)
              newFileUrls.push(fileUrl) // Keep original URL if upload fails
              continue
            }

            // Update URL to point to documents bucket
            const newUrl = fileUrl.replace('/storage/v1/object/public/properties/', '/storage/v1/object/public/documents/')
            newFileUrls.push(newUrl)

            console.log(`Successfully migrated: ${sourcePath}`)
          } catch (error) {
            console.error(`Error migrating ${sourcePath}:`, error)
            newFileUrls.push(fileUrl) // Keep original URL if migration fails
          }
        } else {
          newFileUrls.push(fileUrl) // Keep URL as is if not from properties bucket
        }
      }

      // Update the document request with new URLs
      const { error: updateError } = await supabase
        .from('halal_finance_doc_requests')
        .update({ user_file_urls: newFileUrls })
        .eq('id', docRequest.id)

      if (updateError) {
        console.error(`Failed to update doc request ${docRequest.id}:`, updateError)
      }

      migrationResults.push({
        docRequestId: docRequest.id,
        originalUrls: fileUrls,
        newUrls: newFileUrls,
        status: 'migrated'
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document files migration completed',
        results: migrationResults
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in migrate-document-files function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})