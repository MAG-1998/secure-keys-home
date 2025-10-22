export type CityKey = 'Tashkent' | 'Kokand';

export type Language = 'en' | 'ru' | 'uz';

export const CITIES: Record<CityKey, {
  labels: Record<Language, string>;
  synonyms: string[];
  coordinates: [number, number]; // [lat, lng] for map centering
}> = {
  Tashkent: {
    labels: { 
      en: 'Tashkent', 
      ru: 'Ташкент', 
      uz: 'Toshkent' 
    },
    synonyms: ['Tashkent', 'Ташкент', 'Toshkent', 'tashkent', 'Uzbekistan, Tashkent'],
    coordinates: [41.2995, 69.2401] // Center of Tashkent
  },
  Kokand: {
    labels: { 
      en: 'Kokand', 
      ru: 'Коканд', 
      uz: "Qo'qon" 
    },
    synonyms: ['Kokand', 'Коканд', "Qo'qon", 'Qoqon', 'kokand', 'Ферганская область, Коканд'],
    coordinates: [40.5285, 70.9425] // Center of Kokand
  }
};

// Extract city from location text (for filtering properties)
export function extractCityFromText(text: string): CityKey | null {
  if (!text) return null;
  const lc = text.toLowerCase();
  
  for (const key of Object.keys(CITIES) as CityKey[]) {
    const { synonyms } = CITIES[key];
    if (synonyms.some(s => lc.includes(s.toLowerCase()))) {
      return key;
    }
  }
  return null;
}

// Get coordinates for a city (for map centering)
export function getCityCoordinates(city: CityKey): [number, number] {
  return CITIES[city]?.coordinates || [41.2995, 69.2401];
}

// Get city options for dropdown
export function getCityOptions(lang: Language): { value: CityKey; label: string }[] {
  return (Object.keys(CITIES) as CityKey[]).map((k) => ({ 
    value: k, 
    label: CITIES[k].labels[lang] 
  }));
}

// Get localized city name
export function localizeCity(city: CityKey, lang: Language): string {
  return CITIES[city]?.labels[lang] || city;
}

// Get all city synonyms for a given city (useful for database queries)
export function getCitySynonyms(city: CityKey): string[] {
  return CITIES[city]?.synonyms || [];
}
