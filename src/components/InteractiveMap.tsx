import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Filter, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InteractiveMapProps {
  isHalalMode?: boolean;
  t: (key: string) => string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ isHalalMode = false, t }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [tokenError, setTokenError] = useState('');

  // Sample property data for Tashkent
  const properties = [
    { id: 1, lat: 41.2995, lng: 69.2401, price: 52000, district: 'Chilonzor', type: 'apartment' },
    { id: 2, lat: 41.3111, lng: 69.2797, price: 47000, district: 'Yunusobod', type: 'house' },
    { id: 3, lat: 41.2648, lng: 69.2163, price: 68000, district: 'Shaykhantahur', type: 'premium' },
  ];

  const handleTokenSubmit = async () => {
    if (!mapboxToken.trim()) {
      setTokenError('Please enter your Mapbox token');
      return;
    }

    try {
      // Dynamically import mapbox-gl
      const mapboxgl = await import('mapbox-gl');
      await import('mapbox-gl/dist/mapbox-gl.css');

      // Set access token
      (mapboxgl as any).accessToken = mapboxToken;

      if (!mapContainer.current) return;

      // Initialize map
      map.current = new (mapboxgl as any).Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [69.2401, 41.2995], // Tashkent coordinates
        zoom: 11,
        pitch: 45,
      });

      // Add navigation controls
      map.current.addControl(
        new (mapboxgl as any).NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add property markers
      properties.forEach((property) => {
        // Create a marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'w-8 h-8 bg-primary rounded-full border-2 border-background shadow-lg cursor-pointer flex items-center justify-center text-white text-xs font-bold';
        markerElement.innerHTML = '$';

        // Create popup
        const popup = new (mapboxgl as any).Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">$${property.price.toLocaleString()}</h3>
            <p class="text-xs text-gray-600">${property.district}</p>
            <p class="text-xs text-gray-500 capitalize">${property.type}</p>
          </div>
        `);

        // Add marker to map
        new (mapboxgl as any).Marker(markerElement)
          .setLngLat([property.lng, property.lat])
          .setPopup(popup)
          .addTo(map.current);
      });

      setShowTokenInput(false);
      setTokenError('');
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError('Invalid Mapbox token or failed to load map. Please check your token.');
    }
  };

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (showTokenInput) {
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
                Interactive Map Setup
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Enter your Mapbox token to view an interactive map of properties in Tashkent.
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
            </div>
            
            {/* Right: Token Input */}
            <Card className="bg-gradient-card border-0 shadow-warm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      To use the interactive map, you need a Mapbox public token. 
                      Get one for free at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <label htmlFor="mapbox-token" className="text-sm font-medium">
                      Mapbox Public Token
                    </label>
                    <Input
                      id="mapbox-token"
                      type="password"
                      placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbG..."
                      value={mapboxToken}
                      onChange={(e) => setMapboxToken(e.target.value)}
                      className={tokenError ? 'border-destructive' : ''}
                    />
                    {tokenError && (
                      <p className="text-sm text-destructive">{tokenError}</p>
                    )}
                  </div>
                  
                  <Button onClick={handleTokenSubmit} className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Load Interactive Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

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
          
          {/* Right: Interactive Map */}
          <Card className="bg-gradient-card border-0 shadow-warm">
            <CardContent className="p-6">
              <div className="relative rounded-lg h-80 overflow-hidden">
                <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
                
                {/* Property info overlay */}
                <Card className="absolute bottom-4 left-4 w-48 shadow-lg bg-background/95 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="text-sm font-semibold">{properties.length} Properties Found</div>
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
  );
};

export default InteractiveMap;