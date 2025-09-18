import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const liquidProgressButtonVariants = cva(
  "relative overflow-hidden transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        warm: "bg-magit-warm text-primary hover:bg-magit-warm/80 shadow-warm",
        trust: "bg-magit-trust text-white hover:bg-magit-trust/90 shadow-md border-magit-trust/20",
        success: "bg-magit-success text-white hover:bg-magit-success/90 shadow-md",
        warning: "bg-magit-warm text-white hover:bg-magit-warm/90 shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface LiquidProgressButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidProgressButtonVariants> {
  progress?: number; // 0-100
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LiquidProgressButton = React.forwardRef<
  HTMLButtonElement,
  LiquidProgressButtonProps
>(({ 
  className, 
  variant = "success", 
  size, 
  progress = 0, 
  isLoading = false, 
  loadingText,
  children,
  disabled,
  ...props 
}, ref) => {
  const progressPercentage = Math.min(Math.max(progress, 0), 100);
  const showProgress = isLoading;
  
  return (
    <Button
      ref={ref}
      className={cn(liquidProgressButtonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Liquid fill background */}
      {showProgress && (
        <div 
          className="absolute inset-0 z-0 transition-all duration-500 ease-out"
          style={{
            transform: `translateY(${100 - progressPercentage}%)`,
            backgroundColor: `hsl(var(--magit-success))`,
          }}
        >
          {/* Wave effect */}
          <div 
            className="absolute top-0 left-0 w-full h-3 opacity-40 animate-wave"
            style={{
              background: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 8px,
                rgba(255,255,255,0.2) 8px,
                rgba(255,255,255,0.2) 16px
              )`
            }}
          />
        </div>
      )}
      
      {/* Button content */}
      <span className="relative z-10 font-medium">
        {showProgress ? (
          <>
            {loadingText ? `${loadingText} ` : ""}
            {Math.round(progressPercentage)}%
          </>
        ) : (
          children
        )}
      </span>
      
      {/* Wave animation is handled via Tailwind config */}
    </Button>
  );
});

LiquidProgressButton.displayName = "LiquidProgressButton";