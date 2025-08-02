import { useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MagitLogo } from "@/components/MagitLogo"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface FooterProps {
  isHalalMode?: boolean
}

export const Footer = ({ isHalalMode = false }: FooterProps) => {
  const { theme, setTheme } = useTheme()

  // Auto theme based on time
  useEffect(() => {
    const setAutoTheme = () => {
      const hour = new Date().getHours()
      const isDarkTime = hour < 7 || hour >= 19 // Dark mode between 7PM and 7AM
      setTheme(isDarkTime ? "dark" : "light")
    }

    // Set initial theme
    setAutoTheme()

    // Update every hour
    const interval = setInterval(setAutoTheme, 3600000)
    return () => clearInterval(interval)
  }, [setTheme])

  return (
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
        
        {/* Dark Mode Toggle */}
        <div className="border-t border-border/50 pt-8 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 Magit. All rights reserved. Made with care for families in Uzbekistan.
          </p>
          
          <div className="flex items-center space-x-3">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              className={isHalalMode ? "data-[state=checked]:bg-magit-trust data-[state=checked]:border-magit-trust" : ""}
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm text-muted-foreground">Auto Dark Mode</Label>
          </div>
        </div>
      </div>
    </footer>
  )
}