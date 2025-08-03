import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { MapPin, Filter, Search, X } from "lucide-react"
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps'
import { useState } from 'react'

interface MapSectionProps {
  isHalalMode?: boolean
  t: (key: string) => string
}

export const MapSection = ({ isHalalMode = false, t }: MapSectionProps) => {
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([30000, 100000])
  
  return (
    <section className={`py-16 transition-colors duration-500 ${
      isHalalMode ? 'bg-magit-trust/5' : 'bg-background/50'
    }`}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <div>
            <Badge variant={isHalalMode ? "trust" : "warning"} className="mb-4">
              {isHalalMode ? t('map.halalMarketplace') : t('map.liveMarketplace')}
            </Badge>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              {t('map.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {t('map.description')}
            </p>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t('map.halalFinancing')}
              </Button>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                {t('map.yunusobodDistrict')}
              </Button>
              <Button variant="outline" size="sm">
                {t('map.bedrooms')}
              </Button>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-warm">
                  <Search className="h-5 w-5 mr-2" />
                  {t('map.openMap')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-screen-xl w-[95vw] h-[90vh] p-0">
                <div className="flex h-full">
                  {/* Fullscreen Map */}
                  <div className="flex-1 relative">
                    <YMaps>
                      <Map
                        defaultState={{
                          center: [41.311081, 69.240562],
                          zoom: 12,
                        }}
                        width="100%"
                        height="100%"
                        options={{
                          suppressMapOpenBlock: true,
                        }}
                      >
                        <Placemark
                          geometry={[41.327081, 69.280562]}
                          properties={{
                            balloonContent: '<div style="padding: 8px; font-family: system-ui;"><strong>Modern 3-room apartment</strong><br/>💰 $52,000<br/>📍 Chilonzor<br/>✅ Verified Property</div>',
                            hintContent: 'Chilonzor - $52,000'
                          }}
                          options={{
                            iconLayout: 'default#image',
                            iconImageHref: 'data:image/svg+xml;base64,' + btoa(`
                              <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 0C6.268 0 0 6.268 0 14C0 22 14 36 14 36C14 36 28 22 28 14C28 6.268 21.732 0 14 0Z" fill="hsl(25 12% 28%)"/>
                                <circle cx="14" cy="14" r="8" fill="hsl(35 20% 98%)"/>
                                <circle cx="14" cy="14" r="5" fill="hsl(25 12% 28%)"/>
                                <rect x="11" y="11" width="6" height="6" rx="1" fill="hsl(35 20% 98%)"/>
                              </svg>
                            `),
                            iconImageSize: [28, 36],
                            iconImageOffset: [-14, -36]
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
                              <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 0C6.268 0 0 6.268 0 14C0 22 14 36 14 36C14 36 28 22 28 14C28 6.268 21.732 0 14 0Z" fill="hsl(180 30% 75%)"/>
                                <circle cx="14" cy="14" r="8" fill="hsl(35 20% 98%)"/>
                                <circle cx="14" cy="14" r="5" fill="hsl(180 30% 75%)"/>
                                <rect x="11" y="11" width="6" height="6" rx="1" fill="hsl(35 20% 98%)"/>
                              </svg>
                            `),
                            iconImageSize: [28, 36],
                            iconImageOffset: [-14, -36]
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
                              <svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 0C6.716 0 0 6.716 0 15C0 24 15 38 15 38C15 38 30 24 30 15C30 6.716 23.284 0 15 0Z" fill="hsl(45 85% 70%)"/>
                                <circle cx="15" cy="15" r="9" fill="hsl(35 20% 98%)"/>
                                <circle cx="15" cy="15" r="6" fill="hsl(45 85% 70%)"/>
                                <rect x="12" y="12" width="6" height="6" rx="1" fill="hsl(35 20% 98%)"/>
                              </svg>
                            `),
                            iconImageSize: [30, 38],
                            iconImageOffset: [-15, -38]
                          }}
                        />
                      </Map>
                    </YMaps>
                    
                    {/* Filter Toggle Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                  
                  {/* Filter Panel */}
                  {showFilters && (
                    <Card className="w-80 h-full overflow-y-auto border-l bg-background z-50">
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <DialogTitle className="text-lg font-semibold">Filters</DialogTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Price Range */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Price Range</label>
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={150000}
                            min={20000}
                            step={5000}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>${priceRange[0].toLocaleString()}</span>
                            <span>${priceRange[1].toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {/* Property Type */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Property Type</label>
                          <div className="space-y-2">
                            {['Apartment', 'House', 'Studio', 'Villa'].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <Checkbox id={type.toLowerCase()} />
                                <label htmlFor={type.toLowerCase()} className="text-sm">{type}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* District */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium">District</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chilonzor">Chilonzor</SelectItem>
                              <SelectItem value="yunusobod">Yunusobod</SelectItem>
                              <SelectItem value="shaykhontohur">Shaykhontohur</SelectItem>
                              <SelectItem value="mirabad">Mirabad</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Bedrooms */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Bedrooms</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="studio">Studio</SelectItem>
                              <SelectItem value="1">1 Bedroom</SelectItem>
                              <SelectItem value="2">2 Bedrooms</SelectItem>
                              <SelectItem value="3">3 Bedrooms</SelectItem>
                              <SelectItem value="4+">4+ Bedrooms</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Financing Options */}
                        {isHalalMode && (
                          <div className="space-y-3">
                            <label className="text-sm font-medium">Halal Financing</label>
                            <div className="space-y-2">
                              {['Murabaha', 'Ijara', 'Istisna'].map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox id={option.toLowerCase()} />
                                  <label htmlFor={option.toLowerCase()} className="text-sm">{option}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Apply Filters Button */}
                        <Button className="w-full" variant={isHalalMode ? "default" : "default"}>
                          Apply Filters
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </DialogContent>
            </Dialog>
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
                          <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 0C6.268 0 0 6.268 0 14C0 22 14 36 14 36C14 36 28 22 28 14C28 6.268 21.732 0 14 0Z" fill="hsl(25 12% 28%)"/>
                            <circle cx="14" cy="14" r="8" fill="hsl(35 20% 98%)"/>
                            <circle cx="14" cy="14" r="5" fill="hsl(25 12% 28%)"/>
                            <rect x="11" y="11" width="6" height="6" rx="1" fill="hsl(35 20% 98%)"/>
                          </svg>
                        `),
                        iconImageSize: [28, 36],
                        iconImageOffset: [-14, -36]
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
                          <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 0C6.268 0 0 6.268 0 14C0 22 14 36 14 36C14 36 28 22 28 14C28 6.268 21.732 0 14 0Z" fill="hsl(180 30% 75%)"/>
                            <circle cx="14" cy="14" r="8" fill="hsl(35 20% 98%)"/>
                            <circle cx="14" cy="14" r="5" fill="hsl(180 30% 75%)"/>
                            <rect x="11" y="11" width="6" height="6" rx="1" fill="hsl(35 20% 98%)"/>
                          </svg>
                        `),
                        iconImageSize: [28, 36],
                        iconImageOffset: [-14, -36]
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
                          <svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 0C6.716 0 0 6.716 0 15C0 24 15 38 15 38C15 38 30 24 30 15C30 6.716 23.284 0 15 0Z" fill="hsl(45 85% 70%)"/>
                            <circle cx="15" cy="15" r="9" fill="hsl(35 20% 98%)"/>
                            <circle cx="15" cy="15" r="6" fill="hsl(45 85% 70%)"/>
                            <rect x="12" y="12" width="6" height="6" rx="1" fill="hsl(35 20% 98%)"/>
                          </svg>
                        `),
                        iconImageSize: [30, 38],
                        iconImageOffset: [-15, -38]
                      }}
                    />
                  </Map>
                </YMaps>
                
                {/* Property info overlay */}
                <Card className="absolute bottom-4 left-4 w-48 shadow-lg bg-background/95 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="text-sm font-semibold">{t('map.liveProperties')}</div>
                    <div className="text-xs text-muted-foreground">{t('map.clickMarkers')}</div>
                    <div className="flex items-center mt-2 text-xs">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span>{t('map.availableNow')}</span>
                    </div>
                    <Badge variant={isHalalMode ? "trust" : "warning"} className="text-xs mt-1">
                      {t('map.realTimeUpdates')}
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