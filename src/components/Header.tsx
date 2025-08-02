import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";
export const Header = () => {
  const [language, setLanguage] = useState("en");
  return <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      
    </header>;
};