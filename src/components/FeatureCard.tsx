import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  badge?: string
  badgeVariant?: "success" | "trust" | "warning"
  className?: string
}

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  badge, 
  badgeVariant = "trust",
  className 
}: FeatureCardProps) => {
  return (
    <Card className={cn(
      "relative overflow-hidden bg-gradient-card border-border/50 hover:shadow-soft transition-all duration-300 group",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-semibold text-foreground">
                {title}
              </h3>
              {badge && (
                <Badge variant={badgeVariant} className="ml-2">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}