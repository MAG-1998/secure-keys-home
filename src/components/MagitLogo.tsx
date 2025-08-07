import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

interface MagitLogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "full" | "icon"
  isLoading?: boolean
}

export const MagitLogo = ({ className, size = "md", variant = "full", isLoading = false }: MagitLogoProps) => {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (!isLoading) {
      navigate("/")
    }
  }
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl", 
    lg: "text-4xl",
    xl: "text-6xl"
  }

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12", 
    xl: "w-16 h-16"
  }

  if (variant === "icon") {
    return (
      <div 
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 transition-opacity",
          isLoading ? "cursor-default opacity-70" : "cursor-pointer hover:opacity-90",
          iconSizes[size],
          className
        )}
        onClick={handleClick}
      >
        <div className="text-primary-foreground font-heading font-bold text-center leading-none">
          {size === "sm" ? "M" : size === "md" ? "M" : "M"}
        </div>
        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "flex items-center space-x-3 transition-opacity", 
        isLoading ? "cursor-default opacity-70" : "cursor-pointer hover:opacity-90",
        className
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "relative flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80",
        iconSizes[size]
      )}>
        <div className="text-primary-foreground font-heading font-bold text-center leading-none">
          M
        </div>
        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
      </div>
      <span className={cn(
        "font-heading font-semibold text-primary tracking-tight",
        sizeClasses[size]
      )}>
        Magit
      </span>
    </div>
  )
}