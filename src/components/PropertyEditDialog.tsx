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
import LocationPicker from "./LocationPicker";
import { Textarea } from "@/components/ui/textarea";
import { getDistrictOptions, localizeDistrict, type Language } from "@/lib/districts";

interface PropertyEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
  onPropertyUpdate: (updatedProperty: any) => void;
}

export const PropertyEditDialog = ({ open, onOpenChange, property, onPropertyUpdate }: PropertyEditDialogProps) => {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    price: 0,
    property_type: "",
    is_halal_available: false,
    location: "",
    description: "",
    latitude: null as number | null,
    longitude: null as number | null,
    area: 0,
    land_area_sotka: 0,
    bedrooms: 0,
    bathrooms: 0,
    district: ""
  });
  const [photos, setPhotos] = useState<{ url: string; order_index: number }[]>([]);

  useEffect(() => {
    if (property && open) {
      setFormData({
        display_name: property.display_name || property.title || "",
        price: property.price || 0,
        property_type: property.property_type || "",
        is_halal_available: property.is_halal_available || false,
        location: property.location || "",
        description: property.description || "",
        latitude: property.latitude || null,
        longitude: property.longitude || null,
        area: property.area || 0,
        land_area_sotka: property.land_area_sotka || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        district: property.district || ""
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
        location: formData.location,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        area: formData.area,
        land_area_sotka: (formData.property_type === 'house' || formData.property_type === 'commercial') ? formData.land_area_sotka : null,
        bedrooms: !['land', 'commercial'].includes(formData.property_type) ? formData.bedrooms : null,
        bathrooms: formData.property_type !== 'land' ? formData.bathrooms : null,
        district: formData.district,
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

      // Update photo records in property_photos table
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

        // Update legacy photos field for backward compatibility
        await supabase
          .from("properties")
          .update({ 
            photos: photos.map(p => p.url),
            image_url: photos[0].url // Set primary image
          })
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">{t('property.generalInfo')}</TabsTrigger>
            <TabsTrigger value="location">{t('property.location')}</TabsTrigger>
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
                  <SelectItem value="commercial">{t('propertyType.commercial')}</SelectItem>
                  <SelectItem value="land">{t('propertyType.land')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="area">
                {formData.property_type === 'commercial' ? t('listProperty.livingArea') :
                 formData.property_type === 'land' ? t('listProperty.landArea') :
                 formData.property_type === 'house' ? t('listProperty.livingArea') :
                 'Area (m²)'}
              </Label>
              <Input
                id="area"
                type="number"
                value={formData.area || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, area: Number(e.target.value) }))}
                placeholder="75"
              />
            </div>
            
            {/* Land area for houses and commercial */}
            {(formData.property_type === 'house' || formData.property_type === 'commercial') && (
              <div>
                <Label htmlFor="landAreaSotka">{t('listProperty.landArea')}</Label>
                <Input
                  id="landAreaSotka"
                  type="number"
                  value={formData.land_area_sotka || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, land_area_sotka: Number(e.target.value) }))}
                  placeholder="5"
                  step="0.1"
                />
              </div>
            )}
            
            {/* Bedrooms - only for apartments, houses, and studios */}
            {!['land', 'commercial'].includes(formData.property_type) && (
              <div>
                <Label htmlFor="bedrooms">{t('filter.bedrooms')}</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                  placeholder="2"
                />
              </div>
            )}
            
            {/* Bathrooms - for all except land */}
            {formData.property_type !== 'land' && (
              <div>
                <Label htmlFor="bathrooms">{t('filter.bathrooms')}</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                  placeholder="1"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="description">{t('property.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('property.descriptionPlaceholder')}
                rows={3}
              />
            </div>
          </TabsContent>
          
           <TabsContent value="location" className="space-y-4">
            <div>
              <Label htmlFor="location">{t('property.address')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder={t('property.addressPlaceholder')}
              />
            </div>
            
            <div>
              <Label htmlFor="district">{t('filter.district')}</Label>
              <Select value={formData.district || 'all'} onValueChange={(value) => setFormData(prev => ({ ...prev, district: value === 'all' ? '' : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter.chooseDistrict')} />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">{t('common.any')}</SelectItem>
                  {getDistrictOptions(language as Language).map(district => (
                    <SelectItem key={district.value} value={district.value}>
                      {district.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">{localizeDistrict('Other', language as Language)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <LocationPicker
              onLocationSelect={(lat: number, lng: number, address?: string) => {
                setFormData(prev => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                  location: address || prev.location
                }));
              }}
              selectedLat={formData.latitude || undefined}
              selectedLng={formData.longitude || undefined}
              initialAddress={formData.location}
            />
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