import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

const PaymentSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Here you could verify payment status with your backend
    console.log("Payment successful")
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-green-900 dark:text-green-100">
                Payment Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your payment has been processed successfully. Your property listing application is now being reviewed.
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate("/")} className="w-full">
                  Return to Home
                </Button>
                <Button variant="outline" onClick={() => navigate("/list-property")} className="w-full">
                  List Another Property
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess