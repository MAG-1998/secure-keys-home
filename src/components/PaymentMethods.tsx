import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { CreditCard, Smartphone, Wallet } from "lucide-react"

interface PaymentMethodsProps {
  amount: number
  onPaymentSuccess?: () => void
}

const PaymentMethods = ({ amount, onPaymentSuccess }: PaymentMethodsProps) => {
  const [selectedMethod, setSelectedMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  

  const paymentMethods = [
    {
      id: "payme",
      name: "Payme",
      icon: Smartphone,
      description: "Pay with Payme wallet"
    },
    {
      id: "click",
      name: "Click",
      icon: CreditCard,
      description: "Pay with Click payment system"
    },
    {
      id: "uzum",
      name: "Uzum Bank",
      icon: Wallet,
      description: "Pay with Uzum Bank"
    }
  ]

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to continue",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke(`create-${selectedMethod}-payment`, {
        body: {
          amount: amount,
          currency: "UZS",
          return_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/payment-cancelled`
        }
      })

      if (error) throw error

      if (data?.payment_url) {
        // Open payment gateway in new tab
        window.open(data.payment_url, '_blank')
      }

    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {amount.toLocaleString()} UZS
          </div>
        </div>

        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
          <div className="space-y-4">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon
              return (
                <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                    <IconComponent className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{method.name}</div>
                      <div className="text-sm text-muted-foreground">{method.description}</div>
                    </div>
                  </Label>
                </div>
              )
            })}
          </div>
        </RadioGroup>

        <Button 
          onClick={handlePayment} 
          disabled={!selectedMethod || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </Button>
      </CardContent>
    </Card>
  )
}

export { PaymentMethods }