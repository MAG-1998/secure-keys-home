import { CityKey } from './cities';

export type RegionKey = 'Tashkent_Region' | 'Fergana_Region';

export type Language = 'en' | 'ru' | 'uz';

export const REGIONS: Record<RegionKey, {
  labels: Record<Language, string>;
  cities: CityKey[];
  coordinates: [number, number]; // Regional center coordinates
}> = {
  Tashkent_Region: {
    labels: { 
      en: 'Tashkent Region', 
      ru: 'Ташкентская область', 
      uz: 'Toshkent viloyati' 
    },
    cities: ['Tashkent'],
    coordinates: [41.2995, 69.2401]
  },
  Fergana_Region: {
    labels: { 
      en: 'Fergana Region', 
      ru: 'Ферганская область', 
      uz: 'Fargʻona viloyati' 
    },
    cities: ['Kokand'],
    coordinates: [40.3864, 71.7864]
  }
};

// Get cities for a region
export function getCitiesForRegion(region: RegionKey): CityKey[] {
  return REGIONS[region]?.cities || [];
}

// Get region options for dropdown
export function getRegionOptions(lang: Language): { value: RegionKey; label: string }[] {
  return (Object.keys(REGIONS) as RegionKey[]).map((k) => ({ 
    value: k, 
    label: REGIONS[k].labels[lang] 
  }));
}

// Get region for a city (reverse lookup)
export function getRegionForCity(city: CityKey): RegionKey | null {
  for (const [regionKey, regionData] of Object.entries(REGIONS)) {
    if (regionData.cities.includes(city)) {
      return regionKey as RegionKey;
    }
  }
  return null;
}

// Get localized region name
export function localizeRegion(region: RegionKey, lang: Language): string {
  return REGIONS[region]?.labels[lang] || region;
}
