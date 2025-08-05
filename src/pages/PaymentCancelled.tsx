import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useNavigate } from "react-router-dom"

const PaymentCancelled = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <ThemeToggle />
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900 dark:text-red-100">
                Payment Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your payment was cancelled. You can try again or return to the application.
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate("/list-property")} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancelled