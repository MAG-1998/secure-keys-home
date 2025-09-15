import { memo, useMemo } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyCardPreloader } from '@/components/PropertyCardPreloader';

interface Property {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  price: number;
  location: string;
  district?: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  land_area_sotka?: number;
  is_halal_available?: boolean;
  halal_status?: string;
  title?: string;
  description?: string;
  status?: string;
  image_url?: string;
  photos?: any;
  display_name?: string;
  is_verified?: boolean;
  property_photos?: any[];
  isHalal?: boolean;
  [key: string]: any;
}

interface VirtualizedPropertyListProps {
  properties: Property[];
  currentPage: number;
  itemsPerPage: number;
}

const VirtualizedPropertyList = memo(({ 
  properties, 
  currentPage, 
  itemsPerPage 
}: VirtualizedPropertyListProps) => {
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return properties.slice(startIndex, startIndex + itemsPerPage);
  }, [properties, currentPage, itemsPerPage]);

  const preloadProperties = useMemo(() => {
    // Preload next page properties for smooth scrolling
    const nextPageStart = currentPage * itemsPerPage;
    return properties.slice(nextPageStart, nextPageStart + itemsPerPage);
  }, [properties, currentPage, itemsPerPage]);

  return (
    <>
      <PropertyCardPreloader properties={preloadProperties} preloadDistance={10} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedResults.map((property) => (
          <PropertyCard
            key={property.id}
            id={property.id}
            title={property.display_name || property.title || 'Property'}
            location={property.location}
            price={property.price}
            priceUsd={property.price}
            bedrooms={property.bedrooms || 0}
            bathrooms={property.bathrooms || 0}
            area={property.area || 0}
            landAreaSotka={property.land_area_sotka}
            propertyType={property.property_type}
            imageUrl={property.image_url || property.property_photos?.[0]?.url}
            property={{...property, property_photos: property.property_photos}}
            isVerified={property.is_verified || false}
            isHalalFinanced={property.isHalal}
          />
        ))}
      </div>
    </>
  );
});

VirtualizedPropertyList.displayName = 'VirtualizedPropertyList';

export { VirtualizedPropertyList };