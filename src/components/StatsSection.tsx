import React from 'react';
import { PriceOdometer } from './PriceOdometer';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { usePropertyCount } from '@/hooks/usePropertyCount';

interface StatsSectionProps {
  t: (key: string) => string;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ t }) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.3,
    triggerOnce: true
  });
  
  const { count, isLoading } = usePropertyCount();

  return (
    <section id="financing" className="py-16 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div ref={elementRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">
              {isLoading ? (
                <span>...</span>
              ) : (
                <PriceOdometer
                  value={count || 1500}
                  prefix=""
                  suffix="+"
                  initialValue={0}
                  startAnimation={isIntersecting && !isLoading && count !== null}
                  className="inline-block"
                />
              )}
            </div>
            <div className="text-muted-foreground">{t('stats.verifiedHomes')}</div>
          </div>
          <div className="text-center">
            <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">95%</div>
            <div className="text-muted-foreground">{t('stats.trustRating')}</div>
          </div>
          <div className="text-center">
            <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">0%</div>
            <div className="text-muted-foreground">{t('stats.interestRate')}</div>
          </div>
          <div className="text-center">
            <div className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">{t('stats.support')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};