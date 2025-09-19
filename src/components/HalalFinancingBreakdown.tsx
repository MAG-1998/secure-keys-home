import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { calculateHalalFinancing, formatCurrency, getPeriodOptions } from "@/utils/halalFinancing"
import { useFinancingStore } from "@/stores/financingStore"
import { useTranslation } from "@/hooks/useTranslation"
import { Calculator, FileText } from "lucide-react"

interface HalalFinancingBreakdownProps {
  propertyPrice: number
  onRequestFinancing: (cashAvailable: number, periodMonths: number) => void
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
  const financingStore = useFinancingStore()
  const { t } = useTranslation()
  
  const [cashAmount, setCashAmount] = useState(() => {
    // Initialize from store first, then fallback to props
    return financingStore.cashAvailable || initialCashAvailable || "";
  });
  const [financingPeriod, setFinancingPeriod] = useState(() => {
    // Initialize from store first, then fallback to props
    return financingStore.periodMonths || initialPeriodMonths || "";
  });

  // Sync with store values when they change (from other components)
  useEffect(() => {
    if (financingStore.cashAvailable !== cashAmount) {
      setCashAmount(financingStore.cashAvailable);
    }
    if (financingStore.periodMonths !== financingPeriod) {
      setFinancingPeriod(financingStore.periodMonths);
    }
  }, [financingStore.cashAvailable, financingStore.periodMonths]);

  const periodOptions = getPeriodOptions()

  const calculation = useMemo(() => {
    const cash = parseFloat(cashAmount) || 0
    const period = parseInt(financingPeriod) || 0
    
    if (!period || cash >= propertyPrice) {
      return null
    }

    // Validate minimum 50% cash requirement
    const requiredCash = 0.5 * propertyPrice;
    if (cash < requiredCash) {
      return null; // Don't show calculation if insufficient cash
    }

    return calculateHalalFinancing(cash, propertyPrice, period)
  }, [cashAmount, financingPeriod, propertyPrice])

  const handleCashChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setCashAmount(sanitized);
    // Update the store so other components can see the change
    financingStore.updateState({ cashAvailable: sanitized });
  }

  const handlePeriodChange = (value: string) => {
    setFinancingPeriod(value);
    // Update the store so other components can see the change
    financingStore.updateState({ periodMonths: value });
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          {t('halal.calculator')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="cash-amount">{t('halal.cashAvailable')}</Label>
            <Input
              id="cash-amount"
              placeholder={t('halal.enterCashAmount')}
              value={cashAmount}
              onChange={(e) => handleCashChange(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="financing-period">{t('halal.financingPeriod')}</Label>
            <Select value={financingPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('halal.selectPeriod')} />
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
              <h4 className="font-semibold text-foreground">{t('halal.paymentBreakdown')}</h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Price:</span>
                  <span className="font-medium">{formatCurrency(calculation.propertyPrice!)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">+ Financing Costs:</span>
                  <span className="font-medium">{formatCurrency(calculation.serviceFee + calculation.fixedFee + calculation.tax)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground border-t pt-2">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculation.propertyPrice! + calculation.serviceFee + calculation.fixedFee + calculation.tax)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>- Magit Discount (1%):</span>
                  <span>-{formatCurrency(calculation.magitDiscount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('halal.cashPayment')}:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(cashAmount))}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total After Discount:</span>
                  <Badge variant="default" className="text-base px-3 py-1">
                    {formatCurrency(calculation.finalPriceAfterDiscount)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t('halal.monthlyPayment')}:</span>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {formatCurrency(calculation.requiredMonthlyPayment)}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg mt-3">
                <p className="text-sm text-green-700 dark:text-green-300">
                  💡 <strong>Magit covers the 1% sales fee</strong> and passes the savings directly to you as a discount on your financing.
                </p>
              </div>
            </div>

            <Button 
              onClick={() => onRequestFinancing(parseFloat(cashAmount) || 0, parseInt(financingPeriod) || 0)} 
              className="w-full" 
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              {t('halal.requestFinancing')}
            </Button>
          </div>
        )}

        {/* Show insufficient cash error */}
        {!calculation && financingPeriod && cashAmount && parseFloat(cashAmount) < propertyPrice && parseFloat(cashAmount) < (0.5 * propertyPrice) && (
          <div className="text-center py-4">
            <Badge variant="destructive" className="text-sm">
              {t('halal.minimumCashRequired')} {formatCurrency(0.5 * propertyPrice)}
            </Badge>
          </div>
        )}

        {!calculation && financingPeriod && cashAmount && parseFloat(cashAmount) >= propertyPrice && (
          <div className="text-center py-4">
            <Badge variant="success" className="text-sm">
              {t('halal.noFinancingNeeded')}
            </Badge>
          </div>
        )}

        {!calculation && (!financingPeriod || !cashAmount) && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {t('halal.enterDetailsForBreakdown')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}