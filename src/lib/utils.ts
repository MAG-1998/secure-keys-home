import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.svg';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const supabaseUrl = 'https://mvndmnkgtoygsvesktgw.supabase.co';
  
  // If already has storage path, just prepend base URL
  if (path.startsWith('/storage/v1/object/public/')) {
    return `${supabaseUrl}${path}`;
  }
  
  if (path.startsWith('storage/v1/object/public/')) {
    return `${supabaseUrl}/${path}`;
  }
  
  // For relative paths, add the full storage path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${supabaseUrl}/storage/v1/object/public/properties/${cleanPath}`;
}
