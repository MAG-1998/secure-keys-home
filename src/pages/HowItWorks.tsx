import { useState } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { CheckCircle, Search, Calendar, DollarSign, Shield, Users, CreditCard, Building } from "lucide-react"

const HowItWorks = () => {
  const { t } = useTranslation()
  const [selectedOption, setSelectedOption] = useState<'cash' | 'financing' | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)

  const handleOptionSelect = (option: 'cash' | 'financing') => {
    if (selectedOption === option) return
    
    setIsFlipping(true)
    setTimeout(() => {
      setSelectedOption(option)
      setIsFlipping(false)
    }, 600)
  }

  const getCashSteps = () => [
    {
      icon: Search,
      title: t('howItWorks.cash.step1.title'),
      description: t('howItWorks.cash.step1.description'),
      features: [
        t('howItWorks.cash.step1.feature1'),
        t('howItWorks.cash.step1.feature2'),
        t('howItWorks.cash.step1.feature3')
      ]
    },
    {
      icon: Calendar,
      title: t('howItWorks.cash.step2.title'),
      description: t('howItWorks.cash.step2.description'),
      features: [
        t('howItWorks.cash.step2.feature1'),
        t('howItWorks.cash.step2.feature2'),
        t('howItWorks.cash.step2.feature3')
      ]
    },
    {
      icon: CreditCard,
      title: t('howItWorks.cash.step3.title'),
      description: t('howItWorks.cash.step3.description'),
      features: [
        t('howItWorks.cash.step3.feature1'),
        t('howItWorks.cash.step3.feature2'),
        t('howItWorks.cash.step3.feature3')
      ]
    },
    {
      icon: Building,
      title: t('howItWorks.cash.step4.title'),
      description: t('howItWorks.cash.step4.description'),
      features: [
        t('howItWorks.cash.step4.feature1'),
        t('howItWorks.cash.step4.feature2'),
        t('howItWorks.cash.step4.feature3')
      ]
    }
  ]

  const getFinancingSteps = () => [
    {
      icon: Search,
      title: t('howItWorks.financing.step1.title'),
      description: t('howItWorks.financing.step1.description'),
      features: [
        t('howItWorks.financing.step1.feature1'),
        t('howItWorks.financing.step1.feature2'),
        t('howItWorks.financing.step1.feature3')
      ]
    },
    {
      icon: Calendar,
      title: t('howItWorks.financing.step2.title'),
      description: t('howItWorks.financing.step2.description'),
      features: [
        t('howItWorks.financing.step2.feature1'),
        t('howItWorks.financing.step2.feature2'),
        t('howItWorks.financing.step2.feature3')
      ]
    },
    {
      icon: Shield,
      title: t('howItWorks.financing.step3.title'),
      description: t('howItWorks.financing.step3.description'),
      features: [
        t('howItWorks.financing.step3.feature1'),
        t('howItWorks.financing.step3.feature2'),
        t('howItWorks.financing.step3.feature3')
      ]
    },
    {
      icon: Building,
      title: t('howItWorks.financing.step4.title'),
      description: t('howItWorks.financing.step4.description'),
      features: [
        t('howItWorks.financing.step4.feature1'),
        t('howItWorks.financing.step4.feature2'),
        t('howItWorks.financing.step4.feature3')
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Interactive Coin */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('howItWorks.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-12">
              {t('howItWorks.subtitle')}
            </p>

            {/* Interactive Coin Section */}
            <div className="relative mb-16">
              <h2 className="text-2xl font-semibold mb-8">
                {t('howItWorks.coinQuestion')}
              </h2>
              
              {/* Coin Container */}
              <div className="flex justify-center mb-8">
                <div 
                  className={`relative w-80 h-80 mx-auto transition-all duration-1000 ${
                    selectedOption ? 'scale-110' : 'scale-100'
                  } ${isFlipping ? 'animate-spin' : ''}`}
                  style={{ 
                    perspective: '1000px'
                  }}
                >
                  {/* Coin */}
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-primary/20 shadow-2xl transition-all duration-700"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      transform: selectedOption === 'financing' ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    {/* Cash Side */}
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-6 flex flex-col items-center justify-center text-white"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <CreditCard className="w-12 h-12 mb-3" />
                      <h3 className="text-lg font-bold mb-2 text-center">{t('howItWorks.cashSide.title')}</h3>
                      <p className="text-xs text-center opacity-90 mb-3">{t('howItWorks.cashSide.subtitle')}</p>
                      <div className="text-[10px] space-y-1 text-center">
                        <div>• {t('howItWorks.cashSide.feature1')}</div>
                        <div>• {t('howItWorks.cashSide.feature2')}</div>
                        <div>• {t('howItWorks.cashSide.feature3')}</div>
                      </div>
                    </div>
                    
                    {/* Financing Side */}
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 p-6 flex flex-col items-center justify-center text-white"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <Shield className="w-12 h-12 mb-3" />
                      <h3 className="text-lg font-bold mb-2 text-center">{t('howItWorks.financingSide.title')}</h3>
                      <p className="text-xs text-center opacity-90 mb-3">{t('howItWorks.financingSide.subtitle')}</p>
                      <div className="text-[10px] space-y-1 text-center">
                        <div>• {t('howItWorks.financingSide.feature1')}</div>
                        <div>• {t('howItWorks.financingSide.feature2')}</div>
                        <div>• {t('howItWorks.financingSide.feature3')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option Buttons */}
              <div className="flex justify-center gap-6 mb-8">
                <Button
                  size="lg"
                  variant={selectedOption === 'cash' ? 'default' : 'outline'}
                  onClick={() => handleOptionSelect('cash')}
                  className="px-8 py-4"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t('howItWorks.cashOption')}
                </Button>
                <Button
                  size="lg"
                  variant={selectedOption === 'financing' ? 'default' : 'outline'}
                  onClick={() => handleOptionSelect('financing')}
                  className="px-8 py-4"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  {t('howItWorks.financingOption')}
                </Button>
              </div>

              {selectedOption && (
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  {selectedOption === 'cash' ? t('howItWorks.cashBadge') : t('howItWorks.financingBadge')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      {selectedOption && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {selectedOption === 'cash' ? t('howItWorks.cashStepsTitle') : t('howItWorks.financingStepsTitle')}
              </h2>
              <p className="text-muted-foreground">
                {selectedOption === 'cash' ? t('howItWorks.cashStepsSubtitle') : t('howItWorks.financingStepsSubtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {(selectedOption === 'cash' ? getCashSteps() : getFinancingSteps()).map((step, index) => (
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
      )}

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