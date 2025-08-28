import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    price: 0,
    property_type: "",
    is_halal_available: false,
    cash_min_percent: 50,
    period_options: ["6", "9", "12", "18", "24"]
  });
  const [photos, setPhotos] = useState<{ url: string; order_index: number }[]>([]);

  useEffect(() => {
    if (property && open) {
      setFormData({
        display_name: property.display_name || property.title || "",
        price: property.price || 0,
        property_type: property.property_type || "",
        is_halal_available: property.is_halal_available || false,
        cash_min_percent: property.cash_min_percent || 50,
        period_options: property.period_options || ["6", "9", "12", "18", "24"]
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
      // Update property
      const { error: propertyError } = await supabase
        .from("properties")
        .update({
          display_name: formData.display_name,
          title: formData.display_name, // Keep title in sync
          price: formData.price,
          property_type: formData.property_type,
          is_halal_available: formData.is_halal_available,
          cash_min_percent: formData.cash_min_percent,
          period_options: formData.period_options,
          image_url: photos.length > 0 ? photos[0].url : null
        })
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
        ...formData,
        title: formData.display_name,
        photos: photos.map(p => p.url),
        image_url: photos.length > 0 ? photos[0].url : null
      };

      onPropertyUpdate(updatedProperty);
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Property updated successfully"
      });
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
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
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="financing">Financing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div>
              <Label htmlFor="display_name">Property Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Enter property name"
              />
            </div>
            
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="property_type">Property Type</Label>
              <Select 
                value={formData.property_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
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
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_halal_available: checked }))}
              />
              <Label htmlFor="is_halal_available">Enable Halal Financing</Label>
            </div>
            
            {formData.is_halal_available && (
              <>
                <div>
                  <Label htmlFor="cash_min_percent">Minimum Cash Percentage (%)</Label>
                  <Input
                    id="cash_min_percent"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.cash_min_percent}
                    onChange={(e) => setFormData(prev => ({ ...prev, cash_min_percent: Number(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label>Available Periods (months)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["6", "9", "12", "18", "24"].map((period) => (
                      <div key={period} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`period_${period}`}
                          checked={formData.period_options.includes(period)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                period_options: [...prev.period_options, period]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                period_options: prev.period_options.filter(p => p !== period)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`period_${period}`}>{period} months</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};