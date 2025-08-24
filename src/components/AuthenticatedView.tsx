import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UnifiedSearchMap } from "@/components/UnifiedSearchMap";
import { useNavigate } from "react-router-dom";
import { useScroll } from "@/hooks/use-scroll";
import { CheckCircle, Home, Plus } from "lucide-react";
import { memo, useState } from "react";
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
  
  // Shared search results state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const getUserDisplayName = () => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
  };
  return <>
      {/* Welcome Back - Compact */}
      <section className="py-4 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading font-bold text-xl text-foreground">
              {`${t('hero.welcomeBack')}, ${getUserDisplayName()}!`}
            </h1>
          </div>
        </div>
      </section>

      {/* Unified Search, Filters & Map Section - Vertical Layout */}
      <section id="search-map" className="relative">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Unified Search, Filters & Map */}
            <UnifiedSearchMap 
              isHalalMode={isHalalMode} 
              onHalalModeChange={setIsHalalMode} 
              t={t}
              language={language}
            />
          </div>
        </div>
      </section>

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