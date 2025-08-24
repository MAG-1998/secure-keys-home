import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { calculateHalalFinancing, formatCurrency, getPeriodOptions } from "@/utils/halalFinancing"
import { Calculator, FileText } from "lucide-react"

interface HalalFinancingBreakdownProps {
  propertyPrice: number
  onRequestFinancing: () => void
  className?: string
  initialCashAvailable?: string
  initialPeriodMonths?: string
}

export const HalalFinancingBreakdown = ({ 
  propertyPrice, 
  onRequestFinancing,
  className = "",
  initialCashAvailable = "",
  initialPeriodMonths = ""
}: HalalFinancingBreakdownProps) => {
  const [cashAmount, setCashAmount] = useState(initialCashAvailable)
  const [financingPeriod, setFinancingPeriod] = useState(initialPeriodMonths)

  const periodOptions = getPeriodOptions()

  const calculation = useMemo(() => {
    const cash = parseFloat(cashAmount) || 0
    const period = parseInt(financingPeriod) || 0
    
    if (!period || cash >= propertyPrice) {
      return null
    }

    return calculateHalalFinancing(cash, propertyPrice, period)
  }, [cashAmount, financingPeriod, propertyPrice])

  const handleCashChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "")
    setCashAmount(numericValue)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Halal Financing Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="cash-amount">Cash Available ($)</Label>
            <Input
              id="cash-amount"
              placeholder="Enter your cash amount"
              value={cashAmount}
              onChange={(e) => handleCashChange(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="financing-period">Financing Period</Label>
            <Select value={financingPeriod} onValueChange={setFinancingPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {calculation && (
          <div className="space-y-4">
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Payment Breakdown</h4>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Price:</span>
                  <span className="font-medium">{formatCurrency(calculation.propertyPrice!)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash Payment:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(cashAmount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Financing Amount:</span>
                  <span className="font-medium">{formatCurrency(calculation.financingAmount)}</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fixed Fee:</span>
                  <span>{formatCurrency(calculation.fixedFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee:</span>
                  <span>{formatCurrency(calculation.serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (12%):</span>
                  <span>{formatCurrency(calculation.vat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Overpay:</span>
                  <span>{formatCurrency(calculation.overpay)}</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Cost:</span>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {formatCurrency(calculation.totalCost)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Monthly Payment:</span>
                  <Badge variant="default" className="text-base px-3 py-1">
                    {formatCurrency(calculation.requiredMonthlyPayment)}
                  </Badge>
                </div>
              </div>
            </div>

            <Button 
              onClick={onRequestFinancing} 
              className="w-full" 
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Request Halal Financing
            </Button>
          </div>
        )}

        {!calculation && financingPeriod && cashAmount && parseFloat(cashAmount) >= propertyPrice && (
          <div className="text-center py-4">
            <Badge variant="success" className="text-sm">
              No financing needed - your cash covers the full property price!
            </Badge>
          </div>
        )}

        {!calculation && (!financingPeriod || !cashAmount) && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Enter your cash amount and select a financing period to see the breakdown
          </div>
        )}
      </CardContent>
    </Card>
  )
}