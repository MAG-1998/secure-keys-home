import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Bed, DollarSign, Sparkles, Filter, Square, Wallet, TrendingUp } from "lucide-react"
import { useScroll } from "@/hooks/use-scroll"

interface SearchSectionProps {
  isHalalMode: boolean
  onHalalModeChange: (enabled: boolean) => void
  t: (key: string) => string
}

export const SearchSection = ({ isHalalMode, onHalalModeChange, t }: SearchSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showAllProperties, setShowAllProperties] = useState(false)
  const [cashAmount, setCashAmount] = useState("")
  const [monthlyPayment, setMonthlyPayment] = useState("")
  const [monthlySalary, setMonthlySalary] = useState("")
  const { scrollY } = useScroll()

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
                  className="data-[state=checked]:bg-magit-trust flex-shrink-0"
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
                    className="pl-10 h-12 text-base"
                  />
                  <Badge variant="warning" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                </div>
                <Button size="lg" className="px-8 shadow-warm">
                  {t('search.searchBtn')}
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  {t('search.filters')}
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Yunusobod
                </Button>
                <Button variant="outline" size="sm">
                  <Bed className="h-4 w-4 mr-2" />
                  2-3 bedrooms
                </Button>
                <Button variant="outline" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  $40k-60k
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
                      showAllProperties ? 'blur-sm pointer-events-none' : ''
                    }`}>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">{t('search.cashAvailable')}</Label>
                        <Input
                          placeholder="e.g., 15,000"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                          className="h-10"
                          disabled={showAllProperties}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">{t('search.monthlyPayment')}</Label>
                        <Input
                          placeholder="e.g., 500"
                          value={monthlyPayment}
                          onChange={(e) => setMonthlyPayment(e.target.value)}
                          className="h-10"
                          disabled={showAllProperties}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">{t('search.monthlySalary')}</Label>
                        <Input
                          placeholder="e.g., 2,000"
                          value={monthlySalary}
                          onChange={(e) => setMonthlySalary(e.target.value)}
                          className="h-10"
                          disabled={showAllProperties}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="show-all"
                        checked={showAllProperties}
                        onCheckedChange={setShowAllProperties}
                        className={isHalalMode ? "data-[state=checked]:bg-magit-trust data-[state=checked]:border-magit-trust" : "data-[state=checked]:bg-primary data-[state=checked]:border-primary"}
                      />
                      <Label htmlFor="show-all" className="text-sm">
                        {t('search.showAll')}
                      </Label>
                      {!showAllProperties && cashAmount && monthlyPayment && (
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
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={t('filter.chooseDistrict')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yunusobod">Yunusobod</SelectItem>
                          <SelectItem value="chilonzor">Chilonzor</SelectItem>
                          <SelectItem value="shaykhontohur">Shaykhontohur</SelectItem>
                          <SelectItem value="mirzo-ulugbek">Mirzo Ulugbek</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">{t('filter.priceRange')}</Label>
                      <Select>
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
                      <Select>
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
                      <Select>
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
        </div>
      </div>
    </section>
  )
}