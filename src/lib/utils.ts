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
  
  // For relative paths - handle different formats
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // OLD FORMAT: "9a9fc7db-abc-def/properties/image.jpg" -> needs full URL prefix
  if (cleanPath.includes('/') && !cleanPath.startsWith('properties/')) {
    return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
  }
  
  // NEW FORMAT: "properties/xyz/image.jpg" -> just add storage base path
  if (cleanPath.startsWith('properties/')) {
    return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
  }
  
  // DEFAULT: add full path with properties folder
  return `${supabaseUrl}/storage/v1/object/public/properties/${cleanPath}`;
}
