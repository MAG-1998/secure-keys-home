import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Bed, DollarSign, Sparkles, Filter, Square, Wallet, TrendingUp, Clock, X, Star, BookmarkPlus, Calculator } from "lucide-react"
import { useScroll } from "@/hooks/use-scroll"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { debounce } from "@/utils/debounce"
import { useSearchHistory } from "@/hooks/useSearchHistory"
import { useSearchFilters } from "@/hooks/useSearchFilters"
import { useSearchCache } from "@/hooks/useSearchCache"
import { getDistrictOptions } from "@/lib/districts"
import { calculateHalalFinancing, formatCurrency, getPeriodOptions } from "@/utils/halalFinancing"

interface SearchSectionProps {
  isHalalMode: boolean
  onHalalModeChange: (enabled: boolean) => void
  t: (key: string) => string
}

export const SearchSection = ({ isHalalMode, onHalalModeChange, t }: SearchSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
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
  
  const { 
    filters, 
    financingFilters, 
    updateFilter, 
    updateFinancingFilter,
    hasActiveFilters,
    getFilterCount,
    applyFiltersToQuery
  } = useSearchFilters()
  
  const { getCachedResult, setCachedResult } = useSearchCache()

  const [searchLoading, setSearchLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [resultMode, setResultMode] = useState<"strict" | "relaxed" | null>(null)
  
  // Get period options for dropdown
  const periodOptions = getPeriodOptions()
  
  // Calculate financing results
  const financingCalculation = useMemo(() => {
    if (!financingFilters.cashAmount || !financingFilters.financingPeriod) {
      return null;
    }
    
    const cashAvailable = parseFloat(financingFilters.cashAmount.replace(/,/g, '')) || 0;
    const periodMonths = parseInt(financingFilters.financingPeriod) || 0;
    
    // Use average property price of $50k for calculation demo
    const averagePropertyPrice = 50000;
    
    return calculateHalalFinancing(cashAvailable, averagePropertyPrice, periodMonths);
  }, [financingFilters.cashAmount, financingFilters.financingPeriod])
  
  // Update calculated values when calculation changes
  useEffect(() => {
    if (financingCalculation) {
      updateFinancingFilter('calculatedMonthlyPayment', financingCalculation.requiredMonthlyPayment);
      updateFinancingFilter('totalFinancingCost', financingCalculation.totalCost);
    }
  }, [financingCalculation, updateFinancingFilter])

  // District options for current language  
  const districtOptions = useMemo(() => {
    const lang = 'ru' // You can make this dynamic based on current language
    return getDistrictOptions(lang as any)
  }, [])

  // Search suggestions based on input
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return []
    return getSearchSuggestions(searchQuery)
  }, [searchQuery, getSearchSuggestions])

  // Debounced search for auto-suggestions
  const debouncedShowSuggestions = useMemo(
    () => debounce(() => {
      setShowSuggestions(searchQuery.length >= 2 && searchSuggestions.length > 0)
    }, 300),
    [searchQuery, searchSuggestions.length]
  )

  // Show suggestions when typing
  useEffect(() => {
    debouncedShowSuggestions()
    return () => debouncedShowSuggestions.flush()
  }, [debouncedShowSuggestions])

  const handleSearch = async (queryOverride?: string) => {
    const q = (queryOverride || searchQuery).trim()
    
    // In halal mode, require financing period
    if (isHalalMode && !financingFilters.financingPeriod) {
      toast({ title: 'Период обязателен', description: 'Выберите период финансирования для халяль поиска' })
      return
    }

    setShowSuggestions(false)
    setShowSearchHistory(false)

    try {
      setSearchLoading(true)
      
      // Use basic database search instead of AI
      const { performBasicSearch } = await import('@/utils/basicSearch')
      const results = await performBasicSearch(q, filters, financingFilters, isHalalMode)

      const count = results.length
      const suggestion = count > 0 
        ? `Найдено ${count} объектов недвижимости` 
        : 'Попробуйте изменить параметры поиска'
      const mode = 'strict'

      setResults(results)
      setAiSuggestion(suggestion)
      setResultMode(mode)

      // Cache the results
      const cacheKey = { query: q, filters, financingFilters, isHalalMode }
      setCachedResult(q, cacheKey, results, suggestion, mode)

      // Add to search history
      addToHistory({
        query: q,
        filters: hasActiveFilters ? filters : undefined,
        isHalalMode,
        resultCount: count
      })

      toast({ 
        title: `Найдено: ${count}`, 
        description: suggestion 
      })
    } catch (e: any) {
      toast({ title: 'Ошибка поиска', description: e?.message || 'Не удалось выполнить поиск' })
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    handleSearch(suggestion)
  }

  const handleSaveSearch = () => {
    if (!searchQuery.trim()) return
    
    const searchItem = {
      id: Date.now().toString(),
      query: searchQuery,
      filters: hasActiveFilters ? filters : undefined,
      timestamp: Date.now(),
      isHalalMode,
      resultCount: results.length
    }
    
    saveSearch(searchItem)
    toast({ title: 'Поиск сохранён', description: 'Добавлен в избранные запросы' })
  }

  const scrollProgress = Math.min(scrollY / 300, 1)

  return (
    <section className={`py-12 transition-all duration-500 ${
      isHalalMode 
        ? 'bg-gradient-to-br from-magit-trust/10 to-primary/10' 
        : 'bg-gradient-to-br from-background/50 to-muted/20'
    }`}>
      <div className="container mx-auto px-4">
        {/* Halal Mode Toggle */}
        <div className="flex justify-center mb-8">
          <Card 
            className={`border border-border shadow-lg transition-colors duration-300 max-w-fit mx-auto ${
              isHalalMode ? 'bg-magit-trust/40' : 'bg-muted'
            }`}
            style={{
              padding: isHalalMode ? '16px' : '12px'
            }}
          >
            <div className={`flex items-center space-x-4 transition-all duration-300 ${
              isHalalMode ? 'w-[360px]' : 'w-[220px]'
            }`}>
              <Label htmlFor="halal-mode" className="text-sm font-medium whitespace-nowrap">
                {t('search.halalMode')}
              </Label>
              <div className="flex items-center space-x-3 ml-auto">
                <Switch
                  id="halal-mode"
                  checked={isHalalMode}
                  onCheckedChange={onHalalModeChange}
                  className="data-[state=checked]:bg-magit-trust data-[state=checked]:border-magit-trust dark:data-[state=checked]:border-white data-[state=unchecked]:border-border dark:data-[state=unchecked]:border-white/20 flex-shrink-0"
                />
                <div className={`transition-all duration-300 ${
                  isHalalMode ? 'w-32 opacity-100' : 'w-0 opacity-0 overflow-hidden'
                }`}>
                  <Badge variant="trust" className="text-xs whitespace-nowrap">
                    {t('search.halalBadge')}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Search */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
              {isHalalMode ? t('search.titleHalal') : t('search.titleStandard')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isHalalMode 
                ? t('search.descHalal')
                : t('search.descStandard')
              }
            </p>
          </div>

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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                    {searchQuery && (
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
                  {showSearchHistory && !showSuggestions && searchQuery.length < 2 && (
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
                <Button size="lg" className="px-8 shadow-warm" onClick={() => handleSearch()} disabled={searchLoading}>
                  {searchLoading ? 'Идёт поиск…' : t('search.searchBtn')}
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  variant={showFilters ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t('search.filters')}
                  {hasActiveFilters && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                      {getFilterCount()}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant={filters.district === 'yunusobod' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => updateFilter('district', filters.district === 'yunusobod' ? '' : 'yunusobod')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {t('search.yunusobod')}
                </Button>
                <Button 
                  variant={filters.bedrooms ? "default" : "outline"} 
                  size="sm"
                  onClick={() => updateFilter('bedrooms', filters.bedrooms ? '' : '2-3')}
                >
                  <Bed className="h-4 w-4 mr-2" />
                  {t('search.bedrooms')}
                </Button>
                <Button 
                  variant={filters.priceRange ? "default" : "outline"} 
                  size="sm"
                  onClick={() => updateFilter('priceRange', filters.priceRange ? '' : '$40k-60k')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {t('search.priceRange')}
                </Button>
                {isHalalMode && (
                  <Button variant="trust" size="sm">
                    {t('search.halalFinancing')}
                  </Button>
                )}
              </div>

              {/* Halal Financing Inputs */}
              {isHalalMode && (
                <div className="border-t pt-4 mb-4 animate-fade-in">
                  <div className="bg-magit-trust/5 p-4 rounded-lg">
                    <h3 className="font-medium text-sm mb-3 flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      {t('search.financialProfile')}
                    </h3>
                    <div className={`grid md:grid-cols-3 gap-4 mb-4 transition-all duration-300 ${
                      financingFilters.showAllProperties ? 'blur-sm pointer-events-none' : ''
                    }`}>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">{t('search.cashAvailable')}</Label>
                        <Input
                          placeholder="e.g., 15,000"
                          value={financingFilters.cashAmount || ''}
                          onChange={(e) => updateFinancingFilter('cashAmount', e.target.value)}
                          className="h-10"
                          disabled={financingFilters.showAllProperties}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">{t('search.monthlyPayment')}</Label>
                        <Input
                          placeholder="e.g., 500"
                          value={financingFilters.monthlyPayment || ''}
                          onChange={(e) => updateFinancingFilter('monthlyPayment', e.target.value)}
                          className="h-10"
                          disabled={financingFilters.showAllProperties}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">{t('search.financingPeriod')}</Label>
                        <Select 
                          value={financingFilters.financingPeriod || ''} 
                          onValueChange={(value) => updateFinancingFilter('financingPeriod', value)}
                          disabled={financingFilters.showAllProperties}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select period" />
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
                    
                    {/* Financing Calculator Results */}
                    {financingCalculation && financingCalculation.requiredMonthlyPayment > 0 && (
                      <div className="bg-muted/50 rounded-lg p-4 mb-4 border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <Calculator className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{t('search.breakdown')}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">{t('search.calculatedPayment')}:</span>
                            <div className="font-semibold text-lg text-primary">
                              {formatCurrency(financingCalculation.requiredMonthlyPayment)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('search.totalCost')}:</span>
                            <div className="font-semibold text-lg">
                              {formatCurrency(financingCalculation.totalCost)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                          Based on property price of $50,000 • Financing amount: {formatCurrency(financingCalculation.financingAmount)}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="show-all"
                        checked={financingFilters.showAllProperties || false}
                        onCheckedChange={(checked) => updateFinancingFilter('showAllProperties', checked)}
                        className={isHalalMode ? "data-[state=checked]:bg-magit-trust data-[state=checked]:border-magit-trust [&>span]:data-[state=unchecked]:bg-magit-trust" : "data-[state=checked]:bg-primary data-[state=checked]:border-primary"}
                      />
                      <Label htmlFor="show-all" className="text-sm">
                        {t('search.showAll')}
                      </Label>
                      {!financingFilters.showAllProperties && financingFilters.cashAmount && financingFilters.financingPeriod && (
                        <Badge variant="trust" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {t('search.smartMatch')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Filters */}
              {showFilters && (
                <div className="border-t pt-4 animate-fade-in">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">{t('filter.district')}</Label>
                      <Select value={filters.district || ''} onValueChange={(value) => updateFilter('district', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('filter.chooseDistrict')} />
                        </SelectTrigger>
                        <SelectContent>
                          {districtOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">{t('filter.priceRange')}</Label>
                      <Select value={filters.priceRange || ''} onValueChange={(value) => updateFilter('priceRange', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('filter.selectBudget')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30-40">$30k - $40k</SelectItem>
                          <SelectItem value="40-50">$40k - $50k</SelectItem>
                          <SelectItem value="50-70">$50k - $70k</SelectItem>
                          <SelectItem value="70+">$70k+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">{t('filter.squareMeters')}</Label>
                      <Select value={filters.area || ''} onValueChange={(value) => updateFilter('area', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('filter.size')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30-50">30-50 m²</SelectItem>
                          <SelectItem value="50-70">50-70 m²</SelectItem>
                          <SelectItem value="70-100">70-100 m²</SelectItem>
                          <SelectItem value="100+">100+ m²</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">{t('filter.propertyType')}</Label>
                      <Select value={filters.propertyType || ''} onValueChange={(value) => updateFilter('propertyType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('filter.type')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">{t('filter.apartment')}</SelectItem>
                          <SelectItem value="house">{t('filter.house')}</SelectItem>
                          <SelectItem value="studio">{t('filter.studio')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Searches */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">{t('search.popularSearches')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                {t('search.popular1')}
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                {t('search.popular2')}
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                {t('search.popular3')}
              </Badge>
              {isHalalMode && (
                <Badge variant="trust" className="cursor-pointer">
                  {t('search.popular4')}
                </Badge>
              )}
            </div>
          </div>

          {/* Results */}
          {resultMode && (
            <div className="mt-8">
              {resultMode === 'relaxed' && (
                <div className="rounded-md border border-yellow-300/60 bg-yellow-50/60 p-3 text-sm">
                  Прямых совпадений не нашли. Показали близкие варианты по вашему запросу.
                </div>
              )}
              {aiSuggestion && (
                <p className="mt-3 text-sm text-muted-foreground">{aiSuggestion}</p>
              )}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {results.map((p) => (
                  <Card key={p.id} className="border border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-foreground">{p.title}</div>
                          <div className="text-sm text-muted-foreground">{p.district || p.city}</div>
                        </div>
                        <div className="text-right font-semibold">${" "}{(p.priceUsd ?? 0).toLocaleString?.() || p.priceUsd}</div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {p.verified && <Badge variant="outline">Verified</Badge>}
                        {p.financingAvailable && <Badge variant="trust">Financing</Badge>}
                        {typeof p.bedrooms === 'number' && (
                          <Badge variant="outline">{p.bedrooms} спален</Badge>
                        )}
                      </div>
                      {p.whyGood && (
                        <p className="mt-3 text-xs text-muted-foreground">Почему подходит: {p.whyGood}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}