import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath, Square, Heart } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { calculateHalalFinancing } from "@/utils/halalFinancing"
import { useTranslation } from "@/hooks/useTranslation"
import { getImageUrl } from "@/lib/utils"
import { CachedImage } from "@/components/CachedImage"

interface PropertyCardProps {
  id: string
  title: string
  display_name?: string
  location: string
  price: string | number
  priceUsd?: number
  bedrooms: number
  bathrooms: number
  area: number
  landAreaSotka?: number
  propertyType?: string
  imageUrl?: string
  image_url?: string
  isVerified?: boolean
  isHalalFinanced?: boolean
  verified?: boolean
  financingAvailable?: boolean
  onClick?: () => void
  property?: any // For backward compatibility
  // Halal financing specific props
  isHalalMode?: boolean
  cashAvailable?: number
  financingPeriod?: number
  monthlyPayment?: number
}

export const PropertyCard = ({
  id,
  title,
  display_name,
  location,
  price,
  priceUsd,
  bedrooms,
  bathrooms,
  area,
  landAreaSotka,
  propertyType,
  imageUrl,
  image_url,
  isVerified,
  isHalalFinanced,
  verified,
  financingAvailable,
  onClick,
  property,
  isHalalMode,
  cashAvailable,
  financingPeriod,
  monthlyPayment
}: PropertyCardProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Handle backward compatibility with property prop
  const actualId = id || property?.id
  const actualTitle = display_name || title || property?.display_name || property?.title || 'Property'
  const actualLocation = location || property?.location || property?.district || 'Tashkent'
  
  // Calculate display price based on halal mode
  let displayPrice = '';
  let displaySubtext = '';
  let totalCostDisplay = '';
  
  if (isHalalMode && priceUsd) {
    if (cashAvailable && financingPeriod) {
      // Show total property price after financing when boxes are filled
      const calculation = calculateHalalFinancing(cashAvailable, priceUsd, financingPeriod);
      const totalPropertyPrice = priceUsd + calculation.fixedFee + calculation.serviceFee + calculation.tax;
      displayPrice = `$${Math.round(totalPropertyPrice).toLocaleString()}`;
      displaySubtext = 'Total after financing';
      totalCostDisplay = `$${Math.round(calculation.requiredMonthlyPayment).toLocaleString()}/month`;
    } else {
      // Show "starting from" with default 90% cash available and 6 month financing scenario
      const defaultCash = priceUsd * 0.9;
      const calculation = calculateHalalFinancing(defaultCash, priceUsd, 6);
      displayPrice = `Starting from $${Math.round(calculation.requiredMonthlyPayment).toLocaleString()}`;
      displaySubtext = 'Monthly Payment';
    }
  } else {
    // Standard price display
    const basePrice = price || priceUsd || property?.priceUsd || 0;
    displayPrice = typeof basePrice === 'string' ? basePrice : `$${Math.round(basePrice).toLocaleString()}`;
    displaySubtext = 'Total';
  }
  
  const actualBedrooms = bedrooms || property?.bedrooms || 0
  const actualBathrooms = bathrooms || property?.bathrooms || 0
  const actualArea = area || property?.area || 0
  const actualLandArea = landAreaSotka || property?.land_area_sotka
  const actualPropertyType = propertyType || property?.property_type
  // Get first photo from property_photos or fallback to legacy image_url
  const primaryImageUrl = property?.image_url || property?.property_photos?.[0]?.url || imageUrl || image_url
  const actualImageUrl = getImageUrl(primaryImageUrl)
  const actualIsVerified = isVerified ?? verified ?? property?.verified ?? false
  const actualIsHalalFinanced = isHalalFinanced ?? financingAvailable ?? property?.financingAvailable ?? (property?.is_halal_available && property?.halal_status === 'approved') ?? false

  const handleNavigate = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(`/property/${actualId}`)
    }
  }

  return (
    <Card onClick={handleNavigate} className="group hover:shadow-warm transition-all duration-300 cursor-pointer w-full h-full flex flex-col">
      <div className="relative">
        <CachedImage
          src={actualImageUrl}
          alt={actualTitle}
          className="w-full h-48"
          lazy={true}
        />
        <Button 
          variant="ghost" 
          size="sm"
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={(e) => { e.stopPropagation(); }}
          aria-label="Save property"
        >
          <Heart className="h-4 w-4" />
        </Button>
        <div className="absolute bottom-3 left-3 flex gap-2">
          {actualIsVerified && (
            <Badge variant="success" className="text-xs">
              ✓ Verified
            </Badge>
          )}
          {actualIsHalalFinanced && (
            <Badge variant="trust" className="text-xs">
              {t('property.halalFinancing')}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-heading font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {actualTitle}
          </h3>
          <div className="text-right">
            <div className="font-heading font-bold text-xl text-primary">{displayPrice}</div>
            <div className="text-xs text-muted-foreground">{displaySubtext}</div>
            {totalCostDisplay && (
              <div className="text-xs text-muted-foreground mt-1">{totalCostDisplay}</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{actualLocation}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-grow">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            {actualBedrooms}
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            {actualBathrooms}
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            {actualPropertyType === 'house' && actualLandArea ? 
              `${actualArea}m² • ${actualLandArea} соток` : 
              `${actualArea}m²`
            }
          </div>
        </div>
        
        <Button className="w-full mt-auto" variant="outline" onClick={(e) => { e.stopPropagation(); handleNavigate(); }}>
          {t('common.viewDetails')}
        </Button>
      </CardContent>
    </Card>
  )
}
