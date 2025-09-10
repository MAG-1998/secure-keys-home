import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation, type Language } from "@/hooks/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import { MagitLogo } from "@/components/MagitLogo";

export const Header = () => {
  const { language, setLanguage } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <MagitLogo size="sm" />
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
            <SelectTrigger className={`${isMobile ? 'w-14' : 'w-20'}`}>
              <SelectValue placeholder={language === 'en' ? (isMobile ? 'EN' : 'ENG') : language === 'ru' ? 'RU' : 'UZ'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{isMobile ? 'EN' : 'ENG'}</SelectItem>
              <SelectItem value="ru">RU</SelectItem>
              <SelectItem value="uz">UZ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};
