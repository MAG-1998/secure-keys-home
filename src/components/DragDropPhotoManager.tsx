import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, GripVertical } from "lucide-react";
import { convertImageToJpeg } from "@/utils/imageConverter";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PhotoItem {
  url: string;
  order_index: number;
}

interface DragDropPhotoManagerProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  propertyId: string;
  userId: string;
}

const SortablePhotoItem = ({ photo, onRemove, index, t }: { 
  photo: PhotoItem; 
  onRemove: () => void; 
  index: number;
  t: (key: string) => string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border rounded-lg overflow-hidden bg-card"
    >
      <div className="relative">
        <img
          src={photo.url}
          alt={`Property photo ${index + 1}`}
          className="w-full h-32 object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg'
          }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Button
              {...attributes}
              {...listeners}
              variant="secondary"
              size="sm"
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {index === 0 && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            {t('photo.primary')}
          </div>
        )}
      </div>
    </div>
  );
};

export const DragDropPhotoManager = ({ photos, onPhotosChange, propertyId, userId }: DragDropPhotoManagerProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = photos.findIndex((photo) => photo.url === active.id);
      const newIndex = photos.findIndex((photo) => photo.url === over?.id);

      const reorderedPhotos = arrayMove(photos, oldIndex, newIndex).map((photo, index) => ({
        ...photo,
        order_index: index
      }));

      onPhotosChange(reorderedPhotos);
    }
  };


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > 20) {
      toast({
        title: t('photo.tooMany'),
        description: t('photo.maxAllowed'),
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const uploadedPhotos: PhotoItem[] = [];

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        
        // Convert ALL images to JPEG with 85% quality
        try {
          file = await convertImageToJpeg(file);
        } catch (conversionError) {
          console.warn('Failed to convert image file, uploading as is:', conversionError);
        }
        
        // Ensure .jpg extension for all uploaded files
        const fileName = `${Date.now()}_${i}.jpg`;
        const filePath = `${userId}/properties/${propertyId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        // Format the URL properly (ensure it starts with full URL)
        const formattedUrl = publicUrl.startsWith('http') 
          ? publicUrl 
          : `https://mvndmnkgtoygsvesktgw.supabase.co/storage/v1/object/public/properties/${filePath}`;

        // Save to property_photos table
        const { error: dbError } = await supabase
          .from('property_photos')
          .insert({
            property_id: propertyId,
            url: formattedUrl,
            order_index: photos.length + i
          });

        if (dbError) throw dbError;

        uploadedPhotos.push({
          url: formattedUrl,
          order_index: photos.length + i
        });
      }

      onPhotosChange([...photos, ...uploadedPhotos]);
      
      toast({
        title: t('photo.uploaded'),
        description: `${uploadedPhotos.length} ${t('photo.uploadedSuccess')}`
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: t('photo.uploadFailed'),
        description: error.message || t('photo.failedToUpload'),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = async (index: number) => {
    if (photos.length <= 1) {
      toast({
        title: t('photo.cannotRemove'),
        description: t('photo.oneRequired'),
        variant: "destructive"
      });
      return;
    }

    const photoToRemove = photos[index];
    
    try {
      // Extract file path from URL to delete from storage
      const url = photoToRemove.url;
      if (url.includes('/storage/v1/object/public/properties/')) {
        const filePath = url.split('/storage/v1/object/public/properties/')[1];
        if (filePath) {
          const { error: deleteError } = await supabase.storage
            .from('properties')
            .remove([filePath]);
          
          if (deleteError) {
            console.warn('Failed to delete file from storage:', deleteError);
          }
        }
      }

      // Remove from property_photos table
      await supabase
        .from('property_photos')
        .delete()
        .eq('property_id', propertyId)
        .eq('url', photoToRemove.url);

      const newPhotos = photos.filter((_, i) => i !== index).map((photo, i) => ({
        ...photo,
        order_index: i
      }));
      
      onPhotosChange(newPhotos);
      
      toast({
        title: t('photo.removed'),
        description: t('photo.removedSuccess')
      });
    } catch (error: any) {
      console.error('Error removing photo:', error);
      toast({
        title: t('photo.removeFailed'),
        description: error.message || 'Failed to remove photo',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('photo.propertyPhotos')}</h3>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= 20}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? t('photo.uploading') : t('photo.addPhotos')}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {photos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('photo.dragToReorder')} • {photos.length}/20 photos
          </p>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={photos.map(p => p.url)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <SortablePhotoItem
                    key={photo.url}
                    photo={photo}
                    index={index}
                    t={t}
                    onRemove={() => removePhoto(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {photos.length === 0 && (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('photo.noPhotos')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('photo.clickToUpload')}</p>
        </div>
      )}
    </div>
  );
};