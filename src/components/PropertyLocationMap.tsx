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
      controls: ['zoomControl', 'typeSelector']
    });

    // Add placemark for the property
    const placemark = new window.ymaps.Placemark([latitude, longitude], {
      balloonContent: title,
      hintContent: title
    }, {
      preset: 'islands#redDotIcon'
    });

    map.current.geoObjects.add(placemark);

    // Disable drag
    map.current.behaviors.disable('drag');

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