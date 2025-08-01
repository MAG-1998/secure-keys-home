import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath, Square, Heart } from "lucide-react"

interface PropertyCardProps {
  id: string
  title: string
  location: string
  price: string
  bedrooms: number
  bathrooms: number
  area: number
  imageUrl: string
  isVerified?: boolean
  isHalalFinanced?: boolean
}

export const PropertyCard = ({
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  imageUrl,
  isVerified = true,
  isHalalFinanced = false
}: PropertyCardProps) => {
  return (
    <Card className="group hover:shadow-warm transition-all duration-300 cursor-pointer">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <Button 
          variant="ghost" 
          size="sm"
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <Heart className="h-4 w-4" />
        </Button>
        <div className="absolute bottom-3 left-3 flex gap-2">
          {isVerified && (
            <Badge variant="success" className="text-xs">
              ✓ Verified
            </Badge>
          )}
          {isHalalFinanced && (
            <Badge variant="trust" className="text-xs">
              Halal Financing
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-heading font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="text-right">
            <div className="font-heading font-bold text-xl text-primary">{price}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
        
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{location}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            {bedrooms}
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            {bathrooms}
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            {area}m²
          </div>
        </div>
        
        <Button className="w-full" variant="outline">
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}