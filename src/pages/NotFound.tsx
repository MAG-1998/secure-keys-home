import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useTranslation } from "@/hooks/useTranslation";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-4">{t('notFound.subtitle')}</p>
          <Link to="/" className="text-primary hover:text-primary/80 underline">
            {t('common.returnHome')}
          </Link>
        </div>
      </div>
      <Footer t={t} />
    </div>
  );
};

export default NotFound;
