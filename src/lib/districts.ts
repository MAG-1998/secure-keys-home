// Centralized list of districts organized by city with multilingual labels and helpers
// Districts are now city-specific to prevent showing wrong districts for different cities

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

// City keys that have districts defined
export type CityWithDistricts = 'Tashkent';

// Structure: Each city has its own list of districts
export const CITY_DISTRICTS: Record<CityWithDistricts, {
  districts: Record<DistrictKey, {
    labels: Record<Language, string>;
    synonyms: string[];
  }>;
}> = {
  Tashkent: {
    districts: {
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
    }
  }
};

export const ALL_DISTRICT_KEYS = Object.keys(CITY_DISTRICTS.Tashkent.districts) as DistrictKey[];

export function localizeDistrict(key: DistrictKey | string, lang: Language): string {
  if (key === 'Other') {
    const map = { en: 'Other', ru: 'Другое', uz: 'Boshqa' } as const;
    return map[lang] || 'Other';
  }
  const k = key as DistrictKey;
  // Check if district exists in Tashkent (only city with districts currently)
  if (CITY_DISTRICTS.Tashkent.districts[k]) {
    return CITY_DISTRICTS.Tashkent.districts[k].labels[lang] || k;
  }
  return String(key);
}

export function localizeAllDistricts(lang: Language): string {
  const map = { 
    en: 'All Districts', 
    ru: 'Все районы', 
    uz: 'Barcha tumanlar' 
  } as const;
  return map[lang];
}

// Extract a canonical district key from any freeform text (address, location, etc.)
// Note: Currently only works for Tashkent districts
export function extractDistrictFromText(text: string): DistrictKey | 'Other' {
  const lc = (text || '').toLowerCase();
  for (const key of ALL_DISTRICT_KEYS) {
    const { synonyms } = CITY_DISTRICTS.Tashkent.districts[key];
    if (synonyms.some(s => lc.includes(s.toLowerCase()))) return key;
  }
  return 'Other';
}

// Get district options for a specific city
// Returns "All Districts" option plus any districts defined for that city
export function getDistrictOptionsForCity(
  city: string | undefined, 
  lang: Language
): { value: string; label: string }[] {
  // Always include "All Districts" option at the top
  const allOption = { 
    value: 'all', 
    label: localizeAllDistricts(lang) 
  };
  
  // Check if this city has districts defined
  const cityKey = city as CityWithDistricts;
  const cityData = CITY_DISTRICTS[cityKey];
  
  if (!cityData || !cityData.districts || Object.keys(cityData.districts).length === 0) {
    // City has no districts defined yet, return only "All Districts"
    return [allOption];
  }
  
  // City has districts, return "All" plus the districts
  const districtOptions = Object.entries(cityData.districts).map(([key, data]) => ({
    value: key,
    label: data.labels[lang]
  }));
  
  return [allOption, ...districtOptions];
}

// Legacy function for backward compatibility - returns all Tashkent districts
// Deprecated: Use getDistrictOptionsForCity instead
export function getDistrictOptions(lang: Language): { value: DistrictKey; label: string }[] {
  return ALL_DISTRICT_KEYS.map((k) => ({ 
    value: k, 
    label: CITY_DISTRICTS.Tashkent.districts[k].labels[lang] 
  }));
}
