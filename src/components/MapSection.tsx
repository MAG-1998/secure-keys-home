import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Filter, Search } from "lucide-react"

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
          
          {/* Right: Map Mockup */}
          <Card className="bg-gradient-card border-0 shadow-warm">
            <CardContent className="p-6">
              <div className="relative bg-magit-trust/10 rounded-lg h-80 flex items-center justify-center">
                {/* Map placeholder with pins */}
                <div className="absolute inset-4 bg-gradient-to-br from-magit-trust/20 to-primary/20 rounded-lg"></div>
                
                {/* Simulated map pins */}
                <div className="absolute top-8 left-8">
                  <div className="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div className="absolute top-16 right-12">
                  <div className="w-6 h-6 bg-magit-success rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div className="absolute bottom-16 left-16">
                  <div className="w-6 h-6 bg-magit-warm rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div className="absolute bottom-8 right-8">
                  <div className="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg"></div>
                </div>
                
                {/* Property popup mockup */}
                <Card className="absolute bottom-4 left-4 w-48 shadow-lg">
                  <CardContent className="p-3">
                    <div className="w-full h-20 bg-muted rounded mb-2"></div>
                    <div className="text-sm font-semibold">2-room apartment</div>
                    <div className="text-xs text-muted-foreground">Chilonzor, Tashkent</div>
                    <div className="text-sm font-bold text-primary mt-1">$45,000</div>
                    <Badge variant="trust" className="text-xs mt-1">
                      Halal Financing
                    </Badge>
                  </CardContent>
                </Card>
                
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Interactive Map View</p>
                  <p className="text-xs">1,500+ Verified Properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}