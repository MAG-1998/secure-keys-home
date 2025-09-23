import { useTranslation } from "@/hooks/useTranslation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Search, Calendar, DollarSign, Shield, Users } from "lucide-react"

const HowItWorks = () => {
  const { t } = useTranslation()

  const steps = [
    {
      icon: Search,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      features: [
        t('howItWorks.step1.feature1'),
        t('howItWorks.step1.feature2'),
        t('howItWorks.step1.feature3')
      ]
    },
    {
      icon: Calendar,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      features: [
        t('howItWorks.step2.feature1'),
        t('howItWorks.step2.feature2'),
        t('howItWorks.step2.feature3')
      ]
    },
    {
      icon: DollarSign,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      features: [
        t('howItWorks.step3.feature1'),
        t('howItWorks.step3.feature2'),
        t('howItWorks.step3.feature3')
      ]
    },
    {
      icon: Shield,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
      features: [
        t('howItWorks.step4.feature1'),
        t('howItWorks.step4.feature2'),
        t('howItWorks.step4.feature3')
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('howItWorks.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('howItWorks.subtitle')}
            </p>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {t('howItWorks.badge')}
            </Badge>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {t('howItWorks.stepLabel')} {index + 1}
                      </Badge>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Magit */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              {t('howItWorks.whyChoose.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('howItWorks.whyChoose.reason1.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('howItWorks.whyChoose.reason1.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('howItWorks.whyChoose.reason2.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('howItWorks.whyChoose.reason2.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('howItWorks.whyChoose.reason3.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('howItWorks.whyChoose.reason3.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HowItWorks