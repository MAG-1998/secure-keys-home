import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://mvndmnkgtoygsvesktgw.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bmRtbmtndG95Z3N2ZXNrdGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjM3NDQsImV4cCI6MjA2OTUzOTc0NH0.vNCyFA9lp631y7-lz8GJHA1r-HmL7fO2eRc4a5nfU28"

export default async function handler(req: any, res: any) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Property ID is required' })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Fetch property details
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        location,
        price,
        bedrooms,
        bathrooms,
        area,
        image_url,
        photos
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error || !property) {
      // Fallback to default meta tags
      return res.setHeader('Content-Type', 'text/html').send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            
            <!-- Favicon Links -->
            <link rel="icon" href="https://magit.uz/icons/magit-favicon-light.png" type="image/png">
            <link rel="icon" href="https://magit.uz/icons/magit-favicon-dark.png" type="image/png" media="(prefers-color-scheme: dark)">
            <link rel="apple-touch-icon" href="https://magit.uz/magit-app-icon-512.png">
            <link rel="manifest" href="https://magit.uz/manifest.webmanifest">
            
            <!-- Open Graph -->
            <meta property="og:title" content="Property Not Found - Magit" />
            <meta property="og:description" content="This property is no longer available. Discover other verified homes with Sharia-compliant financing in Uzbekistan." />
            <meta property="og:image" content="https://magit.uz/magit-og-2025-09.png?v=${Date.now()}" />
            <meta property="og:image:secure_url" content="https://magit.uz/magit-og-2025-09.png?v=${Date.now()}" />
            <meta property="og:url" content="https://magit.uz/property/${id}" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Magit" />
            
            <!-- Twitter -->
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Property Not Found - Magit" />
            <meta name="twitter:description" content="This property is no longer available. Discover other verified homes with Sharia-compliant financing in Uzbekistan." />
            <meta name="twitter:image" content="https://magit.uz/magit-og-2025-09.png?v=${Date.now()}" />
            
            <title>Property Not Found - Magit</title>
            <script>window.location.href = '/property/${id}';</script>
          </head>
          <body></body>
        </html>
      `)
    }

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-US').format(property.price)
    
    // Get the best image with cache busting
    const cacheBuster = Date.now()
    let imageUrl = `https://magit.uz/magit-og-2025-09.png?v=${cacheBuster}`
    if (property.photos && property.photos.length > 0) {
      const firstPhoto = property.photos[0]
      if (typeof firstPhoto === 'string') {
        imageUrl = firstPhoto.startsWith('http') ? firstPhoto : `https://mvndmnkgtoygsvesktgw.supabase.co/storage/v1/object/public/properties/${firstPhoto}`
      }
    } else if (property.image_url) {
      imageUrl = property.image_url.startsWith('http') ? property.image_url : `https://mvndmnkgtoygsvesktgw.supabase.co/storage/v1/object/public/properties/${property.image_url}`
    }

    // Create property-specific meta
    const title = `${property.title} - $${formattedPrice} | Magit`
    const description = `${property.bedrooms}BR/${property.bathrooms}BA • ${property.area}m² • ${property.location}. ${property.description?.substring(0, 100) || 'Verified home with Sharia-compliant financing available.'}`
    const url = `https://magit.uz/property/${id}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          
          <!-- Favicon Links -->
          <link rel="icon" href="https://magit.uz/icons/magit-favicon-light.png" type="image/png">
          <link rel="icon" href="https://magit.uz/icons/magit-favicon-dark.png" type="image/png" media="(prefers-color-scheme: dark)">
          <link rel="apple-touch-icon" href="https://magit.uz/magit-app-icon-512.png">
          <link rel="manifest" href="https://magit.uz/manifest.webmanifest">
          
          <!-- Open Graph -->
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${imageUrl}" />
          <meta property="og:image:secure_url" content="${imageUrl}" />
          <meta property="og:url" content="${url}" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Magit" />
          <meta property="og:image:type" content="image/jpeg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          
          <!-- Twitter -->
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${imageUrl}" />
          
          <title>${title}</title>
          <meta name="description" content="${description}" />
          
          <script>
            // Redirect to actual property page for real users
            window.location.href = '/property/${id}';
          </script>
        </head>
        <body>
          <h1>${property.title}</h1>
          <p>${description}</p>
          <p>Price: $${formattedPrice}</p>
          <p>Location: ${property.location}</p>
        </body>
      </html>
    `

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    res.send(html)

  } catch (error) {
    console.error('Error generating property OG:', error)
    res.status(500).json({ error: 'Failed to generate property preview' })
  }
}