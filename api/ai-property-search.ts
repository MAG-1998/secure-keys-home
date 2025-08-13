// api/ai-property-search.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Sanitized property type for OpenAI (no personal data)
type SanitizedProperty = {
  id: string;
  title: string;
  priceUsd: number;
  city: string;
  district?: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  sizeM2?: number;
  distanceToTashkentKm?: number;
  verified: boolean;
  financingAvailable: boolean;
  propertyType?: string;
  isHalalFinanced?: boolean;
  status?: string;
};

type ParsedFilters = {
  priceMin?: number;
  priceMax?: number;
  familySize?: number;
  nearTashkent?: boolean;
  maxDistanceKm?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  areaMin?: number;
  verifiedOnly?: boolean;
  financing?: boolean;
  halalFinancing?: boolean;
  districts?: string[];
  propertyType?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { q = '', cursor, pageSize = 20 } = (req.body ?? {}) as {
      q?: string; cursor?: string; pageSize?: number;
    };

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Missing Supabase credentials' });
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const system = `Ты — помощник по недвижимости в Узбекистане.
Парсь запрос пользователя в JSON-объект со строго следующими полями:
priceMin, priceMax, familySize, nearTashkent, maxDistanceKm, bedroomsMin, bathroomsMin, areaMin, verifiedOnly, financing, halalFinancing, districts[], propertyType.
Поддерживаемые районы: Bektemir, Chilonzor, Mirobod, Mirzo-Ulugbek, Sergeli, Shaykhantahur, Uchtepa, Yakkasaray, Yunusobod, Yashnobod, Olmazor, Yangihayot.
Типы недвижимости: apartment, house, studio, commercial.
Если не уверен — оставляй поле пустым. Ответ строго в JSON без пояснений.`;

    const user = `Запрос: """${q}"""
Пример: {"priceMin":30000,"priceMax":70000,"familySize":3,"nearTashkent":true,"maxDistanceKm":50,"bedroomsMin":2,"bathroomsMin":1,"areaMin":50,"verifiedOnly":true,"financing":true,"halalFinancing":true,"districts":["Sergeli","Yunusobod"],"propertyType":"apartment"}`;

    const parseResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    });

    if (!parseResp.ok) {
      const errText = await safeText(parseResp as unknown as Response);
      return res.status(502).json({ error: 'OpenAI parse error', details: errText });
    }

    const parsedData = await parseResp.json();
    const raw = parsedData?.choices?.[0]?.message?.content?.trim() || '{}';

    let filters: ParsedFilters = {};
    try { filters = JSON.parse(raw); } catch { filters = {}; }

    const strictResults: SanitizedProperty[] = await queryRealProperties(supabase, filters, { cursor, pageSize });

    // If no strict matches, relax filters and pick best-fit candidates with explanations
    let mode: 'strict' | 'relaxed' = 'strict'
    let candidates: SanitizedProperty[] = strictResults

    if (strictResults.length === 0) {
      mode = 'relaxed'
      const relaxed = await queryRealProperties(supabase, relaxFilters(filters), { cursor, pageSize: 100 })
      // Rank by closeness to original filters
      candidates = relaxed
        .map((p) => ({ p, score: scoreProperty(p, filters) }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 5)
        .map(({ p }) => p)
    }

    // Build per-item explanations
    const resultsWithWhy = candidates.map((p) => ({
      ...p,
      whyGood: buildWhyGood(p, filters, mode),
    }))

    const suggestionPrompt = `Пользовательский запрос: "${q}"
Найдено объектов: ${resultsWithWhy.length}
Режим: ${mode}
Фильтры: ${JSON.stringify(filters)}
Дай 1–2 коротких совета: как улучшить поиск (например, расширить бюджет, район, кол-во комнат). Русский язык.`

    const suggResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          { role: 'system', content: 'Кратко, дружелюбно, по делу.' },
          { role: 'user', content: suggestionPrompt }
        ]
      })
    })

    let aiSuggestion = ''
    if (suggResp.ok) {
      const suggData = await suggResp.json()
      aiSuggestion = suggData?.choices?.[0]?.message?.content?.trim() || ''
    }

    res.status(200).json({
      results: resultsWithWhy,
      aiSuggestion,
      filters,
      mode,
      nextCursor: null,
    })

  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}

