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
  
  // Handle legacy paths that already include the user ID but need properties prefix
  // Format: "userId/properties/propertyId/image.jpg"
  if (cleanPath.includes('/properties/') && !cleanPath.startsWith('properties/')) {
    return `${supabaseUrl}/storage/v1/object/public/properties/${cleanPath}`;
  }
  
  // Standard new format: "properties/userId/propertyId/image.jpg"
  if (cleanPath.startsWith('properties/')) {
    return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
  }
  
  // Handle UUID-starting paths (legacy format)
  // Check if it looks like a UUID (8-4-4-4-12 pattern) at the start
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  if (uuidPattern.test(cleanPath)) {
    return `${supabaseUrl}/storage/v1/object/public/properties/${cleanPath}`;
  }
  
  // DEFAULT: assume it's a relative path in properties bucket
  return `${supabaseUrl}/storage/v1/object/public/properties/${cleanPath}`;
}
