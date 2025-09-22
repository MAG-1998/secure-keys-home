import { useTranslation } from "@/hooks/useTranslation"
import { useGlobalHalalMode } from "@/hooks/useGlobalHalalMode"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const PrivacyPolicy = () => {
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
            {t('privacy.title')}
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            {t('privacy.subtitle')}
          </p>
          <p className="text-muted-foreground text-sm">
            {t('privacy.lastUpdated')}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {t('privacy.intro')}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('privacy.section1.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.section1.content')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.section1.personal')}</li>
              <li>{t('privacy.section1.identity')}</li>
              <li>{t('privacy.section1.property')}</li>
              <li>{t('privacy.section1.financial')}</li>
              <li>{t('privacy.section1.payment')}</li>
              <li>{t('privacy.section1.technical')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('privacy.section2.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.section2.content')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.section2.verify')}</li>
              <li>{t('privacy.section2.provide')}</li>
              <li>{t('privacy.section2.process')}</li>
              <li>{t('privacy.section2.review')}</li>
              <li>{t('privacy.section2.payments')}</li>
              <li>{t('privacy.section2.improve')}</li>
              <li>{t('privacy.section2.comply')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('privacy.section3.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.section3.content')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.section3.oneId')}</li>
              <li>{t('privacy.section3.payment')}</li>
              <li>{t('privacy.section3.legal')}</li>
              <li>{t('privacy.section3.government')}</li>
              <li>{t('privacy.section3.service')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('privacy.section4.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.section4.storage')}</li>
              <li>{t('privacy.section4.encryption')}</li>
              <li>{t('privacy.section4.access')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('privacy.section5.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.section5.content')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.section5.request')}</li>
              <li>{t('privacy.section5.correct')}</li>
              <li>{t('privacy.section5.delete')}</li>
              <li>{t('privacy.section5.withdraw')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('privacy.section6.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.section6.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('privacy.section7.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.section7.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('privacy.section8.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.section8.content')}
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>{t('privacy.contact.email')}</p>
              <p>{t('privacy.contact.phone')}</p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            This privacy policy is effective as of December 15, 2024 and will remain in effect except with respect to any changes in its provisions in the future, 
            which will be in effect immediately after being posted on this page.
          </p>
        </div>
      </main>
      
      <Footer isHalalMode={isHalalMode} t={t} />
    </div>
  )
}

export default PrivacyPolicy