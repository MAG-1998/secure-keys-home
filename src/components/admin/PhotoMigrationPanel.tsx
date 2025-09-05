import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MigrationResult {
  propertyId: string;
  propertyTitle: string;
  status: 'completed' | 'preview' | 'no_migration_needed' | 'error';
  migratedCount?: number;
  totalPhotos?: number;
  photosNeedingMigration?: number;
  details?: Array<{ url: string; fileName: string; extension: string; needsContentCheck?: boolean }>;
  error?: string;
}

interface BackupInfo {
  backupId: string;
  propertiesBackedUp: number;
  timestamp: string;
}

export const PhotoMigrationPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [forceConvertMode, setForceConvertMode] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);

  const createBackup = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('backup_photo_urls');
      if (error) throw error;
      
      if (data && data.length > 0) {
        const backup = data[0];
        const backupData: BackupInfo = {
          backupId: backup.backup_id,
          propertiesBackedUp: backup.properties_backed_up,
          timestamp: new Date().toISOString()
        };
        setBackupInfo(backupData);
        toast.success(`Backup created: ${backup.properties_backed_up} properties backed up`);
        return backup.backup_id;
      }
      return null;
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Failed to create backup: ' + (error as Error).message);
      return null;
    }
  };

  const restoreBackup = async () => {
    if (!backupInfo) {
      toast.error('No backup available to restore');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('restore_photo_urls', {
        backup_uuid: backupInfo.backupId
      });
      
      if (error) throw error;
      
      toast.success(`Restored ${data} properties from backup`);
      setResults([]);
      setBackupInfo(null);
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore backup: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const standardizeUrls = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('standardize-photo-urls');
      if (error) throw error;
      
      toast.success(`Standardized URLs: ${data.message}`);
    } catch (error) {
      console.error('URL standardization error:', error);
      toast.error('Failed to standardize URLs: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const runMigration = async (preview = false) => {
    setIsLoading(true);
    
    // Create backup before migration if not in preview mode
    if (!preview) {
      const backupId = await createBackup();
      if (!backupId) {
        setIsLoading(false);
        return;
      }
    }

    try {
      const { data, error } = await supabase.functions.invoke('migrate-photos-to-jpeg', {
        body: { 
          preview, 
          forceConvert: forceConvertMode,
          selectedProperties: selectedProperties.size > 0 ? Array.from(selectedProperties) : undefined
        }
      });

      if (error) throw error;

      setResults(data.results || []);
      setShowPreview(preview);
      
      if (preview) {
        const needsMigration = data.results.filter((r: MigrationResult) => r.photosNeedingMigration && r.photosNeedingMigration > 0);
        toast.success(`Preview completed: ${needsMigration.length} properties need photo migration`);
      } else {
        const migrated = data.results.filter((r: MigrationResult) => r.status === 'completed' && r.migratedCount && r.migratedCount > 0);
        const totalMigrated = migrated.reduce((sum, r) => sum + (r.migratedCount || 0), 0);
        toast.success(`Migration completed: ${totalMigrated} photos converted`);
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
    
    // Create backup before migration if not in preview mode
    if (!preview) {
      const backupId = await createBackup();
      if (!backupId) {
        setIsLoading(false);
        return;
      }
    }

    try {
      const { data, error } = await supabase.functions.invoke('migrate-photos-to-jpeg', {
        body: { 
          propertyId, 
          preview, 
          forceConvert: forceConvertMode
        }
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

  const togglePropertySelection = (propertyId: string) => {
    const newSelection = new Set(selectedProperties);
    if (newSelection.has(propertyId)) {
      newSelection.delete(propertyId);
    } else {
      newSelection.add(propertyId);
    }
    setSelectedProperties(newSelection);
  };

  const selectAllProperties = () => {
    if (selectedProperties.size === results.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(results.map(r => r.propertyId)));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo Format Migration</CardTitle>
        <CardDescription>
          Convert property photos to JPEG format and fix URL inconsistencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Backup/Restore Section */}
        {backupInfo && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Backup Available</p>
                <p className="text-xs text-muted-foreground">
                  {backupInfo.propertiesBackedUp} properties backed up at {new Date(backupInfo.timestamp).toLocaleString()}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={restoreBackup}
                disabled={isLoading}
              >
                Restore Backup
              </Button>
            </div>
          </div>
        )}

        {/* URL Standardization */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={standardizeUrls}
            disabled={isLoading}
            variant="secondary"
            size="sm"
          >
            {isLoading ? 'Standardizing...' : 'Fix URL Inconsistencies'}
          </Button>
          <span className="text-xs text-muted-foreground">
            Standardizes all photo URLs to relative format
          </span>
        </div>

        <Separator />

        {/* Migration Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="force-convert" 
              checked={forceConvertMode}
              onCheckedChange={(checked) => setForceConvertMode(checked as boolean)}
            />
            <Label htmlFor="force-convert" className="text-sm">
              Force Convert Mode
            </Label>
            <span className="text-xs text-muted-foreground">
              (Checks all images by content, not just extension)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
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
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                {showPreview ? 'Migration Preview Results' : 'Migration Results'}
              </h4>
              {showPreview && results.some(r => r.photosNeedingMigration && r.photosNeedingMigration > 0) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectAllProperties}
                >
                  {selectedProperties.size === results.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {/* Batch Actions */}
            {showPreview && selectedProperties.size > 0 && (
              <div className="p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {selectedProperties.size} properties selected
                  </span>
                  <Button
                    size="sm"
                    onClick={() => runMigration(false)}
                    disabled={isLoading}
                  >
                    Migrate Selected
                  </Button>
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result) => (
                <div key={result.propertyId} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3 flex-1">
                    {showPreview && result.photosNeedingMigration && result.photosNeedingMigration > 0 && (
                      <Checkbox
                        checked={selectedProperties.has(result.propertyId)}
                        onCheckedChange={() => togglePropertySelection(result.propertyId)}
                      />
                    )}
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
                      {result.status === 'error' && (
                        <p className="text-sm text-red-600">
                          Error: {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        result.status === 'completed' ? 'default' : 
                        result.status === 'error' ? 'destructive' :
                        result.status === 'preview' && result.photosNeedingMigration ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {result.status === 'no_migration_needed' ? 'No migration needed' :
                       result.status === 'error' ? 'Error' :
                       result.status === 'preview' ? `${result.photosNeedingMigration} need migration` :
                       `${result.migratedCount} migrated`}
                    </Badge>
                    {showPreview && result.photosNeedingMigration && result.photosNeedingMigration > 0 && !selectedProperties.has(result.propertyId) && (
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