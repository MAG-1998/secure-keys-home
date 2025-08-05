import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Moon, Sun, Clock } from "lucide-react"
import { useTheme } from "next-themes"

interface ThemeToggleProps {
  isHalalMode?: boolean
}

export const ThemeToggle = ({ isHalalMode = false }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme()
  const [isAutoMode, setIsAutoMode] = useState(true)

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
  useEffect(() => {
    if (!isAutoMode) return

    const setAutoTheme = () => {
      const hour = new Date().getHours()
      const isDarkTime = hour < 7 || hour >= 19
      setTheme(isDarkTime ? "dark" : "light")
    }

    // Check every hour for theme changes
    const interval = setInterval(setAutoTheme, 3600000)
    return () => clearInterval(interval)
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
    <div className="fixed bottom-4 right-4 z-50 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      <div className="flex items-center space-x-3">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <Switch
          checked={theme === "dark"}
          onCheckedChange={handleThemeToggle}
          className={isHalalMode ? "data-[state=checked]:bg-magit-trust data-[state=checked]:border-magit-trust dark:data-[state=checked]:border-white data-[state=unchecked]:border-border dark:data-[state=unchecked]:border-white/20 [&>span]:data-[state=unchecked]:bg-magit-trust" : "data-[state=checked]:bg-primary data-[state=checked]:border-primary dark:data-[state=checked]:border-white data-[state=unchecked]:border-border dark:data-[state=unchecked]:border-white/20"}
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
  )
}