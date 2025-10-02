import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Property = {
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
  tags?: string[];
  thumbnailUrl?: string;
};

type ParsedFilters = {
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  verifiedOnly?: boolean;
  financing?: boolean;
  districts?: string[];
  propertyType?: 'apartment' | 'house' | 'studio' | 'commercial';
  lifestyle?: 'family' | 'newlyweds' | 'professional' | 'investment';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    const { q = '', cursor, pageSize = 20 } = await req.json().catch(() => ({})) as {
      q?: string; cursor?: string; pageSize?: number;
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: 'Missing Supabase credentials' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const system = `Ты — AI помощник по недвижимости Magit в Узбекистане.

КОНТЕКСТ РЫНКА:
- Основные районы Ташкента: Сергели, Юнусабад, Яккасарай, Мирабад, Алмазар, Чиланзар, Шайхантахур
- Средняя цена: $40,000-$80,000 за квартиру
- Семейные квартиры: обычно 2-3+ спальни
- Халяль финансирование: требуется минимум 50% предоплаты
- "Близко к школам" = районы Юнусабад, Мирабад
- "Тихий район" = Яккасарай, окраины
- "Бюджетный" = до $50,000
- "Премиум" = от $80,000

ПОНИМАЙ ЗАПРОСЫ:
- "для семьи" → 2+ спальни, тихий район, близко к школам
- "молодожёны" → 1-2 спальни, доступная цена
- "уютный" → средняя площадь, хорошее состояние
- "просторный" → большая площадь (70+ м²)
- "современный" → новостройка
- "с двором" → дом или первый этаж

Парсь запрос в JSON-объект:
{
  "priceMin": число,
  "priceMax": число,
  "bedroomsMin": число,
  "verifiedOnly": boolean,
  "financing": boolean,
  "districts": ["район1", "район2"],
  "propertyType": "apartment"|"house"|"studio"|"commercial",
  "lifestyle": "family"|"newlyweds"|"professional"|"investment"
}

Ответ строго в JSON без пояснений.`;

    const user = `Запрос пользователя: """${q}"""

Примеры:
- "уютная квартира для семьи" → {"bedroomsMin":2,"priceMax":70000,"lifestyle":"family"}
- "бюджетный вариант в Сергели" → {"districts":["Sergeli"],"priceMax":50000}
- "3 комнаты с финансированием" → {"bedroomsMin":3,"financing":true}`;

    const parseResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    });

    if (!parseResp.ok) {
      const errText = await parseResp.text().catch(() => '');
      console.error('AI Gateway parse error:', parseResp.status, errText);
      return new Response(JSON.stringify({ error: 'AI parse error', details: errText }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const parsedData = await parseResp.json();
    const raw = parsedData?.choices?.[0]?.message?.content?.trim() || '{}';

    let filters: ParsedFilters = {};
    try { 
      filters = JSON.parse(raw); 
      console.log('Parsed filters:', filters);
    } catch (e) { 
      console.error('Failed to parse AI response:', raw);
      filters = {}; 
    }

    const strictResults: Property[] = await realDbQuery(supabase, filters, { cursor, pageSize });

    let mode: 'strict' | 'relaxed' = 'strict';
    let candidates: Property[] = strictResults;

    if (strictResults.length === 0) {
      mode = 'relaxed';
      const relaxed = await realDbQuery(supabase, relaxFilters(filters), { cursor, pageSize: 100 });
      candidates = relaxed
        .map((p) => ({ p, score: scoreProperty(p, filters) }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 10)
        .map(({ p }) => p);
    }

    const resultsWithWhy = candidates.map((p) => ({
      ...p,
      whyGood: buildWhyGood(p, filters, mode),
    }));

    const suggestionPrompt = `Контекст поиска Magit (Узбекистан):
Запрос: "${q}"
Найдено: ${resultsWithWhy.length} объектов
Режим: ${mode === 'strict' ? 'точное совпадение' : 'расширенный поиск'}
Фильтры: ${JSON.stringify(filters)}

Дай 1-2 полезных совета, как улучшить поиск:
- Если мало результатов: предложи расширить бюджет, район, требования
- Если много: предложи уточнить критерии
- Упомяни конкретные районы Ташкента если релевантно
- Кратко и по делу, на русском языке`;

    const suggResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Ты дружелюбный помощник по недвижимости Magit. Отвечай кратко и по делу.' },
          { role: 'user', content: suggestionPrompt }
        ]
      })
    });

    let aiSuggestion = '';
    if (suggResp.ok) {
      const suggData = await suggResp.json();
      aiSuggestion = suggData?.choices?.[0]?.message?.content?.trim() || '';
    }

    return new Response(JSON.stringify({
      results: resultsWithWhy,
      aiSuggestion,
      filters,
      mode,
      nextCursor: null,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function realDbQuery(supabase: any, f: ParsedFilters, opts: { cursor?: string; pageSize: number; }): Promise<Property[]> {
  try {
    let query = supabase
      .from('properties')
      .select('id, title, price, location, district, bedrooms, bathrooms, area, property_type, is_verified, is_halal_available, halal_status, photos, latitude, longitude')
      .in('status', ['active', 'approved'])
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Apply filters
    if (f.priceMin) query = query.gte('price', f.priceMin);
    if (f.priceMax) query = query.lte('price', f.priceMax);
    if (f.bedroomsMin) query = query.gte('bedrooms', f.bedroomsMin);
    if (f.verifiedOnly) query = query.eq('is_verified', true);
    
    // Halal financing: must be both available AND approved
    if (f.financing) {
      query = query.eq('is_halal_available', true).eq('halal_status', 'approved');
    }
    
    if (f.districts?.length) {
      query = query.in('district', f.districts);
    }
    
    if (f.propertyType) {
      if (f.propertyType === 'apartment') {
        query = query.in('property_type', ['apartment', 'studio']);
      } else {
        query = query.eq('property_type', f.propertyType);
      }
    }

    query = query.limit(opts.pageSize);

    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      return [];
    }

    // Transform to Property format
    return (data || []).map((prop: any) => ({
      id: prop.id,
      title: prop.title || 'Property',
      priceUsd: Math.round(prop.price || 0),
      city: prop.location?.includes('Tashkent') ? 'Tashkent' : 'Uzbekistan',
      district: prop.district,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      sizeM2: prop.area,
      verified: prop.is_verified || false,
      financingAvailable: prop.is_halal_available && prop.halal_status === 'approved',
      thumbnailUrl: Array.isArray(prop.photos) && prop.photos.length > 0 ? prop.photos[0] : '/placeholder.svg',
      tags: [],
    }));
  } catch (error) {
    console.error('Database query failed:', error);
    return [];
  }
}

function relaxFilters(f: ParsedFilters): ParsedFilters {
  const r: ParsedFilters = { ...f };
  if (f.priceMin) r.priceMin = Math.floor(f.priceMin * 0.8);
  if (f.priceMax) r.praceMax = Math.ceil(f.priceMax * 1.2);
  if (f.bedroomsMin) r.bedroomsMin = Math.max(1, f.bedroomsMin - 1);
  r.verifiedOnly = false;
  r.financing = false;
  r.districts = undefined;
  return r;
}

function scoreProperty(p: Property, f: ParsedFilters): number {
  let score = 0;
  
  // Price scoring
  if (f.priceMax && p.priceUsd > f.priceMax) {
    score += ((p.priceUsd - f.priceMax) / f.priceMax) * 100;
  }
  if (f.priceMin && p.priceUsd < f.priceMin) {
    score += ((f.priceMin - p.priceUsd) / f.priceMin) * 20;
  }
  
  // Bedroom scoring
  if (typeof f.bedroomsMin === 'number' && typeof p.bedrooms === 'number' && p.bedrooms < f.bedroomsMin) {
    score += (f.bedroomsMin - p.bedrooms) * 10;
  }
  
  // Financing and verification penalties
  if (f.financing && !p.financingAvailable) score += 15;
  if (f.verifiedOnly && !p.verified) score += 10;
  
  // District mismatch
  if (f.districts?.length && p.district && !f.districts.includes(p.district)) score += 8;

  // Positive attributes
  if (p.verified) score -= 2;
  if (p.financingAvailable) score -= 2;
  if (typeof f.bedroomsMin === 'number' && typeof p.bedrooms === 'number' && p.bedrooms >= f.bedroomsMin) score -= 2;

  return Math.max(0, Math.round(score));
}

function buildWhyGood(p: Property, f: ParsedFilters, mode: 'strict'|'relaxed'): string {
  const pros: string[] = [];
  const cons: string[] = [];

  // Price evaluation
  if (typeof f.priceMax === 'number' && p.priceUsd > f.priceMax) {
    const perc = Math.round(((p.priceUsd - f.priceMax) / f.priceMax) * 100);
    cons.push(`чуть выше бюджета (+${perc}%)`);
  } else if (typeof f.priceMin === 'number' && p.priceUsd < f.priceMin) {
    cons.push('ниже желаемого бюджета');
  } else if (typeof f.priceMin === 'number' || typeof f.priceMax === 'number') {
    pros.push('в пределах бюджета');
  }

  // Bedrooms evaluation
  if (typeof f.bedroomsMin === 'number') {
    if ((p.bedrooms ?? 0) < f.bedroomsMin) {
      cons.push(`меньше спален (нужно ≥${f.bedroomsMin})`);
    } else {
      pros.push(`${p.bedrooms ?? 0} спален — соответствует запросу`);
    }
  }

  // Financing availability
  if (f.financing && !p.financingAvailable) {
    cons.push('без халяль‑финансирования');
  }
  if (p.financingAvailable) {
    pros.push('доступно халяль‑финансирование');
  }

  // Verification status
  if (f.verifiedOnly && !p.verified) {
    cons.push('без верификации');
  }
  if (p.verified) {
    pros.push('верифицированное объявление');
  }

  // District matching
  if (f.districts?.length) {
    if (p.district && f.districts.includes(p.district)) {
      pros.push('в желаемом районе');
    } else {
      cons.push('другой район');
    }
  } else if (p.district) {
    pros.push(`район: ${p.district}`);
  }

  if (mode === 'strict' && cons.length === 0) {
    return 'Полное совпадение с запросом.';
  }

  const consStr = cons.length ? `Компромисс: ${cons.join(', ')}` : '';
  const prosStr = pros.length ? `Плюсы: ${pros.join(', ')}` : '';
  return [consStr, prosStr].filter(Boolean).join('; ');
}
