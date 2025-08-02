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
import { Shield, Home, Calculator, MapPin, Users, CheckCircle, Languages } from "lucide-react"

const Index = () => {
  const [isHalalMode, setIsHalalMode] = useState(false)
  const [language, setLanguage] = useState("en")
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
        isHalalMode ? 'bg-magit-trust/5' : 'bg-background/40'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <MagitLogo size="md" />
            <div className="hidden md:flex items-center space-x-8">
              <a href="#search" className="text-muted-foreground hover:text-foreground transition-colors">Search</a>
              <a href="#map" className="text-muted-foreground hover:text-foreground transition-colors">Map</a>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#financing" className="text-muted-foreground hover:text-foreground transition-colors">Financing</a>
            </div>
            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[120px]">
                  <Languages className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="uz">O'zbek</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost">Sign In</Button>
              <Button variant={isHalalMode ? "trust" : "default"}>Get Started</Button>
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
              {isHalalMode ? "✓ Sharia-Compliant Platform" : "✓ Verified Marketplace"}
            </Badge>
            <h1 className={`font-heading font-bold text-3xl md:text-5xl text-foreground mb-4 leading-tight transition-all duration-500 ${isScrolled ? 'scale-95' : ''}`}>
              {isHalalMode ? (
                <>Find your home. <span className="text-primary">Stay Halal.</span></>
              ) : (
                <>Buy smart. <span className="text-primary">Pay fair.</span></>
              )}
            </h1>
            <p className={`text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed transition-all duration-500 ${isScrolled ? 'opacity-60' : ''}`}>
              {isHalalMode 
                ? "Discover verified homes with Sharia-compliant financing options across Tashkent."
                : "Discover verified homes with honest, interest-free financing options."
              }
            </p>
            
            {/* Trust Indicators */}
            <div className={`flex flex-wrap justify-center gap-4 text-sm text-muted-foreground transition-all duration-500 ${isScrolled ? 'opacity-40 scale-90' : ''}`}>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                1,500+ Verified Homes
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                {isHalalMode ? "100% Halal Financing" : "Zero Interest Rates"}
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                ID Verified Sellers
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
        />
      </div>

      {/* Interactive Map Section */}
      <div id="map">
        <MapSection isHalalMode={isHalalMode} />
      </div>


      {/* Features Section */}
      <section id="features" className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              Your home journey, reimagined
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to find, finance, and secure your perfect home — all in one trusted platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={Shield}
              title="Verified Properties"
              description="Every listing is verified with ID checks and document validation. No scams, no surprises."
              badge="Verified"
              badgeVariant="success"
            />
            <FeatureCard
              icon={Calculator}
              title="Halal Financing"
              description="Sharia-compliant buy-now-pay-later options with transparent terms and zero interest."
              badge="Halal"
              badgeVariant="trust"
            />
            <FeatureCard
              icon={MapPin}
              title="Interactive Map"
              description="Explore neighborhoods, check amenities, and find homes that match your lifestyle."
              badge="Live"
              badgeVariant="warning"
            />
            <FeatureCard
              icon={Users}
              title="Trusted Community"
              description="Connect with verified sellers and join a community of families upgrading their homes."
            />
            <FeatureCard
              icon={Home}
              title="Smart Matching"
              description="Our algorithm matches you with homes that fit your budget, preferences, and financing needs."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Secure Process"
              description="End-to-end protection with escrow services, legal support, and transparent documentation."
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
              <div className="text-muted-foreground">Verified Homes</div>
            </div>
            <div className="text-center">
              <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Trust Rating</div>
            </div>
            <div className="text-center">
              <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">0%</div>
              <div className="text-muted-foreground">Interest Rate</div>
            </div>
            <div className="text-center">
              <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support</div>
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
                Ready to find your perfect home?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of families who've found their dream homes through our verified marketplace 
                with honest, Halal financing options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6 shadow-warm">
                  Start Your Journey
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
