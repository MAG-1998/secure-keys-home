import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Wifi, WifiOff, CheckCircle, Loader2 } from "lucide-react";

interface MapStatusIndicatorProps {
  status: 'loading' | 'error' | 'offline' | 'ready';
  error?: string;
  onRetry?: () => void;
  onReload?: () => void;
  t: (key: string) => string;
}

export const MapStatusIndicator: React.FC<MapStatusIndicatorProps> = ({
  status,
  error,
  onRetry,
  onReload,
  t
}) => {
  if (status === 'ready') {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          title: t('map.loading'),
          message: t('map.loadingMessage'),
          variant: 'default' as const,
          showRetry: false
        };
      case 'offline':
        return {
          icon: <WifiOff className="h-5 w-5" />,
          title: t('map.offline'),
          message: t('map.offlineMessage'),
          variant: 'destructive' as const,
          showRetry: true
        };
      case 'error':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          title: t('map.error'),
          message: error || t('map.errorMessage'),
          variant: 'destructive' as const,
          showRetry: true
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          title: t('map.unknown'),
          message: t('map.unknownMessage'),
          variant: 'destructive' as const,
          showRetry: true
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={`w-full h-[300px] border ${config.variant === 'destructive' ? 'border-destructive/20' : 'border-border'}`}>
      <CardContent className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <div className={`flex items-center gap-2 ${config.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`}>
          {config.icon}
          <h3 className="font-semibold">{config.title}</h3>
        </div>
        
        <p className="text-center text-muted-foreground text-sm max-w-sm">
          {config.message}
        </p>

        {config.showRetry && (
          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('map.retry')}
              </Button>
            )}
            {onReload && (
              <Button onClick={onReload} variant="outline" size="sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('map.reload')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};