// ---- helpers ----

// Privacy-first property sanitization - removes all personal data before sending to OpenAI
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
    distanceToTashkentKm: 0, // Assume all in Tashkent for now
    verified: property.is_verified || false,
    financingAvailable: property.is_halal_financed || false,
    propertyType: property.property_type,
    isHalalFinanced: property.is_halal_financed || false,
    status: property.status,
  };
}

// Query real Supabase properties with privacy protection
async function queryRealProperties(supabase: any, f: ParsedFilters, opts: { cursor?: string; pageSize: number; }): Promise<SanitizedProperty[]> {
  try {
    let query = supabase
      .from('properties')
      .select(`
        id, title, price, location, district, bedrooms, bathrooms, area,
        property_type, is_verified, is_halal_financed, status
      `)
      .in('status', ['active', 'approved']);

    // Apply filters
    if (f.priceMin) query = query.gte('price', f.priceMin);
    if (f.priceMax) query = query.lte('price', f.priceMax);
    if (f.bedroomsMin) query = query.gte('bedrooms', f.bedroomsMin);
    if (f.bathroomsMin) query = query.gte('bathrooms', f.bathroomsMin);
    if (f.areaMin) query = query.gte('area', f.areaMin);
    if (f.verifiedOnly) query = query.eq('is_verified', true);
    if (f.financing || f.halalFinancing) query = query.eq('is_halal_financed', true);
    if (f.districts?.length) query = query.in('district', f.districts);
    if (f.propertyType) query = query.eq('property_type', f.propertyType);

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

async function safeText(r: Response) {
  try { return await r.text(); } catch { return ''; }
}

function relaxFilters(f: ParsedFilters): ParsedFilters {
  const r: ParsedFilters = { ...f }
  if (f.priceMin) r.priceMin = Math.floor(f.priceMin * 0.85)
  if (f.priceMax) r.priceMax = Math.ceil(f.priceMax * 1.15)
  if (f.bedroomsMin) r.bedroomsMin = Math.max(0, f.bedroomsMin - 1)
  if (f.bathroomsMin) r.bathroomsMin = Math.max(0, f.bathroomsMin - 1)
  if (f.areaMin) r.areaMin = Math.floor(f.areaMin * 0.8)
  if (f.nearTashkent) {
    r.nearTashkent = true
    r.maxDistanceKm = Math.ceil(((f.maxDistanceKm ?? 30) as number) * 1.5)
  }
  r.verifiedOnly = false
  r.financing = false
  r.halalFinancing = false
  // расширим районы, если пользователь указывал
  r.districts = undefined
  r.propertyType = undefined
  return r
}

function scoreProperty(p: SanitizedProperty, f: ParsedFilters): number {
  let score = 0
  
  // Price penalties
  if (f.priceMax && p.priceUsd > f.priceMax) {
    score += ((p.priceUsd - f.priceMax) / f.priceMax) * 100
  }
  if (f.priceMin && p.priceUsd < f.priceMin) {
    score += ((f.priceMin - p.priceUsd) / f.priceMin) * 20
  }
  
  // Distance penalties (if applicable)
  if (f.nearTashkent) {
    const limit = f.maxDistanceKm ?? 30
    const d = (p.distanceToTashkentKm ?? 0) - limit
    if (d > 0) score += d
  }
  
  // Room/area penalties
  if (typeof f.bedroomsMin === 'number' && typeof p.bedrooms === 'number' && p.bedrooms < f.bedroomsMin) {
    score += (f.bedroomsMin - p.bedrooms) * 10
  }
  if (typeof f.bathroomsMin === 'number' && typeof p.bathrooms === 'number' && p.bathrooms < f.bathroomsMin) {
    score += (f.bathroomsMin - p.bathrooms) * 8
  }
  if (typeof f.areaMin === 'number' && typeof p.sizeM2 === 'number' && p.sizeM2 < f.areaMin) {
    score += ((f.areaMin - p.sizeM2) / f.areaMin) * 15
  }
  
  // Feature penalties
  if ((f.financing || f.halalFinancing) && !p.financingAvailable) score += 15
  if (f.verifiedOnly && !p.verified) score += 10
  if (f.districts?.length && p.district && !f.districts.includes(p.district)) score += 8
  if (f.propertyType && p.propertyType !== f.propertyType) score += 12

  // Bonuses for good features
  if (p.verified) score -= 2
  if (p.financingAvailable) score -= 2
  if (p.isHalalFinanced) score -= 3
  if (typeof f.bedroomsMin === 'number' && typeof p.bedrooms === 'number' && p.bedrooms >= f.bedroomsMin) score -= 2

  return Math.max(0, Math.round(score))
}

function buildWhyGood(p: SanitizedProperty, f: ParsedFilters, mode: 'strict'|'relaxed'): string {
  const pros: string[] = []
  const cons: string[] = []

  // Price analysis
  if (typeof f.priceMax === 'number' && p.priceUsd > f.priceMax) {
    const perc = Math.round(((p.priceUsd - f.priceMax) / f.priceMax) * 100)
    cons.push(`чуть выше бюджета (+${perc}%)`)
  } else if (typeof f.priceMin === 'number' && p.priceUsd < f.priceMin) {
    cons.push('ниже желаемого бюджета')
  } else if (typeof f.priceMin === 'number' || typeof f.priceMax === 'number') {
    pros.push('в пределах бюджета')
  }

  // Location analysis
  if (f.nearTashkent) {
    const limit = f.maxDistanceKm ?? 30
    const d = (p.distanceToTashkentKm ?? 0) - limit
    if (d > 0) cons.push(`дальше лимита от Ташкента на ${Math.round(d)} км`)
    else pros.push('близко к Ташкенту')
  }

  // Room analysis
  if (typeof f.bedroomsMin === 'number') {
    if ((p.bedrooms ?? 0) < f.bedroomsMin) cons.push(`меньше спален (нужно ≥${f.bedroomsMin})`)
    else pros.push(`${p.bedrooms ?? 0} спален — соответствует запросу`)
  }
  
  if (typeof f.bathroomsMin === 'number') {
    if ((p.bathrooms ?? 0) < f.bathroomsMin) cons.push(`меньше ванных (нужно ≥${f.bathroomsMin})`)
    else pros.push(`${p.bathrooms ?? 0} ванных — подходит`)
  }

  // Area analysis
  if (typeof f.areaMin === 'number') {
    if ((p.sizeM2 ?? 0) < f.areaMin) cons.push(`меньше площади (нужно ≥${f.areaMin}м²)`)
    else pros.push(`${p.sizeM2 ?? 0}м² — достаточная площадь`)
  }

  // Financing analysis
  if ((f.financing || f.halalFinancing) && !p.financingAvailable) cons.push('без халяль‑финансирования')
  if (p.financingAvailable || p.isHalalFinanced) pros.push('доступно халяль‑финансирование')

  // Verification analysis
  if (f.verifiedOnly && !p.verified) cons.push('без верификации')
  if (p.verified) pros.push('верифицированное объявление')

  // District analysis
  if (f.districts?.length) {
    if (p.district && f.districts.includes(p.district)) pros.push('в желаемом районе')
    else cons.push('другой район')
  } else if (p.district) {
    pros.push(`район: ${p.district}`)
  }

  // Property type analysis
  if (f.propertyType && p.propertyType !== f.propertyType) {
    cons.push(`другой тип недвижимости (${p.propertyType || 'не указан'})`)
  } else if (p.propertyType) {
    pros.push(`тип: ${p.propertyType}`)
  }

  if (mode === 'strict' && cons.length === 0) return 'Полное совпадение с запросом.'

  const consStr = cons.length ? `Компромисс: ${cons.join(', ')}` : ''
  const prosStr = pros.length ? `Плюсы: ${pros.join(', ')}` : ''
  return [consStr, prosStr].filter(Boolean).join('; ')
}
