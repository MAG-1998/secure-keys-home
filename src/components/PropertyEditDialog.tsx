import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { DragDropPhotoManager } from "./DragDropPhotoManager";

interface PropertyEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
  onPropertyUpdate: (updatedProperty: any) => void;
}

export const PropertyEditDialog = ({ open, onOpenChange, property, onPropertyUpdate }: PropertyEditDialogProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    price: 0,
    property_type: "",
    is_halal_available: false
  });
  const [photos, setPhotos] = useState<{ url: string; order_index: number }[]>([]);

  useEffect(() => {
    if (property && open) {
      setFormData({
        display_name: property.display_name || property.title || "",
        price: property.price || 0,
        property_type: property.property_type || "",
        is_halal_available: property.is_halal_available || false
      });
      
      // Load photos from property_photos table if exists, otherwise from photos field
      loadPhotos();
    }
  }, [property, open]);

  const loadPhotos = async () => {
    if (!property?.id) return;
    
    try {
      // First try to load from property_photos table
      const { data: photoData, error: photoError } = await supabase
        .from("property_photos")
        .select("url, order_index")
        .eq("property_id", property.id)
        .order("order_index");

      if (!photoError && photoData && photoData.length > 0) {
        setPhotos(photoData);
      } else {
        // Fallback to legacy photos field
        const legacyPhotos = property.photos || [];
        if (Array.isArray(legacyPhotos)) {
          setPhotos(legacyPhotos.map((url: string, index: number) => ({
            url,
            order_index: index
          })));
        }
      }
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Handle halal financing toggle logic
      let updateData: any = {
        display_name: formData.display_name,
        title: formData.display_name, // Keep title in sync
        price: formData.price,
        property_type: formData.property_type,
        image_url: photos.length > 0 ? photos[0].url : null
      };

      // Halal financing logic
      if (formData.is_halal_available !== property.is_halal_available) {
        if (formData.is_halal_available) {
          // Turning ON halal financing
          if (property.halal_status === 'approved') {
            // Previously approved - can enable immediately
            updateData.is_halal_available = true;
          } else {
            // First time or was denied/disabled - need new approval
            updateData.halal_status = 'pending_approval';
            updateData.is_halal_available = false; // Keep false until approved
          }
        } else {
          // Turning OFF halal financing (keep status for history)
          updateData.is_halal_available = false;
        }
      }

      // Update property
      const { error: propertyError } = await supabase
        .from("properties")
        .update(updateData)
        .eq("id", property.id);

      if (propertyError) throw propertyError;

      // Update or create photo records
      if (photos.length > 0) {
        // Delete existing photos
        await supabase
          .from("property_photos")
          .delete()
          .eq("property_id", property.id);

        // Insert new photos with order
        const { error: photosError } = await supabase
          .from("property_photos")
          .insert(
            photos.map((photo, index) => ({
              property_id: property.id,
              url: photo.url,
              order_index: index
            }))
          );

        if (photosError) throw photosError;

        // Also update legacy photos field for backward compatibility
        await supabase
          .from("properties")
          .update({ photos: photos.map(p => p.url) })
          .eq("id", property.id);
      }

      const updatedProperty = {
        ...property,
        ...updateData,
        title: formData.display_name,
        photos: photos.map(p => p.url),
        image_url: photos.length > 0 ? photos[0].url : null
      };

      onPropertyUpdate(updatedProperty);
      onOpenChange(false);
      
      toast({
        title: t('common.success'),
        description: t('common.updated')
      });
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast({
        title: t('common.error'),
        description: error.message || t('common.updateFailed'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const onPhotosChange = (newPhotos: { url: string; order_index: number }[]) => {
    setPhotos(newPhotos);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('property.edit')}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">{t('property.generalInfo')}</TabsTrigger>
            <TabsTrigger value="photos">{t('property.photos')}</TabsTrigger>
            <TabsTrigger value="financing">{t('property.financing')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div>
              <Label htmlFor="display_name">{t('property.displayName')}</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder={t('property.displayNamePlaceholder')}
              />
            </div>
            
            <div>
              <Label htmlFor="price">{t('property.price')}</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="property_type">{t('filter.propertyType')}</Label>
              <Select 
                value={formData.property_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filter.chooseType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">{t('propertyType.apartment')}</SelectItem>
                  <SelectItem value="house">{t('propertyType.house')}</SelectItem>
                  <SelectItem value="studio">{t('propertyType.studio')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="photos">
            <DragDropPhotoManager
              photos={photos}
              onPhotosChange={onPhotosChange}
              propertyId={property?.id}
              userId={property?.user_id}
            />
          </TabsContent>
          
          <TabsContent value="financing" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_halal_available"
                checked={formData.is_halal_available}
                disabled={property.halal_status === 'denied' || property.halal_status === 'disabled'}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_halal_available: checked }))}
              />
              <Label htmlFor="is_halal_available">{t('edit.enableHalalFinancing')}</Label>
            </div>
            
            {/* Status Display */}
            {property.halal_status === 'pending_approval' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700 font-medium">
                  Pending Admin Approval
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Your halal financing request is being reviewed by administrators.
                </p>
              </div>
            )}
            
            {property.halal_status === 'approved' && property.is_halal_available && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  Halal Financing Active
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Your property is listed with halal financing option.
                </p>
              </div>
            )}
            
            {property.halal_status === 'approved' && !property.is_halal_available && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">
                  Halal Financing Approved
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  You can enable halal financing for this property anytime.
                </p>
              </div>
            )}
            
            {property.halal_status === 'denied' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">
                  Halal Financing Denied
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Your halal financing request was not approved. Contact support for more information.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('common.saving') : t('property.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};