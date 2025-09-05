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
  
  // Convert relative storage path to full Supabase URL
  const supabaseUrl = 'https://mvndmnkgtoygsvesktgw.supabase.co';
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
}
