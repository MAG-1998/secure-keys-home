import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Filter, Search } from "lucide-react"
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps'

export const MapSection = () => {
  return (
    <section className="py-16 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <div>
            <Badge variant="trust" className="mb-4">
              Live Marketplace
            </Badge>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              Find your perfect home on the map
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Browse 1,500+ verified properties across Tashkent. Filter by price, 
              financing options, and neighborhood preferences.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Halal Financing Available
              </Button>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Yunusobod District
              </Button>
              <Button variant="outline" size="sm">
                2-3 Bedrooms
              </Button>
            </div>
            
            <Button size="lg" className="shadow-warm">
              <Search className="h-5 w-5 mr-2" />
              Open Interactive Map
            </Button>
          </div>
          
          {/* Right: Real Yandex Map */}
          <Card className="bg-gradient-card border-0 shadow-warm">
            <CardContent className="p-6">
              <div className="relative rounded-lg h-80 overflow-hidden">
                <YMaps>
                  <Map
                    defaultState={{
                      center: [41.311081, 69.240562], // Tashkent coordinates
                      zoom: 11,
                    }}
                    width="100%"
                    height="320px"
                    options={{
                      suppressMapOpenBlock: true,
                    }}
                  >
                    {/* Sample property markers with custom design */}
                    <Placemark
                      geometry={[41.327081, 69.280562]}
                      properties={{
                        balloonContent: '<div style="padding: 8px; font-family: system-ui;"><strong>Modern 3-room apartment</strong><br/>💰 $52,000<br/>📍 Chilonzor<br/>✅ Verified Property</div>',
                        hintContent: 'Chilonzor - $52,000'
                      }}
                      options={{
                        iconLayout: 'default#image',
                        iconImageHref: 'data:image/svg+xml;base64,' + btoa(`
                          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="14" fill="#0ea5e9" stroke="#ffffff" stroke-width="3"/>
                            <circle cx="16" cy="16" r="6" fill="#ffffff"/>
                            <text x="16" y="20" text-anchor="middle" fill="#0ea5e9" font-size="10" font-weight="bold">$</text>
                          </svg>
                        `),
                        iconImageSize: [32, 32],
                        iconImageOffset: [-16, -16]
                      }}
                    />
                    <Placemark
                      geometry={[41.295081, 69.200562]}
                      properties={{
                        balloonContent: '<div style="padding: 8px; font-family: system-ui;"><strong>Family apartment</strong><br/>💰 $47,000<br/>📍 Yunusobod<br/>✅ Verified Property</div>',
                        hintContent: 'Yunusobod - $47,000'
                      }}
                      options={{
                        iconLayout: 'default#image',
                        iconImageHref: 'data:image/svg+xml;base64,' + btoa(`
                          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="14" fill="#22c55e" stroke="#ffffff" stroke-width="3"/>
                            <circle cx="16" cy="16" r="6" fill="#ffffff"/>
                            <text x="16" y="20" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="bold">$</text>
                          </svg>
                        `),
                        iconImageSize: [32, 32],
                        iconImageOffset: [-16, -16]
                      }}
                    />
                    <Placemark
                      geometry={[41.335081, 69.265562]}
                      properties={{
                        balloonContent: '<div style="padding: 8px; font-family: system-ui;"><strong>Renovated 4-room home</strong><br/>💰 $68,000<br/>📍 Shaykhontohur<br/>✅ Verified Property<br/>🏠 Premium</div>',
                        hintContent: 'Shaykhontohur - $68,000'
                      }}
                      options={{
                        iconLayout: 'default#image',
                        iconImageHref: 'data:image/svg+xml;base64,' + btoa(`
                          <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="18" cy="18" r="16" fill="#8b5cf6" stroke="#ffffff" stroke-width="3"/>
                            <circle cx="18" cy="18" r="8" fill="#ffffff"/>
                            <text x="18" y="22" text-anchor="middle" fill="#8b5cf6" font-size="11" font-weight="bold">$</text>
                          </svg>
                        `),
                        iconImageSize: [36, 36],
                        iconImageOffset: [-18, -18]
                      }}
                    />
                  </Map>
                </YMaps>
                
                {/* Property info overlay */}
                <Card className="absolute bottom-4 left-4 w-48 shadow-lg bg-background/95 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="text-sm font-semibold">Live Properties</div>
                    <div className="text-xs text-muted-foreground">Click markers to view details</div>
                    <div className="flex items-center mt-2 text-xs">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span>Available Now</span>
                    </div>
                    <Badge variant="trust" className="text-xs mt-1">
                      Real-time Updates
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}