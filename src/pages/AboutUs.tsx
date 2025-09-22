import { useTranslation } from "@/hooks/useTranslation"
import { useGlobalHalalMode } from "@/hooks/useGlobalHalalMode"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const AboutUs = () => {
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
            {t('about.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('about.subtitle')}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('about.story.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('about.story.intro')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.story.experience')}
            </p>
            <p className="text-muted-foreground leading-relaxed font-medium">
              {t('about.story.why')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.story.solution')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.story.timing')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('about.mission.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.mission.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('about.vision.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.vision.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('about.future.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t('about.future.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('about.future.families')}</li>
              <li>{t('about.future.investors')}</li>
              <li>{t('about.future.community')}</li>
            </ul>
          </CardContent>
        </Card>

        <Separator className="my-8" />
      </main>
      
      <Footer isHalalMode={isHalalMode} t={t} />
    </div>
  )
}

export default AboutUs