import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MagitLogo } from "@/components/MagitLogo"
import { FeatureCard } from "@/components/FeatureCard"
import { PropertyCard } from "@/components/PropertyCard"
import { MapSection } from "@/components/MapSection"
import { SearchSection } from "@/components/SearchSection"
import { Shield, Home, Calculator, MapPin, Users, CheckCircle } from "lucide-react"

const Index = () => {
  const [isHalalMode, setIsHalalMode] = useState(false)

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
        isHalalMode ? 'bg-magit-trust/10' : 'bg-background/80'
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
              <Button variant="ghost">Sign In</Button>
              <Button variant={isHalalMode ? "trust" : "default"}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Compact Hero Section */}
      <section className="relative py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant={isHalalMode ? "trust" : "success"} className="mb-4">
              {isHalalMode ? "✓ Sharia-Compliant Platform" : "✓ Verified Marketplace"}
            </Badge>
            <h1 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4 leading-tight">
              {isHalalMode ? (
                <>Find your home. <span className="text-primary">Stay Halal.</span></>
              ) : (
                <>Buy smart. <span className="text-primary">Pay fair.</span></>
              )}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              {isHalalMode 
                ? "Discover verified homes with Sharia-compliant financing options across Tashkent."
                : "Discover verified homes with honest, interest-free financing options."
              }
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
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
      <SearchSection 
        isHalalMode={isHalalMode} 
        onHalalModeChange={setIsHalalMode} 
      />

      {/* Interactive Map Section */}
      <div id="map">
        <MapSection />
      </div>

      {/* Featured Properties Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="success" className="mb-4">
              ✓ Live Listings
            </Badge>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              Featured verified properties
            </h2>
            <p className="text-lg text-muted-foreground">
              Real homes from verified sellers, available right now with Halal financing options.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
            <PropertyCard
              id="1"
              title="Modern 3-room apartment"
              location="Chilonzor, Tashkent"
              price="$52,000"
              bedrooms={3}
              bathrooms={2}
              area={85}
              imageUrl="https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop"
              isVerified={true}
              isHalalFinanced={true}
            />
            <PropertyCard
              id="2"
              title="Family apartment with garden"
              location="Yunusobod, Tashkent"
              price="$47,000"
              bedrooms={2}
              bathrooms={1}
              area={72}
              imageUrl="https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop"
              isVerified={true}
              isHalalFinanced={false}
            />
            <PropertyCard
              id="3"
              title="Renovated 4-room home"
              location="Shaykhontohur, Tashkent"
              price="$68,000"
              bedrooms={4}
              bathrooms={2}
              area={110}
              imageUrl="https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop"
              isVerified={true}
              isHalalFinanced={true}
            />
          </div>
          
          <div className="text-center">
            <Button size="lg" variant="outline" className="shadow-soft">
              View All 1,500+ Properties
            </Button>
          </div>
        </div>
      </section>

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

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <MagitLogo size="md" className="mb-4" />
              <p className="text-muted-foreground text-sm">
                Verified homes. Honest financing. Peace of mind.
              </p>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Browse Homes</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Financing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Safety</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Magit. All rights reserved. Made with care for families in Uzbekistan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
