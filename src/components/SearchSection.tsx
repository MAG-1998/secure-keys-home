import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Bed, DollarSign, Sparkles, Filter, Square, Wallet, TrendingUp } from "lucide-react"

interface SearchSectionProps {
  isHalalMode: boolean
  onHalalModeChange: (enabled: boolean) => void
}

export const SearchSection = ({ isHalalMode, onHalalModeChange }: SearchSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showAllProperties, setShowAllProperties] = useState(false)
  const [cashAmount, setCashAmount] = useState("")
  const [monthlyPayment, setMonthlyPayment] = useState("")
  const [monthlySalary, setMonthlySalary] = useState("")

  return (
    <section className={`py-12 transition-all duration-500 ${
      isHalalMode 
        ? 'bg-gradient-to-br from-magit-trust/10 to-primary/10' 
        : 'bg-gradient-to-br from-background/50 to-muted/20'
    }`}>
      <div className="container mx-auto px-4">
        {/* Halal Mode Toggle - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
          <Card className={`p-3 border-0 shadow-soft transition-all duration-500 ${
            isHalalMode ? 'bg-magit-trust/10' : 'bg-background'
          }`}>
            <div className="flex items-center space-x-2">
              <Label htmlFor="halal-mode" className="text-xs font-medium whitespace-nowrap">
                Halal Mode
              </Label>
              <Switch
                id="halal-mode"
                checked={isHalalMode}
                onCheckedChange={onHalalModeChange}
                className="data-[state=checked]:bg-magit-trust"
              />
              {isHalalMode && (
                <Badge variant="trust" className="text-xs animate-fade-in">
                  ✓ Halal
                </Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Main Search */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
              {isHalalMode ? "Find Halal-Financed Homes" : "Search Verified Properties"}
            </h2>
            <p className="text-muted-foreground">
              {isHalalMode 
                ? "Discover homes with Sharia-compliant financing options"
                : "AI-powered search across 1,500+ verified properties"
              }
            </p>
          </div>

          <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-warm">
            <CardContent className="p-6">
              {/* Main Search Bar */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tell us what you're looking for... (e.g., '3-bedroom near metro with garden')"
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
                  Search
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
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
                    ✓ Halal Financing
                  </Button>
                )}
              </div>

              {/* Halal Financing Inputs */}
              {isHalalMode && (
                <div className="border-t pt-4 mb-4 animate-fade-in">
                  <div className="bg-magit-trust/5 p-4 rounded-lg">
                    <h3 className="font-medium text-sm mb-3 flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      Your Financial Profile
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Cash Available ($)</Label>
                        <Input
                          placeholder="e.g., 15,000"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Monthly Payment ($)</Label>
                        <Input
                          placeholder="e.g., 500"
                          value={monthlyPayment}
                          onChange={(e) => setMonthlyPayment(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Monthly Salary ($)</Label>
                        <Input
                          placeholder="e.g., 2,000"
                          value={monthlySalary}
                          onChange={(e) => setMonthlySalary(e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="show-all"
                        checked={showAllProperties}
                        onCheckedChange={setShowAllProperties}
                      />
                      <Label htmlFor="show-all" className="text-sm">
                        Show all properties (not just what I can afford)
                      </Label>
                      {!showAllProperties && cashAmount && monthlyPayment && (
                        <Badge variant="trust" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Smart Match
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
                      <Label className="text-sm font-medium mb-2 block">District</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose district" />
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
                      <Label className="text-sm font-medium mb-2 block">Price Range</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget" />
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
                      <Label className="text-sm font-medium mb-2 block">Square Meters</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Size" />
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
                      <Label className="text-sm font-medium mb-2 block">Property Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
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
            <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                3-bedroom Yunusobod
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                New construction Chilonzor
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                Apartment with parking
              </Badge>
              {isHalalMode && (
                <Badge variant="trust" className="cursor-pointer">
                  Halal financing available
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}