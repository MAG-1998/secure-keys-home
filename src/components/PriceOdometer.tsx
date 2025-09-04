import React, { useEffect, useState } from 'react';

interface PriceOdometerProps {
  value: number;
  className?: string;
  prefix?: string;
}

export const PriceOdometer: React.FC<PriceOdometerProps> = ({ 
  value, 
  className = "", 
  prefix = "$" 
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayValue !== value) {
      setIsAnimating(true);
      
      const duration = 300;
      const steps = 20;
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
  }, [value, displayValue]);

  const formattedValue = Math.round(displayValue).toLocaleString();

  return (
    <div className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}>
      <span className="transition-all duration-75">
        {prefix}{formattedValue}
      </span>
    </div>
  );
};