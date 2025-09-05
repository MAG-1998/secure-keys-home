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
  
  // For relative paths - check if they already contain /properties/
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If path already contains 'properties/', just add storage base path
  if (cleanPath.includes('properties/')) {
    return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
  }
  
  // Otherwise add the full storage path with properties folder
  return `${supabaseUrl}/storage/v1/object/public/properties/${cleanPath}`;
}
