import React, { useEffect, useState } from 'react';

interface PriceOdometerProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  startAnimation?: boolean;
  initialValue?: number;
}

export const PriceOdometer: React.FC<PriceOdometerProps> = ({ 
  value, 
  className = "", 
  prefix = "$",
  suffix = "",
  startAnimation = true,
  initialValue
}) => {
  const [displayValue, setDisplayValue] = useState(initialValue ?? value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (startAnimation && !hasAnimated && displayValue !== value) {
      setIsAnimating(true);
      setHasAnimated(true);
      
      const difference = Math.abs(value - displayValue);
      const duration = Math.min(2000, Math.max(800, difference * 2));
      const steps = Math.min(60, Math.max(20, difference / 10));
      const stepValue = (value - displayValue) / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(value);
          setIsAnimating(false);
          clearInterval(timer);
        } else {
          setDisplayValue(prev => prev + stepValue);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value, displayValue, startAnimation, hasAnimated]);

  const formattedValue = Math.round(displayValue).toLocaleString();

  return (
    <div className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}>
      <span className="transition-all duration-75">
        {prefix}{formattedValue}{suffix}
      </span>
    </div>
  );
};