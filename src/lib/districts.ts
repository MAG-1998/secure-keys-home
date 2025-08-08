// Centralized list of Tashkent districts with multilingual labels and helpers
// Canonical keys use English-friendly slugs; values provide localized labels and common synonyms

export type DistrictKey =
  | 'Bektemir'
  | 'Chilonzor'
  | 'Mirobod'
  | 'Mirzo-Ulugbek'
  | 'Sergeli'
  | 'Shaykhantahur'
  | 'Uchtepa'
  | 'Yakkasaray'
  | 'Yunusobod'
  | 'Yashnobod'
  | 'Olmazor'
  | 'Yangihayot';

export type Language = 'en' | 'ru' | 'uz';

export const DISTRICTS: Record<DistrictKey, {
  labels: Record<Language, string>
  synonyms: string[]
}> = {
  Bektemir: {
    labels: { en: 'Bektemir', ru: 'Бектемир', uz: 'Bektemir' },
    synonyms: ['Bektemir', 'Бектемир']
  },
  Chilonzor: {
    labels: { en: 'Chilonzor', ru: 'Чиланзар', uz: 'Chilonzor' },
    synonyms: ['Chilanzar', 'Chilonzor', 'Чиланзар']
  },
  Mirobod: {
    labels: { en: 'Mirobod', ru: 'Миробод', uz: 'Mirobod' },
    synonyms: ['Mirobod', 'Mirabad', 'Миробод', 'Мирабад']
  },
  'Mirzo-Ulugbek': {
    labels: { en: 'Mirzo-Ulugbek', ru: 'Мирзо-Улугбек', uz: "Mirzo-Ulugʻbek" },
    synonyms: ['Mirzo Ulugbek', 'Mirzo-Ulugbek', 'Мирзо-Улугбек']
  },
  Sergeli: {
    labels: { en: 'Sergeli', ru: 'Сергелий', uz: 'Sergeli' },
    synonyms: ['Sergeli', 'Сергелий']
  },
  Shaykhantahur: {
    labels: { en: 'Shaykhantahur', ru: 'Шайхантахур', uz: 'Shayxontohur' },
    synonyms: ['Shaykhantakhur', 'Shaykhantahur', 'Shayxontohur', 'Шайхантахур']
  },
  Uchtepa: {
    labels: { en: 'Uchtepa', ru: 'Учтепа', uz: 'Uchtepa' },
    synonyms: ['Uchtepa', 'Учтепа']
  },
  Yakkasaray: {
    labels: { en: 'Yakkasaray', ru: 'Яккасарай', uz: 'Yakkasaroy' },
    synonyms: ['Yakkasaray', 'Yakkasaroy', 'Яккасарай']
  },
  Yunusobod: {
    labels: { en: 'Yunusobod', ru: 'Юнусабад', uz: 'Yunusobod' },
    synonyms: ['Yunusabad', 'Yunusobod', 'Юнусабад']
  },
  Yashnobod: {
    labels: { en: 'Yashnobod', ru: 'Яшнобод', uz: 'Yashnobod' },
    synonyms: ['Yashnabad', 'Yashnobod', 'Яшнобод']
  },
  Olmazor: {
    labels: { en: 'Olmazor', ru: 'Алмазар', uz: 'Olmazor' },
    synonyms: ['Olmazor', 'Almazar', 'Алмазар']
  },
  Yangihayot: {
    labels: { en: 'Yangihayot', ru: 'Янгиҳает', uz: 'Yangihayot' },
    synonyms: ['Yangihayot', 'Yangihayat', 'Янгиҳаёт', 'Янгиҳает']
  },
};

export const ALL_DISTRICT_KEYS = Object.keys(DISTRICTS) as DistrictKey[];

export function localizeDistrict(key: DistrictKey | string, lang: Language): string {
  if (key === 'Other') {
    const map = { en: 'Other', ru: 'Другое', uz: 'Boshqa' } as const;
    return map[lang] || 'Other';
  }
  const k = key as DistrictKey;
  if (DISTRICTS[k]) return DISTRICTS[k].labels[lang] || k;
  return String(key);
}

// Extract a canonical district key from any freeform text (address, location, etc.)
export function extractDistrictFromText(text: string): DistrictKey | 'Other' {
  const lc = (text || '').toLowerCase();
  for (const key of ALL_DISTRICT_KEYS) {
    const { synonyms } = DISTRICTS[key];
    if (synonyms.some(s => lc.includes(s.toLowerCase()))) return key;
  }
  return 'Other';
}

// Given a canonical key, get label in all languages for UI lists
export function getDistrictOptions(lang: Language): { value: DistrictKey; label: string }[] {
  return ALL_DISTRICT_KEYS.map((k) => ({ value: k, label: DISTRICTS[k].labels[lang] }));
}
