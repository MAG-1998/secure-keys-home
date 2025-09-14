import { ArrowLeft, Calculator, DollarSign, Shield, CheckCircle, Clock, Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "@/hooks/useTranslation"
import { useGlobalHalalMode } from "@/hooks/useGlobalHalalMode"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

const FinancingInfo = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isHalalMode } = useGlobalHalalMode()

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
            {isHalalMode ? t('financing.shariaCompliant') : t('financing.transparentFinancing')}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            {t('financing.pageTitle')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('financing.pageSubtitle')}
          </p>
        </div>

        {/* How It Works Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('financing.howItWorks')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Calculator className={`h-12 w-12 mx-auto mb-4 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                <CardTitle>{t('financing.step1Title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('financing.step1Description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <FileText className={`h-12 w-12 mx-auto mb-4 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                <CardTitle>{t('financing.step2Title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('financing.step2Description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CheckCircle className={`h-12 w-12 mx-auto mb-4 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                <CardTitle>{t('financing.step3Title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('financing.step3Description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('financing.featuresTitle')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <DollarSign className={`h-8 w-8 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                  <CardTitle>{t('financing.noInterestTitle')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('financing.noInterestDescription')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className={`h-8 w-8 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                  <CardTitle>{t('financing.secureTitle')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('financing.secureDescription')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Clock className={`h-8 w-8 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                  <CardTitle>{t('financing.flexibleTitle')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('financing.flexibleDescription')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className={`h-8 w-8 ${isHalalMode ? 'text-magit-trust' : 'text-primary'}`} />
                  <CardTitle>{t('financing.supportTitle')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('financing.supportDescription')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Terms Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('financing.termsTitle')}
          </h2>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('financing.eligibilityTitle')}</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      {t('financing.eligibility1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      {t('financing.eligibility2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      {t('financing.eligibility3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      {t('financing.eligibility4')}
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('financing.documentsTitle')}</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      {t('financing.documents1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      {t('financing.documents2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      {t('financing.documents3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      {t('financing.documents4')}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t('financing.ctaTitle')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('financing.ctaDescription')}
              </p>
              <Button 
                size="lg" 
                className={`gap-2 ${isHalalMode ? 'bg-magit-trust hover:bg-magit-trust/90' : ''}`}
                onClick={() => navigate('/')}
              >
                <Calculator className="h-5 w-5" />
                {t('financing.startCalculating')}
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer isHalalMode={isHalalMode} t={t} />
    </div>
  )
}

export default FinancingInfo