import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MagitLogo } from "@/components/MagitLogo"

import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { LogOut, User, Settings } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Language } from "@/hooks/useTranslation"

interface AuthenticatedHeaderProps {
  user: SupabaseUser
  language: Language
  setLanguage: (lang: Language) => void
  isHalalMode: boolean
}

export const AuthenticatedHeader = ({ user, language, setLanguage, isHalalMode }: AuthenticatedHeaderProps) => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const getUserDisplayName = () => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || "User"
  }

  return (
    <nav className={`border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-500 ${
      isHalalMode ? 'bg-magit-trust/10' : 'bg-background/50'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <MagitLogo size="md" />
          
          <div className="hidden md:flex items-center space-x-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/my-properties')}
              className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20"
            >
              View Listed Properties
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/saved-properties')}
              className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20"
            >
              View Saved Properties
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/list-property')}
              className="px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/20"
            >
              List Property
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder={language === "en" ? "ENG" : language === "ru" ? "RU" : "UZ"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">ENG</SelectItem>
                <SelectItem value="ru">RU</SelectItem>
                <SelectItem value="uz">UZ</SelectItem>
              </SelectContent>
            </Select>

            

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <button 
                className="flex items-center space-x-2 hover:bg-muted/50 rounded-lg p-2 transition-colors cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
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
          </div>
        </div>
      </div>
    </nav>
  )
}