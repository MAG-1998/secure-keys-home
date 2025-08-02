import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Moon, Sun, Languages } from "lucide-react"
import { useTheme } from "next-themes"

export const Header = () => {
  const [language, setLanguage] = useState("en")
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Magit</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="ru">RU</SelectItem>
                  <SelectItem value="uz">UZ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}