import { Button } from "@/components/ui/button";
import { GripVertical, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortablePhotoItemProps {
  id: string;
  file: File;
  index: number;
  onRemove: () => void;
}

export const SortablePhotoItem = ({ id, file, index, onRemove }: SortablePhotoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
          src={URL.createObjectURL(file)}
          alt={`Property photo ${index + 1}`}
          className="w-full h-32 object-cover"
          loading="lazy"
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
            Primary
          </div>
        )}
      </div>
    </div>
  );
};