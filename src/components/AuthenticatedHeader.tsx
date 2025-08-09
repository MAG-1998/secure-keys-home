import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MagitLogo } from "@/components/MagitLogo"
import { useIsMobile } from "@/hooks/use-mobile"

import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { LogOut, User, Settings, Menu, FileText, Heart, Plus } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Language } from "@/hooks/useTranslation"
import { forceLocalSignOut } from "@/lib/auth"

interface AuthenticatedHeaderProps {
  user: SupabaseUser
  language: Language
  setLanguage: (lang: Language) => void
  isHalalMode: boolean
}

export const AuthenticatedHeader = ({ user, language, setLanguage, isHalalMode }: AuthenticatedHeaderProps) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        await forceLocalSignOut();
        toast({ title: "Signed out", description: "You have been logged out." });
        navigate('/');
        setTimeout(() => window.location.reload(), 0);
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        const msg = (error as any).message?.toLowerCase?.() || '';
        if (msg.includes('session') && msg.includes('missing')) {
          await forceLocalSignOut();
        } else {
          throw error;
        }
      }

      await forceLocalSignOut();
      toast({ title: "Signed out", description: "You have been logged out." });
      navigate('/');
      setTimeout(() => window.location.reload(), 0);
    } catch (err) {
      await forceLocalSignOut();
      toast({ title: "Signed out", description: "You have been logged out." });
      navigate('/');
      setTimeout(() => window.location.reload(), 0);
    }
  }

  const getUserDisplayName = () => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || "User"
  }

  return (
    <nav className={`border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-500 ${
      isHalalMode ? 'bg-magit-trust/10' : 'bg-background/50'
    }`}>
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <MagitLogo size={isMobile ? "sm" : "md"} />
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Button
              variant="ghost" 
              onClick={() => navigate('/my-properties')}
              className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20 text-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              My Properties
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/saved-properties')}
              className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20 text-sm"
            >
              <Heart className="h-4 w-4 mr-2" />
              Saved
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/list-property')}
              className="px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20 text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              List Property
            </Button>
          </div>

          {/* Mobile & Tablet Navigation */}
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

            {/* Desktop User Profile */}
            <div className="hidden lg:flex items-center space-x-3">
              <button
                className="flex items-center space-x-2 hover:bg-muted/50 rounded-lg p-2 transition-colors cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </button>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile & Tablet User Avatar & Menu */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                className="flex items-center hover:bg-muted/50 rounded-lg p-1 transition-colors cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* Mobile Menu */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserDisplayName().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{getUserDisplayName()}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          navigate('/my-properties')
                          setIsMenuOpen(false)
                        }}
                        className="w-full justify-start text-left"
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        My Listed Properties
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          navigate('/saved-properties')
                          setIsMenuOpen(false)
                        }}
                        className="w-full justify-start text-left"
                      >
                        <Heart className="h-4 w-4 mr-3" />
                        Saved Properties
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          navigate('/list-property')
                          setIsMenuOpen(false)
                        }}
                        className="w-full justify-start text-left"
                      >
                        <Plus className="h-4 w-4 mr-3" />
                        List New Property
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          navigate('/dashboard')
                          setIsMenuOpen(false)
                        }}
                        className="w-full justify-start text-left"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Dashboard
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          navigate('/profile')
                          setIsMenuOpen(false)
                        }}
                        className="w-full justify-start text-left"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Button>
                    </div>

                    {/* Sign Out */}
                    <div className="pt-4 border-t">
                      <Button 
                        variant="ghost" 
                        onClick={handleSignOut}
                        className="w-full justify-start text-left text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
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
  )
}