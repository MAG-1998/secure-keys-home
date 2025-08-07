import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MagitLogo } from "@/components/MagitLogo"
import { Footer } from "@/components/Footer"
import { SearchSection } from "@/components/SearchSection"
import LazyMapSection from "@/components/LazyMapSection"
import { useTranslation } from "@/hooks/useTranslation"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { Shield, Home, Calculator, MapPin, Menu } from "lucide-react"
import type { User, Session } from "@supabase/supabase-js"

const Index = () => {
  const [isHalalMode, setIsHalalMode] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { language, setLanguage, t } = useTranslation()
  const navigate = useNavigate()

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

  // Authentication state management
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Redirect authenticated users to dashboard
        if (session?.user) {
          navigate('/dashboard')
        }
      }
    )

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Redirect authenticated users to dashboard
      if (session?.user) {
        navigate('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isHalalMode ? 'bg-gradient-to-br from-magit-trust/5 to-primary/5' : 'bg-gradient-hero'
    }`}>
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <MagitLogo size="md" />
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-6xl text-foreground mb-6">
            Find Your Perfect Property
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover verified properties with transparent pricing and halal financing options in Uzbekistan
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('properties')?.scrollIntoView()}>
              Browse Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <SearchSection 
        isHalalMode={isHalalMode} 
        onHalalModeChange={setIsHalalMode} 
        t={t}
      />

      {/* Map Section */}
      <div id="properties">
        <LazyMapSection t={t} />
      </div>

      {/* Features Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              Why Choose Magit?
            </h2>
            <p className="text-lg text-muted-foreground">
              The most trusted property platform in Uzbekistan
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-xl mb-3">Verified Properties</h3>
                <p className="text-muted-foreground">All properties are verified and authenticated for your security</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-xl mb-3">Halal Financing</h3>
                <p className="text-muted-foreground">Sharia-compliant financing options available for all properties</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-xl mb-3">Prime Locations</h3>
                <p className="text-muted-foreground">Properties in the best locations across Uzbekistan</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  )
}

export default Index