import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapSection } from "@/components/MapSection";
import { SearchSection } from "@/components/SearchSection";
import { useNavigate } from "react-router-dom";
import { useScroll } from "@/hooks/use-scroll";
import { CheckCircle, Home, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
interface AuthenticatedViewProps {
  user: User;
  isHalalMode: boolean;
  setIsHalalMode: (value: boolean) => void;
  t: (key: string) => string;
}
export const AuthenticatedView = ({
  user,
  isHalalMode,
  setIsHalalMode,
  t
}: AuthenticatedViewProps) => {
  const navigate = useNavigate();
  const {
    scrollY,
    isScrolled
  } = useScroll();

  const [counts, setCounts] = useState({
    savedProperties: 0,
    listedProperties: 0,
    activeRequests: 0
  });

  useEffect(() => {
    fetchUserCounts();
  }, [user]);

  const fetchUserCounts = async () => {
    if (!user?.id) return;

    try {
      // Fetch saved properties count
      const { count: savedCount } = await supabase
        .from('saved_properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch listed properties count
      const { count: listedCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch active requests count (pending applications + active property visits)
      const { count: applicationsCount } = await supabase
        .from('property_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      const { count: visitsCount } = await supabase
        .from('property_visits')
        .select('*', { count: 'exact', head: true })
        .eq('visitor_id', user.id)
        .in('status', ['pending', 'confirmed']);

      setCounts({
        savedProperties: savedCount || 0,
        listedProperties: listedCount || 0,
        activeRequests: (applicationsCount || 0) + (visitsCount || 0)
      });
    } catch (error) {
      console.error('Error fetching user counts:', error);
    }
  };
  const getUserDisplayName = () => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
  };
  return <>
      {/* Welcome Hero Section */}
      <section className="relative py-12 md:py-16 transition-all duration-700 ease-out" style={{
      transform: `scale(${Math.max(0.85, 1 - scrollY * 0.0003)}) translateY(${scrollY * 0.1}px)`,
      opacity: Math.max(0.3, 1 - scrollY * 0.002)
    }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="success" className={`mb-4 transition-all duration-500 ${isScrolled ? 'scale-90 opacity-70' : ''}`}>
              Welcome back, {getUserDisplayName()}!
            </Badge>
            <h1 className={`font-heading font-bold text-3xl md:text-5xl text-foreground mb-4 leading-tight transition-all duration-500 ${isScrolled ? 'scale-95' : ''}`}>
              Find Your <span className="text-primary">Perfect Home</span>
            </h1>
            <p className={`text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed transition-all duration-500 ${isScrolled ? 'opacity-60' : ''}`}>
              {isHalalMode ? "Search verified properties with halal financing options" : "Discover verified properties with transparent pricing"}
            </p>
            
            {/* Quick Actions */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 transition-all duration-500 ${isScrolled ? 'opacity-60 scale-95' : ''}`}>
              <Button size="lg" className="text-lg px-8 py-6 shadow-warm" onClick={() => document.getElementById('search')?.scrollIntoView({
              behavior: 'smooth'
            })}>
                <Home className="w-5 h-5 mr-2" />
                Find Properties
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/list-property')}>
                <Plus className="w-5 h-5 mr-2" />
                List Your Property
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className={`flex flex-wrap justify-center gap-4 text-sm text-muted-foreground transition-all duration-500 ${isScrolled ? 'opacity-40 scale-90' : ''}`}>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                Verified Properties
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                {isHalalMode ? "Halal Financing" : "Transparent Pricing"}
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                Secure Transactions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Search Section */}
      <section id="search" className="relative z-10 pt-16">
        <SearchSection isHalalMode={isHalalMode} onHalalModeChange={setIsHalalMode} t={t} />
      </section>

      {/* Interactive Map Section */}
      <div id="map">
        <MapSection isHalalMode={isHalalMode} t={t} />
      </div>

      {/* Quick Stats for Authenticated Users */}
      <section className="py-16 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-8 text-center">
              Your Property Journey
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="font-heading font-bold text-2xl text-primary mb-2">{counts.savedProperties}</div>
                  <div className="text-muted-foreground">Saved Properties</div>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/saved-properties')}>View Saved Properties</Button>
                </CardContent>
              </Card>
              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="font-heading font-bold text-2xl text-primary mb-2">{counts.listedProperties}</div>
                  <div className="text-muted-foreground">Properties Listed</div>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/my-properties')}>
                    View Listed Properties
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="font-heading font-bold text-2xl text-primary mb-2">{counts.activeRequests}</div>
                  <div className="text-muted-foreground">Active Requests</div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    Property listings, visits & verifications
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/my-properties')}>
                    View All Requests
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>;
};