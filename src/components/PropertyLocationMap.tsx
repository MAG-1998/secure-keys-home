import React, { useEffect, useRef } from 'react';
import { useMapLoader } from "@/hooks/useMapLoader";
import type { Language } from "@/hooks/useTranslation";

interface PropertyLocationMapProps {
  latitude: number;
  longitude: number;
  title: string;
  language: Language;
  className?: string;
}

export const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({
  latitude,
  longitude,
  title,
  language,
  className = "w-full h-64 rounded-lg"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const { mapLoaded } = useMapLoader(language);

  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || map.current) return;

    // Initialize map
    map.current = new window.ymaps.Map(mapContainer.current, {
      center: [latitude, longitude],
      zoom: 15,
      controls: ['zoomControl']
    });

    // Create custom pin image like main map
    const composePinImage = () => {
      const WIDTH = 44;
      const HEIGHT = 60;
      const canvas = document.createElement('canvas');
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Draw teardrop pin shape
      ctx.beginPath();
      ctx.moveTo(22, 58);
      ctx.quadraticCurveTo(44, 38, 22, 10);
      ctx.quadraticCurveTo(0, 38, 22, 58);
      ctx.closePath();
      ctx.fillStyle = 'hsl(24 95% 53%)'; // brand orange like main map
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'hsl(0 0% 100% / 0.5)';
      ctx.stroke();

      // Inner circle for accent
      ctx.beginPath();
      ctx.arc(22, 22, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(0 0% 100% / 0.85)';
      ctx.fill();

      return canvas.toDataURL('image/png');
    };

    // Add placemark for the property with custom icon
    const placemark = new window.ymaps.Placemark([latitude, longitude], {
      balloonContent: title,
      hintContent: title
    }, {
      iconLayout: 'default#image',
      iconImageHref: composePinImage(),
      iconImageSize: [44, 60],
      iconImageOffset: [-22, -60]
    });

    map.current.geoObjects.add(placemark);

    // Disable all interactions except zoom
    map.current.behaviors.disable(['drag', 'scrollZoom', 'dblClickZoom', 'multiTouch']);
    
    // Disable click events on map features (like metro stations)
    map.current.options.set('suppressMapOpenBlock', true);
    
    // Remove POI clicks by disabling objectManager
    map.current.setType('yandex#map', {
      restrictMapTypeChange: true
    });

    return () => {
      if (map.current) {
        map.current.destroy();
        map.current = null;
      }
    };
  }, [mapLoaded, latitude, longitude, title]);

  if (!mapLoaded) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <div className="text-muted-foreground text-sm">Loading map...</div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} />;
};