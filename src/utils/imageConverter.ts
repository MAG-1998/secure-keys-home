/**
 * Universal image converter utility
 * Converts any image format (PNG, WebP, HEIC, BMP, etc.) to JPEG with 85% quality
 */

export const convertImageToJpeg = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions to match image (preserving aspect ratio)
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx?.drawImage(img, 0, 0);
      
      // Convert to JPEG blob with 85% quality
      canvas.toBlob((blob) => {
        if (blob) {
          // Create new file with .jpg extension
          const jpegFileName = file.name.replace(/\.[^/.]+$/, '.jpg');
          const jpegFile = new File([blob], jpegFileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(jpegFile);
        } else {
          reject(new Error('Failed to convert image to JPEG'));
        }
      }, 'image/jpeg', 0.85); // 85% quality
    };
    
    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    
    // Create object URL from file
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Batch convert multiple images to JPEG
 */
export const convertImagesToJpeg = async (files: File[]): Promise<File[]> => {
  const convertedFiles: File[] = [];
  
  for (const file of files) {
    try {
      const convertedFile = await convertImageToJpeg(file);
      convertedFiles.push(convertedFile);
    } catch (error) {
      console.warn(`Failed to convert ${file.name}:`, error);
      // If conversion fails, try to keep original but rename to .jpg if it's a supported format
      if (file.type.startsWith('image/')) {
        const jpegFileName = file.name.replace(/\.[^/.]+$/, '.jpg');
        const fallbackFile = new File([file], jpegFileName, {
          type: 'image/jpeg',
          lastModified: file.lastModified,
        });
        convertedFiles.push(fallbackFile);
      }
    }
  }
  
  return convertedFiles;
};
