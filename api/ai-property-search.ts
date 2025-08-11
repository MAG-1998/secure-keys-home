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

    const dbResults: Property[] = await fakeDbQuery(filters, { cursor, pageSize });

    const suggestionPrompt = `Пользовательский запрос: "${q}"
Найдено объектов: ${dbResults.length}
Фильтры: ${JSON.stringify(filters)}
Дай 1–2 коротких совета: как улучшить поиск (например, расширить бюджет, район, кол-во комнат). Русский язык.`;

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
    });

    let aiSuggestion = '';
    if (suggResp.ok) {
      const suggData = await suggResp.json();
      aiSuggestion = suggData?.choices?.[0]?.message?.content?.trim() || '';
    }

    res.status(200).json({
      results: dbResults,
      aiSuggestion,
      filters,
      nextCursor: null
    });

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
