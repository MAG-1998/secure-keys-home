import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "@/hooks/useTranslation"

const PaymentCancelled = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-red-900 dark:text-red-100">
                  {t('payment.cancelled.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  {t('payment.cancelled.desc')}
                </p>
                <div className="space-y-2">
                  <Button onClick={() => navigate("/list-property")} className="w-full">
                    {t('common.tryAgain')}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                    {t('common.returnHome')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer t={t} />
    </div>
  )
}

export default PaymentCancelled