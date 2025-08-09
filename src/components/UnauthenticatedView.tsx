import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MagitLogo } from "@/components/MagitLogo"
import { FeatureCard } from "@/components/FeatureCard"
import LazyMapSection from "@/components/LazyMapSection"
import { SearchSection } from "@/components/SearchSection"
import { Footer } from "@/components/Footer"
import { useScroll } from "@/hooks/use-scroll"
import { useIsMobile } from "@/hooks/use-mobile"
import { Shield, Home, Calculator, MapPin, Users, CheckCircle, Menu } from "lucide-react"
import type { Language } from "@/hooks/useTranslation"

interface UnauthenticatedViewProps {
  language: Language
  setLanguage: (lang: Language) => void
  isHalalMode: boolean
  setIsHalalMode: (value: boolean) => void
  t: (key: string) => string
}

export const UnauthenticatedView = ({ language, setLanguage, isHalalMode, setIsHalalMode, t }: UnauthenticatedViewProps) => {
  const { scrollY, isScrolled } = useScroll()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Navigation */}
      <nav className={`border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-500 ${
        isHalalMode ? 'bg-magit-trust/10' : 'bg-background/50'
      }`}>
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <MagitLogo size={isMobile ? "sm" : "md"} />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <a href="#search" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20 text-sm">{t('nav.search')}</a>
              <a href="#map" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20 text-sm">{t('nav.map')}</a>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20 text-sm">{t('nav.features')}</a>
              <a href="#financing" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20 text-sm">{t('nav.financing')}</a>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* Language Selector */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className={`${isMobile ? 'w-14' : 'w-20'}`}>
                  <SelectValue placeholder={language === "en" ? (isMobile ? "EN" : "ENG") : language === "ru" ? "RU" : "UZ"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{isMobile ? "EN" : "ENG"}</SelectItem>
                  <SelectItem value="ru">RU</SelectItem>
                  <SelectItem value="uz">UZ</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Desktop Auth Buttons */}
              <div className="hidden lg:flex items-center space-x-3">
                <Button
                  variant="ghost" 
                  onClick={() => window.location.href = '/auth'}
                  className="text-sm"
                >
                  {t('nav.signIn')}
                </Button>
                <Button 
                  variant={isHalalMode ? "trust" : "default"}
                  onClick={() => window.location.href = '/auth?signup=true'}
                  className="text-sm"
                >
                  {t('nav.getStarted')}
                </Button>
              </div>

              {/* Mobile & Tablet Menu */}
              <div className="lg:hidden">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Navigation</SheetTitle>
                    </SheetHeader>
                    
                    <div className="space-y-4">
                      {/* Navigation Links */}
                      <div className="space-y-2">
                        <a 
                          href="#search" 
                          className="flex items-center w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.search')}
                        </a>
                        <a 
                          href="#map" 
                          className="flex items-center w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.map')}
                        </a>
                        <a 
                          href="#features" 
                          className="flex items-center w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.features')}
                        </a>
                        <a 
                          href="#financing" 
                          className="flex items-center w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.financing')}
                        </a>
                      </div>

                      {/* Auth Buttons */}
                      <div className="pt-4 border-t space-y-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => window.location.href = '/auth'}
                          className="w-full"
                        >
                          {t('nav.signIn')}
                        </Button>
                        <Button 
                          variant={isHalalMode ? "trust" : "default"}
                          onClick={() => window.location.href = '/auth?signup=true'}
                          className="w-full"
                        >
                          {t('nav.getStarted')}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Scroll Animation */}
      <section 
        className="relative py-12 md:py-16 transition-all duration-700 ease-out"
        style={{
          transform: `scale(${Math.max(0.85, 1 - scrollY * 0.0003)}) translateY(${scrollY * 0.1}px)`,
          opacity: Math.max(0.3, 1 - scrollY * 0.002)
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge 
              variant={isHalalMode ? "trust" : "success"} 
              className={`mb-4 transition-all duration-500 ${isScrolled ? 'scale-90 opacity-70' : ''}`}
            >
              {isHalalMode ? t('hero.badgeHalal') : t('hero.badgeStandard')}
            </Badge>
            <h1 className={`font-heading font-bold text-3xl md:text-5xl text-foreground mb-4 leading-tight transition-all duration-500 ${isScrolled ? 'scale-95' : ''}`}>
              {isHalalMode ? (
                <><span>{t('hero.titleHalalLead')}</span> <span className="text-primary">{t('hero.titleHalalHighlight')}</span></>
              ) : (
                <><span>{t('hero.titleStandardLead')}</span> <span className="text-primary">{t('hero.titleStandardHighlight')}</span></>
              )}
            </h1>
            <p className={`text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed transition-all duration-500 ${isScrolled ? 'opacity-60' : ''}`}>
              {isHalalMode 
                ? t('hero.subtitleHalal')
                : t('hero.subtitleStandard')
              }
            </p>
            
            {/* Trust Indicators */}
            <div className={`flex flex-wrap justify-center gap-4 text-sm text-muted-foreground transition-all duration-500 ${isScrolled ? 'opacity-40 scale-90' : ''}`}>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                  {t('hero.verifiedHomes')}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                  {isHalalMode ? t('hero.financingHalal') : t('hero.financing')}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                  {t('hero.verified')}
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Search Section */}
      <section id="search" className="relative z-10 pt-16">
        <SearchSection 
          isHalalMode={isHalalMode} 
          onHalalModeChange={setIsHalalMode} 
          t={t}
        />
      </section>

      {/* Interactive Map Section */}
      <div id="map">
        <LazyMapSection t={t} isHalalMode={isHalalMode} onHalalModeChange={setIsHalalMode} language={language} />
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={Shield}
              title={t('features.verified')}
              description={t('features.verifiedDesc')}
              badge="Verified"
              badgeVariant="success"
            />
            <FeatureCard
              icon={Calculator}
              title={t('features.halalFinancing')}
              description={t('features.halalDesc')}
              badge="Halal"
              badgeVariant="trust"
            />
            <FeatureCard
              icon={MapPin}
              title={t('features.map')}
              description={t('features.mapDesc')}
              badge="Live"
              badgeVariant="warning"
            />
            <FeatureCard
              icon={Users}
              title={t('features.community')}
              description={t('features.communityDesc')}
            />
            <FeatureCard
              icon={Home}
              title={t('features.smartMatching')}
              description={t('features.smartDesc')}
            />
            <FeatureCard
              icon={CheckCircle}
              title={t('features.secure')}
              description={t('features.secureDesc')}
              badge="Protected"
              badgeVariant="success"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="financing" className="py-16 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">1,500+</div>
              <div className="text-muted-foreground">{t('stats.verifiedHomes')}</div>
            </div>
            <div className="text-center">
              <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">95%</div>
              <div className="text-muted-foreground">{t('stats.trustRating')}</div>
            </div>
            <div className="text-center">
              <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">0%</div>
              <div className="text-muted-foreground">{t('stats.interestRate')}</div>
            </div>
            <div className="text-center">
              <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">{t('stats.support')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-card border-0 shadow-warm">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-warm"
                  onClick={() => window.location.href = '/auth?signup=true'}
                >
                  {t('cta.button')}
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  {t('cta.learnMore')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer isHalalMode={isHalalMode} t={t} />
    </>
  )
}