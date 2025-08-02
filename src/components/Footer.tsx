import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MagitLogo } from "@/components/MagitLogo"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface FooterProps {
  isHalalMode?: boolean
  t: (key: string) => string
}

export const Footer = ({ isHalalMode = false, t }: FooterProps) => {
  const { theme, setTheme } = useTheme()
  const [autoThemeEnabled, setAutoThemeEnabled] = useState(false)

  // Auto theme based on time - only when enabled
  useEffect(() => {
    if (!autoThemeEnabled) return

    const setAutoTheme = () => {
      const hour = new Date().getHours()
      const isDarkTime = hour < 7 || hour >= 19 // Dark mode between 7PM and 7AM
      setTheme(isDarkTime ? "dark" : "light")
    }

    // Set initial theme when auto mode is enabled
    setAutoTheme()

    // Update every hour
    const interval = setInterval(setAutoTheme, 3600000)
    return () => clearInterval(interval)
  }, [setTheme, autoThemeEnabled])

  return (
    <footer className="border-t border-border/50 bg-background/80 py-12">
      <div className="container mx-auto px-4">
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
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.financing')}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.howItWorks')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.helpCenter')}</a></li>
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
        
        {/* Dark Mode Toggle */}
        <div className="border-t border-border/50 pt-8 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
          
          <div className="flex items-center space-x-3">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => {
                setAutoThemeEnabled(false) // Disable auto theme when manually toggling
                setTheme(checked ? "dark" : "light")
              }}
              className={isHalalMode ? "data-[state=checked]:bg-magit-trust data-[state=checked]:border-magit-trust [&>span]:data-[state=unchecked]:bg-magit-trust" : "data-[state=checked]:bg-primary data-[state=checked]:border-primary"}
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
            
            <div className="flex items-center space-x-2 ml-4">
              <Switch
                checked={autoThemeEnabled}
                onCheckedChange={setAutoThemeEnabled}
                className="data-[state=checked]:bg-accent"
              />
              <Label className="text-sm text-muted-foreground">{t('footer.autoDarkMode')}</Label>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}