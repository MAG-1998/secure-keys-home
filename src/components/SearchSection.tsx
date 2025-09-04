import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Bed, DollarSign, Sparkles, Filter, Square, Wallet, TrendingUp, Clock, X, Star, BookmarkPlus, Calculator, ChevronDown, Home, Bath, Building } from "lucide-react"
import { PropertyCard } from "@/components/PropertyCard"
import { useScroll } from "@/hooks/use-scroll"
import { toast } from "@/components/ui/use-toast"
import { debounce } from "@/utils/debounce"
import { useSearchHistory } from "@/hooks/useSearchHistory"
import { getDistrictOptions } from "@/lib/districts"
import { calculateHalalFinancing, formatCurrency, getPeriodOptions, calculatePropertyPriceFromCash, calculateCashFromMonthlyPayment } from "@/utils/halalFinancing"
import { useHalalFinancingStore } from "@/hooks/useHalalFinancingStore"
import { useNavigate } from "react-router-dom"
import { useSearchStore } from "@/hooks/useSearchStore"

interface SearchSectionProps {
  isHalalMode: boolean
  onHalalModeChange: (enabled: boolean) => void
  t: (key: string) => string
}

export const SearchSection = ({ isHalalMode, onHalalModeChange, t }: SearchSectionProps) => {
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { scrollY } = useScroll()
  const { 
    history, 
    savedSearches, 
    addToHistory, 
    saveSearch, 
    getRecentSearches,
    getSearchSuggestions 
  } = useSearchHistory()
  
  // Use unified search store
  const { 
    filters, 
    results, 
    loading: searchLoading, 
    setFilters, 
    performSearch 
  } = useSearchStore()

  const [aiSuggestion, setAiSuggestion] = useState("")
  
  // Get period options for dropdown with translation support
  const periodOptions = getPeriodOptions(t)
  
  // Calculate financing results and property price
  const financingCalculation = useMemo(() => {
    if (!filters.periodMonths) {
      return null;
    }
    
    const periodMonths = parseInt(filters.periodMonths) || 0;
    let propertyPrice = 50000; // default
    let cashAvailable = 0;
    
    // Calculate property price and cash available based on available inputs
    if (filters.cashAvailable) {
      cashAvailable = parseFloat(filters.cashAvailable.replace(/,/g, '')) || 0;
      propertyPrice = calculatePropertyPriceFromCash(cashAvailable);
    }
    
    return calculateHalalFinancing(cashAvailable, propertyPrice, periodMonths);
  }, [filters.cashAvailable, filters.periodMonths])

  // District options for current language  
  const districtOptions = useMemo(() => {
    // Extract language from translation function - check if it returns Russian
    const testKey = 'common.signOut'
    const russianText = 'Выйти'
    const currentLang = t(testKey) === russianText ? 'ru' : 
                       t(testKey) === 'Chiqish' ? 'uz' : 'en'
    return getDistrictOptions(currentLang as any)
  }, [t])

  // Search suggestions based on input
  const searchSuggestions = useMemo(() => {
    if (!filters.q || filters.q.length < 2) return []
    return getSearchSuggestions(filters.q)
  }, [filters.q, getSearchSuggestions])

  // Debounced search for auto-suggestions
  const debouncedShowSuggestions = useMemo(
    () => debounce(() => {
      setShowSuggestions((filters.q?.length || 0) >= 2 && searchSuggestions.length > 0)
    }, 300),
    [filters.q, searchSuggestions.length]
  )

  // Show suggestions when typing
  useEffect(() => {
    debouncedShowSuggestions()
    return () => debouncedShowSuggestions.flush()
  }, [debouncedShowSuggestions])

  // Debounced filter search
  const debouncedFilterSearch = useMemo(
    () => debounce(() => {
      performSearch()
    }, 300),
    [performSearch]
  )

  const navigate = useNavigate()
  const halalStore = useHalalFinancingStore()

  // Sync halal financing state with store and filters
  useEffect(() => {
    setFilters({ halalMode: isHalalMode })
    if (isHalalMode) {
      setFilters({
        cashAvailable: halalStore.cashAvailable,
        periodMonths: halalStore.periodMonths
      })
    }
  }, [isHalalMode, halalStore.cashAvailable, halalStore.periodMonths, setFilters])

  // Update halal store when filters change
  useEffect(() => {
    if (isHalalMode && filters.cashAvailable) {
      halalStore.updateState({ cashAvailable: filters.cashAvailable })
    }
    if (isHalalMode && filters.periodMonths) {
      halalStore.updateState({ periodMonths: filters.periodMonths })
    }
  }, [filters.cashAvailable, filters.periodMonths, isHalalMode, halalStore])

  // Auto-search when filters change (debounced)
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      debouncedFilterSearch()
    }
  }, [filters, debouncedFilterSearch])

  // Handle property click with halal validation
  const handlePropertyClick = (property: any) => {
    if (isHalalMode && filters.cashAvailable) {
      const cashValue = parseFloat(filters.cashAvailable.replace(/,/g, '')) || 0;
      const propertyPrice = property.priceUsd || 0;
      
      if (cashValue < 0.5 * propertyPrice) {
        toast({
          title: "Недостаточно средств",
          description: "Для халяль-финансирования нужно внести не менее 50% от стоимости.",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Navigate with halal financing parameters
    const params = new URLSearchParams();
    if (isHalalMode) {
      params.set('halal', '1');
      if (filters.cashAvailable) {
        params.set('cash', filters.cashAvailable);
      }
      if (filters.periodMonths) {
        params.set('period', filters.periodMonths);
      }
    }
    
    const queryString = params.toString();
    navigate(`/property/${property.id}${queryString ? `?${queryString}` : ''}`);
  };

  const handleSearch = async (queryOverride?: string) => {
    const q = queryOverride || filters.q || ""
    
    setShowSuggestions(false)
    setShowSearchHistory(false)

    // Update query in filters and perform search
    await performSearch({ q: q.trim() })
    
    const count = results.length
    const suggestion = count > 0 
      ? `Найдено ${count} объектов недвижимости` 
      : 'Попробуйте изменить параметры поиска'

    setAiSuggestion(suggestion)
    
    // Add to search history
    addToHistory({
      query: q,
      filters: Object.keys(filters).length > 1 ? filters : undefined,
      isHalalMode,
      resultCount: count
    })

    toast({ 
      title: `Найдено: ${count}`, 
      description: suggestion 
    })
  }

  const handleSuggestionClick = (suggestion: string) => {
    setFilters({ q: suggestion })
    setShowSuggestions(false)
    handleSearch(suggestion)
  }

  const handleSaveSearch = () => {
    if (!filters.q?.trim()) return
    
    const searchItem = {
      id: Date.now().toString(),
      query: filters.q,
      filters: Object.keys(filters).length > 1 ? filters : undefined,
      timestamp: Date.now(),
      isHalalMode,
      resultCount: results.length
    }
    
    saveSearch(searchItem)
    toast({ title: 'Поиск сохранён', description: 'Добавлен в избранные запросы' })
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value })
  }

  const scrollProgress = Math.min(scrollY / 300, 1)

  return (
    <div className="w-full">
      <div className={`transition-all duration-500 ${
        isHalalMode 
          ? 'bg-gradient-to-br from-magit-trust/10 to-primary/10 rounded-lg' 
          : 'bg-gradient-to-br from-background/50 to-muted/20 rounded-lg'
      } p-4 md:p-6`}>
      <div className="space-y-6">
        {/* Header with Halal Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="font-heading font-bold text-xl md:text-2xl text-foreground">
              {isHalalMode ? t('search.titleHalal') : t('search.titleStandard')}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isHalalMode 
                ? t('search.descHalal')
                : t('search.descStandard')
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-4 shrink-0 relative">
            {isHalalMode && (
              <Badge 
                variant="trust" 
                className="text-xs whitespace-nowrap animate-fade-in hover:scale-105 transition-transform duration-200 shadow-md absolute -left-32 top-1/2 -translate-y-1/2 sm:block hidden md:block lg:block xl:block 2xl:block"
              >
                {t('search.halalBadge')}
              </Badge>
            )}
            {isHalalMode && (
              <Badge 
                variant="trust" 
                className="text-xs whitespace-nowrap animate-fade-in hover:scale-105 transition-transform duration-200 shadow-md absolute top-full left-1/2 -translate-x-1/2 mt-2 sm:hidden block"
              >
                {t('search.halalBadge')}
              </Badge>
            )}
            <div className={`apple-glow-container flex items-center space-x-3 rounded-full px-4 py-2 ${
              isHalalMode 
                ? 'apple-glow-active' 
                : 'apple-glow-inactive'
            }`}>
               <Label 
                 htmlFor="halal-mode" 
                 className="relative whitespace-nowrap cursor-pointer transition-all duration-300"
               >
                 <span className="absolute inset-0 text-sm font-normal text-foreground/80">
                   {t("search.halalMode")}
                 </span>
                 <span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                   isHalalMode 
                     ? 'apple-text-glow-orange' 
                     : 'apple-text-glow-cyan'
                 }`}>
                   {t("search.halalMode")}
                 </span>
               </Label>
              <Switch
                id="halal-mode"
                checked={isHalalMode}
                onCheckedChange={onHalalModeChange}
                className={`transition-all duration-300 ${
                  isHalalMode 
                    ? 'apple-switch-orange' 
                    : 'apple-switch-cyan'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Main Search */}
        <div>
          <Card 
            className="bg-background/80 backdrop-blur-sm border-0 shadow-warm"
          >
            <CardContent className="p-6">
              {/* Main Search Bar */}
              <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('search.placeholder')}
                      value={filters.q || ''}
                      onChange={(e) => handleFilterChange('q', e.target.value)}
                      onFocus={() => setShowSearchHistory(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSearch()
                        }
                        if (e.key === 'Escape') {
                          setShowSuggestions(false)
                          setShowSearchHistory(false)
                        }
                      }}
                      className="pl-10 h-12 text-base"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {filters.q && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={handleSaveSearch}
                        >
                          <BookmarkPlus className="h-3 w-3" />
                        </Button>
                      )}
                      <Badge variant="warning" className={`text-xs ${isHalalMode ? 'bg-magit-trust text-white' : ''}`}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    </div>

                  {/* Search Suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
                      {searchSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion.query)}
                          className="w-full px-3 py-2 text-left hover:bg-muted text-sm flex items-center gap-2"
                        >
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {suggestion.query}
                          {suggestion.resultCount && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {suggestion.resultCount}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Search History */}
                  {showSearchHistory && !showSuggestions && (filters.q?.length || 0) < 2 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
                      <div className="px-3 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Недавние поиски</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setShowSearchHistory(false)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {getRecentSearches(5).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSuggestionClick(item.query)}
                          className="w-full px-3 py-2 text-left hover:bg-muted text-sm flex items-center gap-2"
                        >
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {item.query}
                          {item.isHalalMode && (
                            <Badge variant="trust" className="text-xs">Халяль</Badge>
                          )}
                          {item.resultCount && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {item.resultCount}
                            </Badge>
                          )}
                        </button>
                      ))}
                      {savedSearches.length > 0 && (
                        <>
                          <div className="px-3 py-1 border-t">
                            <span className="text-xs font-medium text-muted-foreground">Избранные</span>
                          </div>
                          {savedSearches.slice(0, 3).map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleSuggestionClick(item.query)}
                              className="w-full px-3 py-2 text-left hover:bg-muted text-sm flex items-center gap-2"
                            >
                              <Star className="h-3 w-3 text-yellow-500" />
                              {item.query}
                              {item.isHalalMode && (
                                <Badge variant="trust" className="text-xs">Халяль</Badge>
                              )}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  size="lg" 
                  className={`px-8 shadow-warm ${
                    isHalalMode 
                      ? 'bg-magit-trust hover:bg-magit-trust/90 text-white' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  } transition-all duration-300`}
                  onClick={() => handleSearch()} 
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Поиск...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Найти
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Always Visible Filters */}
          <Card className="bg-background/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">{t('search.filters')}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* District Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t('filter.district')}
                    </Label>
                    <Select 
                      value={filters.district || 'all'} 
                      onValueChange={(value) => handleFilterChange('district', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('filter.chooseDistrict')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.any')}</SelectItem>
                        {districtOptions.map((district) => (
                          <SelectItem key={district.value} value={district.value}>
                            {district.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {t('filter.propertyType')}
                    </Label>
                    <Select 
                      value={filters.propertyType || 'all'} 
                      onValueChange={(value) => handleFilterChange('propertyType', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('filter.chooseType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.any')}</SelectItem>
                        <SelectItem value="house">{t('filter.house')}</SelectItem>
                        <SelectItem value="apartment">{t('filter.apartment')}</SelectItem>
                        <SelectItem value="studio">{t('filter.studio')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      {t('filter.bedrooms')}
                    </Label>
                    <Select 
                      value={filters.bedrooms || 'all'} 
                      onValueChange={(value) => handleFilterChange('bedrooms', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('filter.chooseBedrooms')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.any')}</SelectItem>
                        <SelectItem value="0">0+</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t('filter.priceRange')}
                    </Label>
                     <div className="flex gap-2">
                       <Input
                         placeholder={t('filter.min')}
                         value={filters.priceMin || ''}
                         onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                         className="flex-1"
                       />
                       <Input
                         placeholder={t('filter.max')}
                         value={filters.priceMax || ''}
                         onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                         className="flex-1"
                       />
                     </div>
                  </div>
                </div>

                {/* Halal Financing Section */}
                {isHalalMode && (
                  <div className="space-y-4 p-4 bg-magit-trust/5 rounded-lg border border-magit-trust/20">
                    <h4 className="font-medium text-magit-trust flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      {t('halal.financing')}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cash Available */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          {t('halal.cashAvailable')}
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="35,000"
                            value={filters.cashAvailable || ''}
                            onChange={(e) => handleFilterChange('cashAvailable', e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      {/* Financing Period */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {t('halal.financingPeriod')}
                        </Label>
                        <Select 
                          value={filters.periodMonths || '12'} 
                          onValueChange={(value) => handleFilterChange('periodMonths', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {periodOptions.map((option) => (
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
            </CardContent>
          </Card>


          {/* Search Results */}
          {results.length > 0 && (
            <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-warm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    {results.length} {isHalalMode ? t('search.eligibleProperties') : t('search.propertiesFound')}
                  </h3>
                  {results.length >= 10 && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/all-results')}
                      className="flex items-center gap-2"
                    >
                      {t('search.viewAll')}
                    </Button>
                  )}
                </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                    {results.slice(0, 18).map((property) => (
                      <PropertyCard
                        key={property.id}
                        id={property.id}
                        title={property.title}
                        location={property.location}
                        price={property.priceUsd}
                        priceUsd={property.priceUsd}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        area={property.area}
                        imageUrl={property.image_url}
                        isVerified={property.verified}
                        isHalalFinanced={property.financingAvailable}
                        isHalalMode={isHalalMode}
                        cashAvailable={filters.cashAvailable ? parseFloat(filters.cashAvailable.replace(/[^0-9.]/g, '')) : undefined}
                        financingPeriod={filters.periodMonths ? parseInt(filters.periodMonths) : undefined}
                        onClick={() => handlePropertyClick(property)}
                      />
                    ))}
                  </div>

                  {/* View All Properties Button */}
                  <div className="flex justify-center mt-8">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => navigate('/properties')}
                      className="px-8"
                    >
                      {t('common.viewAllProperties')}
                    </Button>
                  </div>

                {aiSuggestion && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Badge variant="warning" className="mt-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                      <p className="text-sm text-muted-foreground">{aiSuggestion}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}