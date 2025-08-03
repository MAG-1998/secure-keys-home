import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MagitLogo } from "@/components/MagitLogo";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { Home, Plus, MapPin, Calculator, Star, TrendingUp, Clock, Eye, Heart, Shield, CheckCircle, Settings, LogOut, ArrowRight, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const getUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    getUser();

    // Listen for auth state changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleSignOut = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      navigate("/");
    }
  };
  const handleListProperty = () => {
    navigate("/list-property");
  };
  const handleBuyProperty = () => {
    navigate("/");
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <MagitLogo size="lg" />
          <p className="text-muted-foreground mt-4">Loading your dashboard...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <MagitLogo size="md" />
            
            <div className="flex items-center space-x-4">
              {user && <button className="flex items-center space-x-3 hover:bg-muted/50 rounded-lg p-2 transition-colors cursor-pointer text-left" onClick={() => navigate('/profile')}>
                  <Avatar>
                    <AvatarFallback className="bg-muted text-foreground">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </button>}
              
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Welcome to Your Property Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Choose your path to get started with Magit
          </p>
          <Badge variant="success" className="mb-8">
            Verified User
          </Badge>
        </div>

        {/* Split Screen Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* List Property - Orange Theme */}
          <Card className="group cursor-pointer border-0 overflow-hidden shadow-warm hover:shadow-lg transition-all duration-300 hover:scale-105" onClick={handleListProperty}>
            <div className="h-full bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10">
              <CardContent className="p-8 h-full flex flex-col justify-between text-center min-h-[400px]">
                <div className="flex-1 flex flex-col justify-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Home className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4">
                      List Your Property
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Showcase your property to thousands of potential buyers with our verified listing platform
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                      Professional photography included
                    </div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                      Verified buyer connections
                    </div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                      Zero upfront costs
                    </div>
                  </div>
                </div>

                <Button className="w-full group-hover:shadow-warm transition-all duration-300" size="lg">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </div>
          </Card>

          {/* Buy Property */}
          <Card className="group cursor-pointer border-0 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" onClick={handleBuyProperty}>
            <div className="h-full bg-foreground dark:bg-white">
              <CardContent className="p-8 h-full flex flex-col justify-between text-center min-h-[400px] text-background dark:text-black">
                <div className="flex-1 flex flex-col justify-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-background/20 dark:bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-background dark:text-black" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl md:text-3xl text-background dark:text-black mb-4">
                    Find Your Dream Home
                  </h2>
                  <p className="text-lg text-background/70 dark:text-gray-600 mb-6">
                    Discover verified properties with transparent pricing and halal financing options
                  </p>
                </div>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center text-sm text-background/70 dark:text-gray-600">
                    <span className="w-2 h-2 bg-background dark:bg-black rounded-full mr-2"></span>
                    Verified property listings
                  </div>
                  <div className="flex items-center justify-center text-sm text-background/70 dark:text-gray-600">
                    <span className="w-2 h-2 bg-background dark:bg-black rounded-full mr-2"></span>
                    Halal financing available
                  </div>
                  <div className="flex items-center justify-center text-sm text-background/70 dark:text-gray-600">
                    <span className="w-2 h-2 bg-background dark:bg-black rounded-full mr-2"></span>
                    AI-powered matching
                  </div>
                </div>
                </div>

                <Button variant="outline" size="lg" className="w-full group-hover:shadow-lg transition-all duration-300 border-background dark:border-black hover:bg-background dark:hover:bg-black text-foreground dark:text-black hover:text-background dark:hover:text-white">
                  Start Browsing
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Need help deciding? Our property experts are here to guide you.
          </p>
          <Button variant="ghost" className="mt-2">
            Contact Support
          </Button>
        </div>
      </main>
    </div>;
};
export default Dashboard;