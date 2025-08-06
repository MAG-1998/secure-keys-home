import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Clock } from "lucide-react";
import { useTheme } from "next-themes";
interface ThemeToggleProps {
  isHalalMode?: boolean;
}
export const ThemeToggle = ({
  isHalalMode = false
}: ThemeToggleProps) => {
  const {
    theme,
    setTheme
  } = useTheme();
  const [isAutoMode, setIsAutoMode] = useState(true);

  // Check if user has manual preference
  useEffect(() => {
    const hasManualPreference = localStorage.getItem('hasManualThemePreference') === 'true';
    const manualChoice = localStorage.getItem('manualThemeChoice');
    if (hasManualPreference && manualChoice) {
      setIsAutoMode(false);
      setTheme(manualChoice);
    } else {
      setIsAutoMode(true);
      // Apply time-based theme
      const hour = new Date().getHours();
      const isDarkTime = hour < 7 || hour >= 19; // Dark mode between 7PM and 7AM
      setTheme(isDarkTime ? "dark" : "light");
    }
  }, [setTheme]);

  // Auto theme switching when in auto mode
  useEffect(() => {
    if (!isAutoMode) return;
    const setAutoTheme = () => {
      const hour = new Date().getHours();
      const isDarkTime = hour < 7 || hour >= 19;
      setTheme(isDarkTime ? "dark" : "light");
    };

    // Check every hour for theme changes
    const interval = setInterval(setAutoTheme, 3600000);
    return () => clearInterval(interval);
  }, [isAutoMode, setTheme]);
  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";

    // Switch to manual mode
    setIsAutoMode(false);
    localStorage.setItem('hasManualThemePreference', 'true');
    localStorage.setItem('manualThemeChoice', newTheme);
    setTheme(newTheme);
  };
  const resetToAutoMode = () => {
    setIsAutoMode(true);
    localStorage.removeItem('hasManualThemePreference');
    localStorage.removeItem('manualThemeChoice');

    // Apply current time-based theme
    const hour = new Date().getHours();
    const isDarkTime = hour < 7 || hour >= 19;
    setTheme(isDarkTime ? "dark" : "light");
  };
  return (
    <div className="flex items-center space-x-2 p-2">
      {isAutoMode ? (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Auto</span>
          <button
            onClick={resetToAutoMode}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Manual
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Switch
            checked={theme === "dark"}
            onCheckedChange={handleThemeToggle}
            aria-label="Toggle theme"
          />
          <Label htmlFor="theme-toggle" className="flex items-center space-x-1">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Label>
          <button
            onClick={resetToAutoMode}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Auto
          </button>
        </div>
      )}
    </div>
  );
};