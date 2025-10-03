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
  description?: string;
};

type ParsedFilters = {
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  areaMin?: number;
  areaMax?: number;
  verifiedOnly?: boolean;
  financing?: boolean;
  districts?: string[];
  propertyType?: 'apartment' | 'house' | 'studio' | 'commercial';
  lifestyle?: string;
  descriptionKeywords?: string[];
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

    console.log('=== AI Property Search ===');
    console.log('Query:', q);
    console.log('Page size:', pageSize);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('Missing LOVABLE_API_KEY');
      return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Missing Supabase credentials' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const system = `Ты — AI помощник по недвижимости Magit в Узбекистане.

КОНТЕКСТ РЫНКА:
- Основные районы Ташкента: Сергели, Юнусабад, Яккасарай, Мирабад, Алмазар, Чиланзар, Шайхантахур
- Средняя цена: $40,000-$80,000 за квартиру
- Семейные квартиры: обычно 2-3+ спальни, 60+ м²
- Халяль финансирование: требуется минимум 50% предоплаты
- "Близко к школам" = районы Юнусабад, Мирабад
- "Тихий район" = Яккасарай, окраины
- "Бюджетный" = до $50,000
- "Премиум" = от $80,000

ПОНИМАЙ ЗАПРОСЫ И ИЗВЛЕКАЙ КЛЮЧЕВЫЕ СЛОВА:
- "для семьи/дети" → bedroomsMin: 2, areaMin: 60, districts: ["Yunusabad", "Chilanzar"], descriptionKeywords: ["семья", "дети", "школа", "детский", "тихий"]
- "молодожёны/пара" → bedroomsMin: 1, priceMax: 50000, areaMax: 50, descriptionKeywords: ["молодожёны", "пара", "уютный", "компактный"]
- "уютный" → descriptionKeywords: ["уютный", "комфортный", "тёплый", "светлый", "удобный"]
- "просторный" → areaMin: 70, descriptionKeywords: ["просторный", "большой", "широкий"]
- "современный/новый" → descriptionKeywords: ["современный", "новый", "ремонт", "евроремонт", "новостройка"]
- "бюджетный/недорого" → priceMax: 50000, descriptionKeywords: ["недорого", "доступный", "выгодно"]
- "премиум/элитный" → priceMin: 80000, verifiedOnly: true, descriptionKeywords: ["премиум", "элитный", "люкс", "элит"]

Парсь запрос в JSON-объект:
{
  "priceMin": число или null,
  "priceMax": число или null,
  "bedroomsMin": число или null,
  "bathroomsMin": число или null,
  "areaMin": число (м²) или null,
  "areaMax": число (м²) или null,
  "verifiedOnly": boolean,
  "financing": boolean,
  "districts": ["район1", "район2"] или null,
  "propertyType": "apartment"|"house"|"studio"|"commercial" или null,
  "lifestyle": "краткое описание потребности пользователя",
  "descriptionKeywords": ["слово1", "слово2"] - ключевые слова для поиска в описаниях
}

Ответ строго в JSON без пояснений.`;

    const user = `Запрос пользователя: """${q}"""

Примеры:
- "уютная квартира для семьи" → {"bedroomsMin":2,"priceMax":70000,"areaMin":60,"lifestyle":"семейная квартира","descriptionKeywords":["уютный","семья","дети","комфортный"]}
- "бюджетный вариант в Сергели" → {"districts":["Sergeli"],"priceMax":50000,"lifestyle":"бюджетный вариант","descriptionKeywords":["недорого","доступный"]}
- "3 комнаты с финансированием" → {"bedroomsMin":3,"financing":true,"lifestyle":"квартира с финансированием"}
- "просторный дом для большой семьи" → {"propertyType":"house","bedroomsMin":3,"areaMin":100,"lifestyle":"дом для большой семьи","descriptionKeywords":["просторный","большой","семья","дети"]}`;

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
      return new Response(JSON.stringify({ error: 'AI parse error', details: errText }), { 
        status: 502, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const parsedData = await parseResp.json();
    const raw = parsedData?.choices?.[0]?.message?.content?.trim() || '{}';

    let filters: ParsedFilters = {};
    try { 
      filters = JSON.parse(raw); 
      console.log('✓ Parsed filters:', JSON.stringify(filters, null, 2));
    } catch (e) { 
      console.error('✗ Failed to parse AI response:', raw);
      filters = {}; 
    }

    console.log('\n=== Executing Database Query ===');
    const strictResults: Property[] = await realDbQuery(supabase, filters, { cursor, pageSize });
    console.log(`Strict query returned: ${strictResults.length} properties`);

    let mode: 'strict' | 'relaxed' = 'strict';
    let candidates: Property[] = strictResults;

    // Only use relaxed mode if we got very few results
    if (strictResults.length < 3) {
      console.log('\n=== Using Relaxed Mode (< 3 results) ===');
      mode = 'relaxed';
      const relaxed = await realDbQuery(supabase, relaxFilters(filters), { cursor, pageSize: 100 });
      console.log(`Relaxed query returned: ${relaxed.length} properties`);
      
      // Score all relaxed results
      const scored = relaxed.map((p) => ({ p, score: scoreProperty(p, filters) }));
      scored.sort((a, b) => b.score - a.score); // Higher score = better match
      
      console.log('Top 5 scores:', scored.slice(0, 5).map(s => ({ 
        id: s.p.id, 
        score: s.score, 
        title: s.p.title.substring(0, 30) 
      })));
      
      // Only take properties with decent scores (>40)
      const goodMatches = scored.filter(s => s.score > 40);
      candidates = goodMatches.slice(0, pageSize).map(({ p }) => p);
      console.log(`Final candidates: ${candidates.length} (score > 40)`);
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

    console.log('\n=== Search Complete ===');
    console.log(`Returning ${resultsWithWhy.length} results in ${mode} mode`);

    return new Response(JSON.stringify({
      results: resultsWithWhy,
      aiSuggestion,
      filters,
      mode,
      nextCursor: null,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('✗ Search error:', msg);
    console.error('Stack:', e instanceof Error ? e.stack : 'No stack');
    return new Response(JSON.stringify({ error: msg }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

async function realDbQuery(supabase: any, f: ParsedFilters, opts: { cursor?: string; pageSize: number; }): Promise<Property[]> {
  try {
    let query = supabase
      .from('properties')
      .select('id, title, price, location, district, bedrooms, bathrooms, area, property_type, is_verified, is_halal_available, halal_status, photos, latitude, longitude, description')
      .in('status', ['active', 'approved'])
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Apply filters with logging
    if (f.priceMin) {
      console.log(`  ✓ Filter: price >= ${f.priceMin}`);
      query = query.gte('price', f.priceMin);
    }
    if (f.priceMax) {
      console.log(`  ✓ Filter: price <= ${f.priceMax}`);
      query = query.lte('price', f.priceMax);
    }
    if (f.bedroomsMin) {
      console.log(`  ✓ Filter: bedrooms >= ${f.bedroomsMin}`);
      query = query.gte('bedrooms', f.bedroomsMin);
    }
    if (f.bathroomsMin) {
      console.log(`  ✓ Filter: bathrooms >= ${f.bathroomsMin}`);
      query = query.gte('bathrooms', f.bathroomsMin);
    }
    if (f.areaMin) {
      console.log(`  ✓ Filter: area >= ${f.areaMin} m²`);
      query = query.gte('area', f.areaMin);
    }
    if (f.areaMax) {
      console.log(`  ✓ Filter: area <= ${f.areaMax} m²`);
      query = query.lte('area', f.areaMax);
    }
    if (f.verifiedOnly) {
      console.log('  ✓ Filter: verified only');
      query = query.eq('is_verified', true);
    }
    
    // Halal financing: must be both available AND approved
    if (f.financing) {
      console.log('  ✓ Filter: halal financing (available + approved)');
      query = query.eq('is_halal_available', true).eq('halal_status', 'approved');
    }
    
    if (f.districts?.length) {
      console.log(`  ✓ Filter: districts in [${f.districts.join(', ')}]`);
      query = query.in('district', f.districts);
    }
    
    if (f.propertyType) {
      console.log(`  ✓ Filter: property type = ${f.propertyType}`);
      if (f.propertyType === 'apartment') {
        query = query.in('property_type', ['apartment', 'studio']);
      } else {
        query = query.eq('property_type', f.propertyType);
      }
    }

    query = query.limit(opts.pageSize);

    const { data, error } = await query;
    
    if (error) {
      console.error('✗ Supabase query error:', error);
      return [];
    }

    console.log(`  Database returned: ${data?.length || 0} properties`);

    // Apply description keyword filtering if specified
    let filteredData = data || [];
    if (f.descriptionKeywords?.length) {
      console.log(`  ✓ Applying description filter: [${f.descriptionKeywords.join(', ')}]`);
      const initialCount = filteredData.length;
      filteredData = filteredData.filter(prop => {
        const description = (prop.description || '').toLowerCase();
        const title = (prop.title || '').toLowerCase();
        const searchText = `${title} ${description}`;
        
        return f.descriptionKeywords!.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
      console.log(`  After description filter: ${filteredData.length} / ${initialCount} properties`);
    }

    // Transform to Property format
    return filteredData.map((prop: any) => ({
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
      description: prop.description,
    }));
  } catch (error) {
    console.error('✗ Database query failed:', error);
    return [];
  }
}

function relaxFilters(f: ParsedFilters): ParsedFilters {
  console.log('  Relaxing filters...');
  const r: ParsedFilters = { ...f };
  
  // Widen price range by 30%
  if (f.priceMin) {
    r.priceMin = Math.floor(f.priceMin * 0.7);
    console.log(`    priceMin: ${f.priceMin} → ${r.priceMin}`);
  }
  if (f.priceMax) {
    r.priceMax = Math.ceil(f.priceMax * 1.3);
    console.log(`    priceMax: ${f.priceMax} → ${r.priceMax}`);
  }
  
  // Reduce bedroom requirement by 1
  if (f.bedroomsMin && f.bedroomsMin > 1) {
    r.bedroomsMin = f.bedroomsMin - 1;
    console.log(`    bedroomsMin: ${f.bedroomsMin} → ${r.bedroomsMin}`);
  }
  
  // Reduce area requirement by 20%
  if (f.areaMin) {
    r.areaMin = Math.floor(f.areaMin * 0.8);
    console.log(`    areaMin: ${f.areaMin} → ${r.areaMin}`);
  }
  
  // Remove strict requirements
  r.verifiedOnly = false;
  r.financing = false;
  r.districts = undefined;
  
  // Keep description keywords for semantic matching
  r.descriptionKeywords = f.descriptionKeywords;
  
  console.log('    Removed: verifiedOnly, financing, districts');
  return r;
}

function scoreProperty(p: Property, f: ParsedFilters): number {
  let score = 100;
  
  // Price matching (weighted 25%)
  if (f.priceMin && p.priceUsd < f.priceMin) {
    const diff = ((f.priceMin - p.priceUsd) / f.priceMin) * 100;
    score -= Math.min(25, diff / 2);
  }
  if (f.priceMax && p.priceUsd > f.priceMax) {
    const diff = ((p.priceUsd - f.priceMax) / f.priceMax) * 100;
    score -= Math.min(25, diff / 2);
  } else if (f.priceMin && f.priceMax && p.priceUsd >= f.priceMin && p.priceUsd <= f.priceMax) {
    score += 15; // Bonus for being in range
  }
  
  // Bedrooms matching (weighted 20%)
  if (f.bedroomsMin && (p.bedrooms || 0) < f.bedroomsMin) {
    score -= (f.bedroomsMin - (p.bedrooms || 0)) * 10;
  } else if (f.bedroomsMin && p.bedrooms === f.bedroomsMin) {
    score += 10;
  }
  
  // Bathrooms matching (weighted 10%)
  if (f.bathroomsMin && (p.bathrooms || 0) < f.bathroomsMin) {
    score -= 10;
  }
  
  // Area matching (weighted 20%)
  if (f.areaMin && (p.sizeM2 || 0) < f.areaMin) {
    const diff = f.areaMin - (p.sizeM2 || 0);
    score -= Math.min(20, diff / 5);
  } else if (f.areaMin && (p.sizeM2 || 0) >= f.areaMin) {
    score += 10;
  }
  if (f.areaMax && (p.sizeM2 || 0) > f.areaMax) {
    score -= 10;
  }
  
  // Verification bonus (weighted 15%)
  if (p.verified) {
    score += 15;
  } else if (f.verifiedOnly) {
    score -= 30;
  }
  
  // Financing match (weighted 10%)
  if (f.financing && !p.financingAvailable) {
    score -= 20;
  } else if (p.financingAvailable) {
    score += 10;
  }
  
  // Description keyword match bonus (semantic relevance)
  if (f.descriptionKeywords?.length && p.description) {
    const description = p.description.toLowerCase();
    const title = p.title.toLowerCase();
    const searchText = `${title} ${description}`;
    const matchCount = f.descriptionKeywords.filter(kw => 
      searchText.includes(kw.toLowerCase())
    ).length;
    score += matchCount * 8; // +8 per keyword match
  }
  
  // District match bonus
  if (f.districts?.length && p.district && f.districts.includes(p.district)) {
    score += 12;
  }
  
  return Math.max(0, Math.round(score));
}

function buildWhyGood(p: Property, f: ParsedFilters, mode: 'strict'|'relaxed'): string {
  const pros: string[] = [];

  // Lifestyle match
  if (f.lifestyle) {
    if (f.lifestyle.includes('семь') || f.lifestyle.includes('family') || f.lifestyle.includes('дети')) {
      if (p.bedrooms && p.bedrooms >= 2 && p.sizeM2 && p.sizeM2 >= 60) {
        pros.push('✓ Идеально для семьи');
      } else if (p.bedrooms && p.bedrooms >= 2) {
        pros.push('Подходит для семьи');
      }
    }
    if (f.lifestyle.includes('молодожён') || f.lifestyle.includes('couple') || f.lifestyle.includes('пара')) {
      if (p.bedrooms && p.bedrooms <= 2) {
        pros.push('✓ Отлично для пары');
      }
    }
  }
  
  // Key features
  if (p.verified) pros.push('✓ Верифицировано');
  if (p.financingAvailable) pros.push('✓ Халяль финансирование');
  
  // Specs
  const specs: string[] = [];
  if (p.bedrooms) specs.push(`${p.bedrooms} спален`);
  if (p.sizeM2) specs.push(`${p.sizeM2}м²`);
  if (specs.length > 0) pros.push(specs.join(', '));
  
  // Price match
  if (f.priceMin && f.priceMax && p.priceUsd >= f.priceMin && p.priceUsd <= f.priceMax) {
    pros.push('В рамках бюджета');
  }
  
  // Location with context
  if (p.district) {
    const districtContext: Record<string, string> = {
      'Yunusabad': 'близко к школам',
      'Chilanzar': 'семейный район',
      'Mirabad': 'центр города',
      'Sergeli': 'доступные цены',
      'Yakkasaray': 'тихий район',
    };
    const context = districtContext[p.district];
    pros.push(context ? `${p.district} (${context})` : p.district);
  }
  
  // Description matches
  if (f.descriptionKeywords?.length && p.description) {
    const matched = f.descriptionKeywords.filter(kw => 
      p.description!.toLowerCase().includes(kw.toLowerCase())
    );
    if (matched.length >= 2) {
      pros.push(`Совпадения: ${matched.slice(0, 2).join(', ')}`);
    }
  }
  
  if (mode === 'relaxed' && pros.length < 2) {
    pros.push('Близкое совпадение');
  }
  
  return pros.slice(0, 4).join(' • ') || (mode === 'strict' ? 'Точное совпадение' : 'Подходящий вариант');
}
