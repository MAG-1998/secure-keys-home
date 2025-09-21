import { useTranslation } from "@/hooks/useTranslation"
import { useGlobalHalalMode } from "@/hooks/useGlobalHalalMode"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const TermsAndConditions = () => {
  const { t } = useTranslation()
  const { isHalalMode } = useGlobalHalalMode()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isHalalMode 
        ? 'bg-gradient-to-br from-magit-trust/5 via-background to-magit-trust/10' 
        : 'bg-gradient-to-br from-primary/5 via-background to-secondary/10'
    }`}>
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('terms.title')}
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            {t('terms.subtitle')}
          </p>
          <p className="text-muted-foreground text-sm">
            {t('terms.lastUpdated')}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section1.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section1.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section2.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section2.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section3.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section3.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section4.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section4.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section5.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section5.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section6.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section6.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section7.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section7.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section8.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section8.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section9.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section9.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section10.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section10.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('terms.section11.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.section11.content')}
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>{t('terms.contact.email')}</p>
              <p>{t('terms.contact.phone')}</p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            These terms and conditions are effective as of {new Date().toLocaleDateString()} and will remain in effect except with respect to any changes in its provisions in the future, 
            which will be in effect immediately after being posted on this page.
          </p>
        </div>
      </main>
      
      <Footer isHalalMode={isHalalMode} t={t} />
    </div>
  )
}

export default TermsAndConditions