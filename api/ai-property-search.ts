import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Sanitized property type (no personal data)
type SanitizedProperty = {
  id: string;
  title: string;
  priceUsd: number;
  city: string;
  district?: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeM2?: number;
  verified: boolean;
  financingAvailable: boolean;
  propertyType?: string;
  status?: string;
};

type SearchFilters = {
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  areaMin?: number;
  verifiedOnly?: boolean;
  financing?: boolean;
  districts?: string[];
  propertyType?: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { filters = {}, cursor, pageSize = 20 } = (req.body ?? {}) as {
      filters?: SearchFilters;
      cursor?: string;
      pageSize?: number;
    };

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Missing Supabase credentials' });
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const results = await queryProperties(supabase, filters, { cursor, pageSize });

    res.status(200).json({
      results,
      filters,
      nextCursor: null,
    });

  } catch (e: any) {
    console.error('Property search error:', e);
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}

// Privacy-first property sanitization - removes all personal data
function sanitizeProperty(property: any): SanitizedProperty {
  return {
    id: property.id,
    title: property.title || 'Property',
    priceUsd: Math.round(property.price || 0),
    city: property.location?.includes('Tashkent') ? 'Tashkent' : 'Uzbekistan',
    district: property.district,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sizeM2: property.area,
    verified: property.is_verified || false,
    financingAvailable: property.is_halal_financed || false,
    propertyType: property.property_type,
    status: property.status,
  };
}

// Query properties with privacy protection
async function queryProperties(
  supabase: any, 
  filters: SearchFilters, 
  opts: { cursor?: string; pageSize: number; }
): Promise<SanitizedProperty[]> {
  try {
    let query = supabase
      .from('properties')
      .select(`
        id, title, price, location, district, bedrooms, bathrooms, area,
        property_type, is_verified, is_halal_financed, status
      `)
      .in('status', ['active', 'approved']);

    // Apply filters
    if (filters.priceMin) query = query.gte('price', filters.priceMin);
    if (filters.priceMax) query = query.lte('price', filters.priceMax);
    if (filters.bedroomsMin) query = query.gte('bedrooms', filters.bedroomsMin);
    if (filters.bathroomsMin) query = query.gte('bathrooms', filters.bathroomsMin);
    if (filters.areaMin) query = query.gte('area', filters.areaMin);
    if (filters.verifiedOnly) query = query.eq('is_verified', true);
    if (filters.financing) query = query.eq('is_halal_financed', true);
    if (filters.districts?.length) query = query.in('district', filters.districts);
    
    // Special handling for property types - apartment includes studio
    if (filters.propertyType) {
      if (filters.propertyType === 'apartment') {
        query = query.in('property_type', ['apartment', 'studio']);
      } else {
        query = query.eq('property_type', filters.propertyType);
      }
    }

    query = query.limit(opts.pageSize);

    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      return [];
    }

    // Sanitize all properties before returning
    return (data || []).map(sanitizeProperty);
  } catch (error) {
    console.error('Database query failed:', error);
    return [];
  }
}