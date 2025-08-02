import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MagitLogo } from "@/components/MagitLogo"
import { FeatureCard } from "@/components/FeatureCard"
import { PropertyCard } from "@/components/PropertyCard"
import { MapSection } from "@/components/MapSection"
import { SearchSection } from "@/components/SearchSection"
import { Footer } from "@/components/Footer"
import { useScroll } from "@/hooks/use-scroll"
import { useTranslation } from "@/hooks/useTranslation"
import { Shield, Home, Calculator, MapPin, Users, CheckCircle, Languages } from "lucide-react"

const Index = () => {
  const [isHalalMode, setIsHalalMode] = useState(false)
  const { language, setLanguage, t } = useTranslation()
  const { scrollY, isScrolled } = useScroll()

  // Apply global design changes based on Halal mode
  useEffect(() => {
    if (isHalalMode) {
      document.documentElement.style.setProperty('--primary', '176 64% 45%') // More trust-focused
      document.documentElement.style.setProperty('--accent', '176 44% 65%')
    } else {
      document.documentElement.style.setProperty('--primary', '25 85% 53%') // Original magit-warm
      document.documentElement.style.setProperty('--accent', '38 84% 60%')
    }
  }, [isHalalMode])
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isHalalMode ? 'bg-gradient-to-br from-magit-trust/5 to-primary/5' : 'bg-gradient-hero'
    }`}>
      
      {/* Navigation */}
      <nav className={`border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-500 ${
        isHalalMode ? 'bg-magit-trust/10' : 'bg-background/50'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <MagitLogo size="md" />
            <div className="hidden md:flex items-center space-x-8">
              <a href="#search" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20">{t('nav.search')}</a>
              <a href="#map" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20">{t('nav.map')}</a>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20">{t('nav.features')}</a>
              <a href="#financing" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20">{t('nav.financing')}</a>
            </div>
            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder={language === "en" ? "ENG" : language === "ru" ? "RU" : "UZ"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">ENG</SelectItem>
                  <SelectItem value="ru">RU</SelectItem>
                  <SelectItem value="uz">UZ</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost">{t('nav.signIn')}</Button>
              <Button variant={isHalalMode ? "trust" : "default"}>{t('nav.getStarted')}</Button>
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
                <>{t('hero.titleHalal').split(' ').slice(0, 3).join(' ')} <span className="text-primary">{t('hero.titleHalal').split(' ').slice(-2).join(' ')}</span></>
              ) : (
                <>{t('hero.titleStandard').split(' ').slice(0, 2).join(' ')} <span className="text-primary">{t('hero.titleStandard').split(' ').slice(-2).join(' ')}</span></>
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
      <div className="relative z-10">
        <SearchSection 
          isHalalMode={isHalalMode} 
          onHalalModeChange={setIsHalalMode} 
          t={t}
        />
      </div>

      {/* Interactive Map Section */}
      <div id="map">
        <MapSection isHalalMode={isHalalMode} t={t} />
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
      <section className="py-16 bg-gradient-card">
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
                <Button size="lg" className="text-lg px-8 py-6 shadow-warm">
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
    </div>
  );
};

export default Index;
