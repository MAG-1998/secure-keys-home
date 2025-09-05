import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MigrationResult {
  propertyId: string;
  propertyTitle: string;
  status: 'completed' | 'preview' | 'no_migration_needed';
  migratedCount?: number;
  totalPhotos?: number;
  photosNeedingMigration?: number;
  details?: Array<{ url: string; fileName: string; extension: string }>;
}

export const PhotoMigrationPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const runMigration = async (preview = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('migrate-photos-to-jpeg', {
        body: { preview }
      });

      if (error) throw error;

      setResults(data.results || []);
      setShowPreview(preview);
      
      if (preview) {
        const needsMigration = data.results.filter((r: MigrationResult) => r.photosNeedingMigration && r.photosNeedingMigration > 0);
        toast.success(`Preview completed: ${needsMigration.length} properties need photo migration`);
      } else {
        const migrated = data.results.filter((r: MigrationResult) => r.status === 'completed' && r.migratedCount && r.migratedCount > 0);
        toast.success(`Migration completed: ${migrated.reduce((sum, r) => sum + (r.migratedCount || 0), 0)} photos converted`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const runSpecificProperty = async (propertyId: string, preview = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('migrate-photos-to-jpeg', {
        body: { propertyId, preview }
      });

      if (error) throw error;

      toast.success(preview ? 'Preview completed for property' : 'Migration completed for property');
      // Refresh results
      await runMigration(true);
    } catch (error) {
      console.error('Property migration error:', error);
      toast.error('Property migration failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo Format Migration</CardTitle>
        <CardDescription>
          Convert all property photos to JPEG format for better browser compatibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={() => runMigration(true)} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Loading...' : 'Preview Migration'}
          </Button>
          <Button 
            onClick={() => runMigration(false)} 
            disabled={isLoading}
            variant="default"
          >
            {isLoading ? 'Migrating...' : 'Run Migration'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">
              {showPreview ? 'Migration Preview Results' : 'Migration Results'}
            </h4>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result) => (
                <div key={result.propertyId} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{result.propertyTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.propertyId}
                    </p>
                    {result.status === 'preview' && result.photosNeedingMigration && (
                      <p className="text-sm text-orange-600">
                        {result.photosNeedingMigration} photos need migration
                      </p>
                    )}
                    {result.status === 'completed' && result.migratedCount && (
                      <p className="text-sm text-green-600">
                        {result.migratedCount} photos converted
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        result.status === 'completed' ? 'default' : 
                        result.status === 'preview' && result.photosNeedingMigration ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {result.status === 'no_migration_needed' ? 'No migration needed' :
                       result.status === 'preview' ? `${result.photosNeedingMigration} need migration` :
                       `${result.migratedCount} migrated`}
                    </Badge>
                    {showPreview && result.photosNeedingMigration && result.photosNeedingMigration > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => runSpecificProperty(result.propertyId, false)}
                        disabled={isLoading}
                      >
                        Migrate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};