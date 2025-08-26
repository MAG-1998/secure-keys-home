import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LazyMapSection from "./LazyMapSection";
import { PropertyCard } from "./PropertyCard";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { calculateHalalFinancing, formatCurrency, getPeriodOptions } from "@/utils/halalFinancing";
import { toast } from "@/hooks/use-toast";
import type { Language } from "@/hooks/useTranslation";

interface UnifiedSearchMapProps {
  isHalalMode: boolean;
  onHalalModeChange: (enabled: boolean) => void;
  t: (key: string) => string;
  language: Language;
}

export const UnifiedSearchMap = ({ 
  isHalalMode, 
  onHalalModeChange, 
  t, 
  language 
}: UnifiedSearchMapProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    filters, 
    financingFilters, 
    updateFilter, 
    updateFinancingFilter,
    hasActiveFilters,
    clearFilters,
    applyFiltersToQuery 
  } = useSearchFilters();

  // Halal financing validation
  const validateHalalFinancing = useCallback((propertyPrice: number, cashAvailable: number) => {
    if (isHalalMode && cashAvailable < 0.5 * propertyPrice) {
      toast({
        title: "Недостаточно средств",
        description: "Для халяль-финансирования нужно внести не менее 50% от стоимости.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [isHalalMode]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const enhancedQuery = applyFiltersToQuery(searchQuery);
      // Mock search results for now - replace with actual API call
      const mockResults = [
        {
          id: '1',
          title: 'Modern Apartment in Tashkent',
          location: 'Yunusabad District',
          priceUsd: 120000,
          bedrooms: 3,
          bathrooms: 2,
          area: 85,
          verified: true,
          financingAvailable: true,
          image_url: '/placeholder.svg'
        }
      ];
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, applyFiltersToQuery]);

  // Handle property navigation with financing params
  const handlePropertyClick = useCallback((propertyId: string, propertyPrice?: number) => {
    const params = new URLSearchParams();
    
    if (isHalalMode) {
      params.set('halal', '1');
      if (financingFilters.cashAmount) {
        const cashValue = parseFloat(financingFilters.cashAmount);
        if (propertyPrice && !validateHalalFinancing(propertyPrice, cashValue)) {
          return; // Block navigation if validation fails
        }
        params.set('cash', financingFilters.cashAmount);
      }
      if (financingFilters.financingPeriod) {
        params.set('period', financingFilters.financingPeriod);
      }
    }
    
    const queryString = params.toString();
    navigate(`/property/${propertyId}${queryString ? `?${queryString}` : ''}`);
  }, [isHalalMode, financingFilters, navigate, validateHalalFinancing]);

  // Display limited results (up to 10)
  const displayResults = useMemo(() => {
    return searchResults.slice(0, 10);
  }, [searchResults]);

  const hasMoreResults = searchResults.length > 10;

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Input and Halal Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="halal-mode"
                    checked={isHalalMode}
                    onCheckedChange={onHalalModeChange}
                  />
                  <label htmlFor="halal-mode" className="text-sm font-medium">
                    {t('features.halalFinancing')}
                  </label>
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? t('search.searching') : t('search.search')}
                </Button>
              </div>
            </div>

            {/* Filters Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {t('filter.filters')}
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.values(filters).filter(v => v !== undefined && v !== '' && v !== false).length}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  {t('filter.clear')}
                </Button>
              )}
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('filter.district')}</label>
                    <Select value={filters.district || ''} onValueChange={(value) => updateFilter('district', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('filter.allDistricts')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('filter.allDistricts')}</SelectItem>
                        <SelectItem value="Yunusabad">Yunusabad</SelectItem>
                        <SelectItem value="Chilanzar">Chilanzar</SelectItem>
                        <SelectItem value="Shaykhantakhur">Shaykhantakhur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('filter.priceRange')}</label>
                    <Select value={filters.priceRange || ''} onValueChange={(value) => updateFilter('priceRange', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('filter.anyPrice')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('filter.anyPrice')}</SelectItem>
                        <SelectItem value="0-50000">$0 - $50k</SelectItem>
                        <SelectItem value="50000-100000">$50k - $100k</SelectItem>
                        <SelectItem value="100000-200000">$100k - $200k</SelectItem>
                        <SelectItem value="200000+">$200k+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('filter.bedrooms')}</label>
                    <Select value={filters.bedrooms || ''} onValueChange={(value) => updateFilter('bedrooms', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('filter.anyBedrooms')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('filter.anyBedrooms')}</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parking"
                      checked={filters.hasParking || false}
                      onCheckedChange={(checked) => updateFilter('hasParking', checked)}
                    />
                    <label htmlFor="parking" className="text-sm font-medium">
                      {t('filter.hasParking')}
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new-construction"
                      checked={filters.isNewConstruction || false}
                      onCheckedChange={(checked) => updateFilter('isNewConstruction', checked)}
                    />
                    <label htmlFor="new-construction" className="text-sm font-medium">
                      {t('filter.newConstruction')}
                    </label>
                  </div>
                </div>

                {/* Halal Financing Filters */}
                {isHalalMode && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">{t('financing.title')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('financing.cashAvailable')}</label>
                        <Input
                          type="number"
                          placeholder="$50,000"
                          value={financingFilters.cashAmount || ''}
                          onChange={(e) => updateFinancingFilter('cashAmount', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('financing.monthlyPayment')}</label>
                        <Input
                          type="number"
                          placeholder="$500"
                          value={financingFilters.monthlyPayment || ''}
                          onChange={(e) => updateFinancingFilter('monthlyPayment', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('financing.period')}</label>
                        <Select 
                          value={financingFilters.financingPeriod || ''} 
                          onValueChange={(value) => updateFinancingFilter('financingPeriod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('financing.selectPeriod')} />
                          </SelectTrigger>
                          <SelectContent>
                            {getPeriodOptions().map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Section */}
      <Card>
        <CardContent className="p-0">
          <LazyMapSection 
            t={t} 
            isHalalMode={isHalalMode} 
            language={language}
            searchResults={searchResults}
            onSearchResultsChange={setSearchResults}
          />
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-xl">{t('search.propertiesFound')}</h3>
              <Badge variant="secondary">
                {searchResults.length} {t('search.results')}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {displayResults.map((property) => (
                <div key={property.id} onClick={() => handlePropertyClick(property.id, property.priceUsd)}>
                  <PropertyCard
                    id={property.id}
                    title={property.title}
                    location={property.location}
                    price={formatCurrency(property.priceUsd)}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    area={property.area}
                    imageUrl={property.image_url}
                    isVerified={property.verified}
                    isHalalFinanced={property.financingAvailable}
                  />
                </div>
              ))}
            </div>

            {hasMoreResults && (
              <div className="text-center">
                <Button 
                  onClick={() => navigate('/all-results', { 
                    state: { 
                      searchQuery, 
                      searchResults, 
                      filters, 
                      financingFilters,
                      isHalalMode 
                    } 
                  })}
                  variant="outline"
                  className="px-8"
                >
                  {t('search.viewAllResults')} ({searchResults.length - 10} {t('search.more')})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};