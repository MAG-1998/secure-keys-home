
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MagitLogo } from "@/components/MagitLogo"
import { Moon, Sun, Clock } from "lucide-react"
import { useTheme } from "next-themes"
import { useLocation } from "react-router-dom"

interface FooterProps {
  isHalalMode?: boolean
  t: (key: string) => string
}

export const Footer = ({ isHalalMode = false, t }: FooterProps) => {
  const { theme, setTheme } = useTheme()
  const [isAutoMode, setIsAutoMode] = useState(true)
  const location = useLocation()

  // Show full footer only on main pages
  const showFullFooter = location.pathname === "/" || location.pathname === "/index"

  // Check if user has manual preference
  useEffect(() => {
    const hasManualPreference = localStorage.getItem('hasManualThemePreference') === 'true'
    const manualChoice = localStorage.getItem('manualThemeChoice')
    
    if (hasManualPreference && manualChoice) {
      setIsAutoMode(false)
      setTheme(manualChoice)
    } else {
      setIsAutoMode(true)
      // Apply time-based theme
      const hour = new Date().getHours()
      const isDarkTime = hour < 7 || hour >= 19 // Dark mode between 7PM and 7AM
      setTheme(isDarkTime ? "dark" : "light")
    }
  }, [setTheme])

  // Auto theme switching when in auto mode
  // Remove auto-refresh for better performance - only update when manually triggered
  useEffect(() => {
    if (!isAutoMode) return
    const setAutoTheme = () => {
      const hour = new Date().getHours()
      const isDarkTime = hour < 7 || hour >= 19
      setTheme(isDarkTime ? "dark" : "light")
    }
    // Set theme once when auto mode is enabled
    setAutoTheme()
  }, [isAutoMode, setTheme])

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light"
    
    // Switch to manual mode
    setIsAutoMode(false)
    localStorage.setItem('hasManualThemePreference', 'true')
    localStorage.setItem('manualThemeChoice', newTheme)
    setTheme(newTheme)
  }

  const resetToAutoMode = () => {
    setIsAutoMode(true)
    localStorage.removeItem('hasManualThemePreference')
    localStorage.removeItem('manualThemeChoice')
    
    // Apply current time-based theme
    const hour = new Date().getHours()
    const isDarkTime = hour < 7 || hour >= 19
    setTheme(isDarkTime ? "dark" : "light")
  }

  return (
    <footer className="border-t border-border/50 bg-background/80 py-12">
      <div className="container mx-auto px-4">
        {showFullFooter && (
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <MagitLogo size="md" className="mb-4" />
              <p className="text-muted-foreground text-sm">
                {t('footer.tagline')}
              </p>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">{t('footer.platform')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.browseHomes')}</a></li>
                <li><a href="/financing-info" className="hover:text-foreground transition-colors">{t('footer.financing')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.howItWorks')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">{t('footer.support')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/faq" className="hover:text-foreground transition-colors">{t('footer.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.contactUs')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.safety')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">{t('footer.company')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.about')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</a></li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Dark Mode Toggle */}
        <div className={`${showFullFooter ? 'border-t border-border/50 pt-8' : ''} flex justify-between items-center`}>
          {showFullFooter && (
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </p>
          )}
          
          <div className={`flex items-center space-x-3 ${!showFullFooter ? 'mx-auto' : ''}`}>
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={handleThemeToggle}
              className={isHalalMode ? "data-[state=checked]:bg-magit-trust data-[state=checked]:border-magit-trust [&>span]:data-[state=unchecked]:bg-magit-trust" : "data-[state=checked]:bg-primary data-[state=checked]:border-primary"}
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <Label className="text-sm text-muted-foreground">
                {isAutoMode ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Auto {theme === "dark" ? "Dark" : "Light"}
                  </span>
                ) : (
                  "Manual"
                )}
              </Label>
              {!isAutoMode && (
                <button
                  onClick={resetToAutoMode}
                  className="text-xs text-primary hover:text-primary/80 underline"
                >
                  Reset to Auto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
