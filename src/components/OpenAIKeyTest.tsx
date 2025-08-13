import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const OpenAIKeyTest = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'unknown' | 'present' | 'missing'>('unknown');
  const { toast } = useToast();

  const checkOpenAIKey = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('env-check');
      
      if (error) {
        throw error;
      }

      const isPresent = data?.OPENAI_API_KEY_present;
      setKeyStatus(isPresent ? 'present' : 'missing');
      
      toast({
        title: isPresent ? 'OpenAI API Key Found' : 'OpenAI API Key Missing',
        description: isPresent 
          ? 'The OpenAI API key is configured and available'
          : 'Please configure the OpenAI API key in Supabase secrets',
        variant: isPresent ? 'default' : 'destructive'
      });
    } catch (error: any) {
      console.error('Error checking OpenAI key:', error);
      setKeyStatus('unknown');
      toast({
        title: 'Error checking API key',
        description: error.message || 'Failed to check OpenAI API key status',
        variant: 'destructive'
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>OpenAI API Key Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge 
            variant={
              keyStatus === 'present' ? 'default' : 
              keyStatus === 'missing' ? 'destructive' : 
              'secondary'
            }
          >
            {keyStatus === 'present' ? 'Present' : 
             keyStatus === 'missing' ? 'Missing' : 
             'Unknown'}
          </Badge>
        </div>
        <Button 
          onClick={checkOpenAIKey} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? 'Checking...' : 'Check API Key'}
        </Button>
      </CardContent>
    </Card>
  );
};