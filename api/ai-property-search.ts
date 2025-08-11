// api/ai-property-search.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

type Property = {
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
  tags?: string[];
  thumbnailUrl?: string;
};

type ParsedFilters = {
  priceMin?: number;
  priceMax?: number;
  familySize?: number;
  nearTashkent?: boolean;
  maxDistanceKm?: number;
  bedroomsMin?: number;
  verifiedOnly?: boolean;
  financing?: boolean;
  districts?: string[];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { q = '', cursor, pageSize = 20 } = (req.body ?? {}) as {
      q?: string; cursor?: string; pageSize?: number;
    };

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    const system = `Ты — помощник по недвижимости в Узбекистане.
Парсь запрос пользователя в JSON-объект со строго следующими полями:
priceMin, priceMax, familySize, nearTashkent, maxDistanceKm, bedroomsMin, verifiedOnly, financing, districts[].
Если не уверен — оставляй поле пустым. Ответ строго в JSON без пояснений.`;

    const user = `Запрос: """${q}"""
Пример: {"priceMin":30000,"priceMax":70000,"familySize":3,"nearTashkent":true,"maxDistanceKm":50,"bedroomsMin":2,"verifiedOnly":true,"financing":true,"districts":["Sergeli","Yunusabad"]}`;

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

    const strictResults: Property[] = await fakeDbQuery(filters, { cursor, pageSize });

    // If no strict matches, relax filters and pick best-fit candidates with explanations
    let mode: 'strict' | 'relaxed' = 'strict'
    let candidates: Property[] = strictResults

    if (strictResults.length === 0) {
      mode = 'relaxed'
      const relaxed = await fakeDbQuery(relaxFilters(filters), { cursor, pageSize: 100 })
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
async function fakeDbQuery(f: ParsedFilters, opts: { cursor?: string; pageSize: number; }): Promise<Property[]> {
  const ALL: Property[] = [
    { id: '1', title: '2-комн., Сергели', priceUsd: 52000, city: 'Tashkent', district: 'Sergeli', bedrooms: 2, sizeM2: 58, distanceToTashkentKm: 0, verified: true, financingAvailable: true, tags:['family'], thumbnailUrl:'/p1.jpg' },
    { id: '2', title: '3-комн., Юнусабад', priceUsd: 69000, city: 'Tashkent', district: 'Yunusabad', bedrooms: 3, sizeM2: 72, distanceToTashkentKm: 0, verified: true, financingAvailable: false, tags:['schools'], thumbnailUrl:'/p2.jpg' },
    { id: '3', title: 'Дом близ Ташкента', priceUsd: 45000, city: 'Zangiota', bedrooms: 2, sizeM2: 80, distanceToTashkentKm: 18, verified: true, financingAvailable: true, tags:['yard'], thumbnailUrl:'/p3.jpg' },
  ];

  return ALL.filter(p => {
    if (f.priceMin && p.priceUsd < f.priceMin) return false;
    if (f.priceMax && p.priceUsd > f.priceMax) return false;
    if (f.bedroomsMin && (p.bedrooms ?? 0) < f.bedroomsMin) return false;
    if (f.nearTashkent && (p.distanceToTashkentKm ?? 0) > (f.maxDistanceKm ?? 30)) return false;
    if (f.verifiedOnly && !p.verified) return false;
    if (f.financing && !p.financingAvailable) return false;
    if (f.districts?.length && p.district && !f.districts.includes(p.district)) return false;
    return true;
  }).slice(0, opts.pageSize);
}

async function safeText(r: Response) {
  try { return await r.text(); } catch { return ''; }
}

function relaxFilters(f: ParsedFilters): ParsedFilters {
  const r: ParsedFilters = { ...f }
  if (f.priceMin) r.priceMin = Math.floor(f.priceMin * 0.85)
  if (f.priceMax) r.priceMax = Math.ceil(f.priceMax * 1.15)
  if (f.bedroomsMin) r.bedroomsMin = Math.max(0, f.bedroomsMin - 1)
  if (f.nearTashkent) {
    r.nearTashkent = true
    r.maxDistanceKm = Math.ceil(((f.maxDistanceKm ?? 30) as number) * 1.5)
  }
  r.verifiedOnly = false
  r.financing = false
  // расширим районы, если пользователь указывал
  r.districts = undefined
  return r
}

function scoreProperty(p: Property, f: ParsedFilters): number {
  let score = 0
  if (f.priceMax && p.priceUsd > f.priceMax) {
    score += ((p.priceUsd - f.priceMax) / f.priceMax) * 100
  }
  if (f.priceMin && p.priceUsd < f.priceMin) {
    score += ((f.priceMin - p.priceUsd) / f.priceMin) * 20
  }
  if (f.nearTashkent) {
    const limit = f.maxDistanceKm ?? 30
    const d = (p.distanceToTashkentKm ?? 0) - limit
    if (d > 0) score += d
  }
  if (typeof f.bedroomsMin === 'number' && typeof p.bedrooms === 'number' && p.bedrooms < f.bedroomsMin) {
    score += (f.bedroomsMin - p.bedrooms) * 10
  }
  if (f.financing && !p.financingAvailable) score += 15
  if (f.verifiedOnly && !p.verified) score += 10
  if (f.districts?.length && p.district && !f.districts.includes(p.district)) score += 8

  // небольшие бонусы
  if (p.verified) score -= 2
  if (p.financingAvailable) score -= 2
  if (typeof f.bedroomsMin === 'number' && typeof p.bedrooms === 'number' && p.bedrooms >= f.bedroomsMin) score -= 2

  return Math.max(0, Math.round(score))
}

function buildWhyGood(p: Property, f: ParsedFilters, mode: 'strict'|'relaxed'): string {
  const pros: string[] = []
  const cons: string[] = []

  if (typeof f.priceMax === 'number' && p.priceUsd > f.priceMax) {
    const perc = Math.round(((p.priceUsd - f.priceMax) / f.priceMax) * 100)
    cons.push(`чуть выше бюджета (+${perc}%)`)
  } else if (typeof f.priceMin === 'number' && p.priceUsd < f.priceMin) {
    cons.push('ниже желаемого бюджета')
  } else if (typeof f.priceMin === 'number' || typeof f.priceMax === 'number') {
    pros.push('в пределах бюджета')
  }

  if (f.nearTashkent) {
    const limit = f.maxDistanceKm ?? 30
    const d = (p.distanceToTashkentKm ?? 0) - limit
    if (d > 0) cons.push(`дальше лимита от Ташкента на ${Math.round(d)} км`)
    else pros.push('близко к Ташкенту')
  }

  if (typeof f.bedroomsMin === 'number') {
    if ((p.bedrooms ?? 0) < f.bedroomsMin) cons.push(`меньше спален (нужно ≥${f.bedroomsMin})`)
    else pros.push(`${p.bedrooms ?? 0} спален — соответствует запросу`)
  }

  if (f.financing && !p.financingAvailable) cons.push('без халяль‑финансирования')
  if (p.financingAvailable) pros.push('доступно финансирование')

  if (f.verifiedOnly && !p.verified) cons.push('без верификации')
  if (p.verified) pros.push('верифицированное объявление')

  if (f.districts?.length) {
    if (p.district && f.districts.includes(p.district)) pros.push('в желаемом районе')
    else cons.push('другой район')
  } else if (p.district) {
    pros.push(`район: ${p.district}`)
  }

  if (mode === 'strict' && cons.length === 0) return 'Полное совпадение с запросом.'

  const consStr = cons.length ? `Компромисс: ${cons.join(', ')}` : ''
  const prosStr = pros.length ? `Плюсы: ${pros.join(', ')}` : ''
  return [consStr, prosStr].filter(Boolean).join('; ')
}
