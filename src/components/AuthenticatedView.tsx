import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchSection } from "@/components/SearchSection";
import LazyMapSection from "@/components/LazyMapSection";
import { useNavigate } from "react-router-dom";
import { useScroll } from "@/hooks/use-scroll";
import { CheckCircle, Home, Plus } from "lucide-react";
import { memo } from "react";
import { useUserCounts } from "@/hooks/useOptimizedQuery";
import type { User } from "@supabase/supabase-js";
import { useTranslation } from "@/hooks/useTranslation";
interface AuthenticatedViewProps {
  user: User;
  isHalalMode: boolean;
  setIsHalalMode: (value: boolean) => void;
  t: (key: string) => string;
}
export const AuthenticatedView = memo(({
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

  const { data: counts = { saved: 0, listed: 0, requests: 0, myRequests: 0, incomingRequests: 0 } } = useUserCounts(user?.id);
  const { language } = useTranslation();
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
              {`${t('hero.welcomeBack')}, ${getUserDisplayName()}!`}
            </Badge>
            <h1 className={`font-heading font-bold text-3xl md:text-5xl text-foreground mb-4 leading-tight transition-all duration-500 ${isScrolled ? 'scale-95' : ''}`}>
              {isHalalMode ? (
                <><span>{t('hero.titleHalalLead')}</span> <span className="text-primary">{t('hero.titleHalalHighlight')}</span></>
              ) : (
                <><span>{t('hero.titleStandardLead')}</span> <span className="text-primary">{t('hero.titleStandardHighlight')}</span></>
              )}
            </h1>
            <p className={`text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed transition-all duration-500 ${isScrolled ? 'opacity-60' : ''}`}>
              {isHalalMode ? t('hero.subtitleHalal') : t('hero.subtitleStandard')}
            </p>
            
            {/* Quick Actions */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 transition-all duration-500 ${isScrolled ? 'opacity-60 scale-95' : ''}`}>
              <Button size="lg" className="text-lg px-8 py-6 shadow-warm" onClick={() => document.getElementById('search')?.scrollIntoView({
              behavior: 'smooth'
            })}>
                <Home className="w-5 h-5 mr-2" />
                {t('actions.findProperties')}
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/list-property')}>
                <Plus className="w-5 h-5 mr-2" />
                {t('actions.listProperty')}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className={`flex flex-wrap justify-center gap-4 text-sm text-muted-foreground transition-all duration-500 ${isScrolled ? 'opacity-40 scale-90' : ''}`}>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                {t('features.verified')}
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                {isHalalMode ? t('hero.financingHalal') : t('hero.transparentPricing')}
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-magit-success mr-2" />
                {t('features.secure')}
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
        <LazyMapSection t={t} isHalalMode={isHalalMode} onHalalModeChange={setIsHalalMode} language={language} />
      </div>

      {/* Quick Stats for Authenticated Users */}
      <section className="py-16 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-8 text-center">
              {t('dashboard.yourJourney')}
            </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-background/50 border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="font-heading font-bold text-2xl text-primary mb-2">{counts.saved}</div>
                    <div className="text-muted-foreground">{t('dashboard.saved')}</div>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/saved-properties')}>{t('dashboard.viewSaved')}</Button>
                  </CardContent>
                </Card>
                <Card className="bg-background/50 border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="font-heading font-bold text-2xl text-primary mb-2">{counts.listed}</div>
                    <div className="text-muted-foreground">{t('dashboard.listed')}</div>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/my-properties')}>
                      {t('dashboard.viewListed')}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-background/50 border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="font-heading font-bold text-2xl text-primary mb-2">{counts.myRequests}</div>
                    <div className="text-muted-foreground">{t('dashboard.yourRequests')}</div>
                    <div className="text-xs text-muted-foreground/70 mt-1">{t('dashboard.pendingConfirmed')}</div>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/my-requests')}>
                      {t('dashboard.viewYourRequests')}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-background/50 border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="font-heading font-bold text-2xl text-primary mb-2">{counts.incomingRequests}</div>
                    <div className="text-muted-foreground">{t('dashboard.incomingRequests')}</div>
                    <div className="text-xs text-muted-foreground/70 mt-1">{t('dashboard.ownerInbox')}</div>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/visit-requests')}>
                      {t('dashboard.manageRequests')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
          </div>
        </div>
      </section>
    </>;
});

AuthenticatedView.displayName = "AuthenticatedView";