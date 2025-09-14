import { ArrowLeft, HelpCircle, Search, Phone, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "@/hooks/useTranslation"
import { useGlobalHalalMode } from "@/hooks/useGlobalHalalMode"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useState } from "react"

const FAQ = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isHalalMode } = useGlobalHalalMode()
  const [searchQuery, setSearchQuery] = useState("")

  const faqCategories = [
    {
      title: t('faq.generalTitle'),
      icon: HelpCircle,
      questions: [
        {
          question: t('faq.whatIsMagit'),
          answer: t('faq.whatIsMagitAnswer')
        },
        {
          question: t('faq.howToCreateAccount'),
          answer: t('faq.howToCreateAccountAnswer')
        },
        {
          question: t('faq.isItFree'),
          answer: t('faq.isItFreeAnswer')
        },
        {
          question: t('faq.howToContactSupport'),
          answer: t('faq.howToContactSupportAnswer')
        }
      ]
    },
    {
      title: t('faq.propertyTitle'),
      icon: HelpCircle,
      questions: [
        {
          question: t('faq.howToListProperty'),
          answer: t('faq.howToListPropertyAnswer')
        },
        {
          question: t('faq.propertyVerification'),
          answer: t('faq.propertyVerificationAnswer')
        },
        {
          question: t('faq.editProperty'),
          answer: t('faq.editPropertyAnswer')
        },
        {
          question: t('faq.propertyPhotos'),
          answer: t('faq.propertyPhotosAnswer')
        }
      ]
    },
    {
      title: t('faq.financingTitle'),
      icon: HelpCircle,
      questions: [
        {
          question: t('faq.whatIsHalalFinancing'),
          answer: t('faq.whatIsHalalFinancingAnswer')
        },
        {
          question: t('faq.minimumDownPayment'),
          answer: t('faq.minimumDownPaymentAnswer')
        },
        {
          question: t('faq.financingPeriods'),
          answer: t('faq.financingPeriodsAnswer')
        },
        {
          question: t('faq.financingRequirements'),
          answer: t('faq.financingRequirementsAnswer')
        }
      ]
    },
    {
      title: t('faq.visitsTitle'),
      icon: HelpCircle,
      questions: [
        {
          question: t('faq.howToScheduleVisit'),
          answer: t('faq.howToScheduleVisitAnswer')
        },
        {
          question: t('faq.visitCost'),
          answer: t('faq.visitCostAnswer')
        },
        {
          question: t('faq.cancelVisit'),
          answer: t('faq.cancelVisitAnswer')
        },
        {
          question: t('faq.visitPreparation'),
          answer: t('faq.visitPreparationAnswer')
        }
      ]
    }
  ]

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isHalalMode ? 'bg-gradient-to-br from-magit-trust/5 to-primary/5' : 'bg-gradient-hero'
    }`}>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge 
            variant="secondary" 
            className={`mb-4 ${isHalalMode ? 'bg-magit-trust/10 text-magit-trust border-magit-trust/20' : ''}`}
          >
            {t('faq.helpCenter')}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            {t('faq.pageTitle')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('faq.pageSubtitle')}
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('faq.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <category.icon className={`h-6 w-6 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.questions.map((faq, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 rounded-lg transition-colors">
                      <span className="font-medium">{faq.question}</span>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {t('faq.stillHaveQuestions')}
            </h2>
            <p className="text-muted-foreground">
              {t('faq.contactUsDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Phone className={`h-8 w-8 mx-auto mb-4 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                <h3 className="font-semibold mb-2">{t('faq.callUs')}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('faq.callDescription')}
                </p>
                <Button variant="outline">+998 (71) 123-45-67</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Mail className={`h-8 w-8 mx-auto mb-4 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                <h3 className="font-semibold mb-2">{t('faq.emailUs')}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('faq.emailDescription')}
                </p>
                <Button variant="outline">support@magit.uz</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <MessageCircle className={`h-8 w-8 mx-auto mb-4 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                <h3 className="font-semibold mb-2">{t('faq.liveChat')}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('faq.liveChatDescription')}
                </p>
                <Button 
                  className={isHalalMode ? 'bg-magit-trust hover:bg-magit-trust/90' : ''}
                >
                  {t('faq.startChat')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer isHalalMode={isHalalMode} t={t} />
    </div>
  )
}

export default FAQ