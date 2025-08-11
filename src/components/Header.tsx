import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation, type Language } from "@/hooks/useTranslation";

export const Header = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-14 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" aria-hidden />
          <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="uz">O‘zbekcha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};
