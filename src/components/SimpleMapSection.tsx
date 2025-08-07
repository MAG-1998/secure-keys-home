import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Filter, Search } from "lucide-react"
import { memo } from 'react'

interface SimpleMapSectionProps {
  isHalalMode?: boolean
  t: (key: string) => string
}

export const SimpleMapSection = memo(({ isHalalMode = false, t }: SimpleMapSectionProps) => {
  return (
    <section className={`py-16 transition-colors duration-500 ${
      isHalalMode ? 'bg-magit-trust/5' : 'bg-background/50'
    }`}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <div>
            <Badge variant={isHalalMode ? "default" : "secondary"} className="mb-4">
              {isHalalMode ? 'Halal Marketplace' : 'Live Marketplace'}
            </Badge>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              Discover Properties in Tashkent
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Browse verified properties with interactive maps and smart filtering options.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Halal Financing
              </Button>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Yunusobod District
              </Button>
              <Button variant="outline" size="sm">
                3+ Bedrooms
              </Button>
            </div>
            
            <Button size="lg" className="shadow-warm">
              <Search className="h-5 w-5 mr-2" />
              Browse Properties
            </Button>
          </div>
          
          {/* Right: Map Placeholder with Property Cards */}
          <Card className="bg-gradient-card border-0 shadow-warm">
            <CardContent className="p-6">
              <div className="relative rounded-lg h-80 bg-muted/20 overflow-hidden">
                {/* Simple map representation */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground font-medium">Interactive Map</p>
                    <p className="text-sm text-muted-foreground">Click to explore properties</p>
                  </div>
                </div>
                
                {/* Property markers */}
                <div className="absolute top-16 left-12">
                  <div className="w-6 h-6 bg-primary rounded-full border-2 border-background shadow-lg animate-pulse"></div>
                  <div className="absolute -top-8 left-8 bg-background/95 backdrop-blur-sm rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                    $52,000 - Chilonzor
                  </div>
                </div>
                
                <div className="absolute top-32 right-16">
                  <div className="w-6 h-6 bg-accent rounded-full border-2 border-background shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute -top-8 right-8 bg-background/95 backdrop-blur-sm rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                    $47,000 - Yunusobod
                  </div>
                </div>
                
                <div className="absolute bottom-20 left-20">
                  <div className="w-6 h-6 bg-magit-warning rounded-full border-2 border-background shadow-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute -top-8 left-8 bg-background/95 backdrop-blur-sm rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                    $68,000 - Premium
                  </div>
                </div>
                
                {/* Property info overlay */}
                <Card className="absolute bottom-4 left-4 w-48 shadow-lg bg-background/95 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="text-sm font-semibold">3 Properties Found</div>
                    <div className="text-xs text-muted-foreground">Click markers for details</div>
                    <div className="flex items-center mt-2 text-xs">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <span>Verified</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
})

SimpleMapSection.displayName = "SimpleMapSection"