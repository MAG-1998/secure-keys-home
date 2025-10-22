import { CityKey } from './cities';

export type RegionKey = 
  | 'Tashkent_City'
  | 'Andijan_Region'
  | 'Bukhara_Region'
  | 'Fergana_Region'
  | 'Jizzakh_Region'
  | 'Namangan_Region'
  | 'Navoiy_Region'
  | 'Qashqadaryo_Region'
  | 'Samarqand_Region'
  | 'Sirdaryo_Region'
  | 'Surxondaryo_Region'
  | 'Tashkent_Region'
  | 'Xorazm_Region'
  | 'Karakalpakstan';

export type Language = 'en' | 'ru' | 'uz';

export const REGIONS: Record<RegionKey, {
  labels: Record<Language, string>;
  cities: CityKey[];
  coordinates: [number, number];
}> = {
  Tashkent_City: {
    labels: { 
      en: 'Tashkent', 
      ru: 'Ташкент', 
      uz: 'Toshkent' 
    },
    cities: ['Tashkent'],
    coordinates: [41.2995, 69.2401]
  },
  
  Andijan_Region: {
    labels: { 
      en: 'Andijan Region', 
      ru: 'Андижанская область', 
      uz: 'Andijon viloyati' 
    },
    cities: [
      'Oqoltin', 'Oltinkol', 'Andijon', 'Asaka', 'Oxunboboyev', 
      'Baliqchi', 'Boz', 'Buloqboshi', 'Qorasuv_Andijan', 'Kuyganyor', 
      'Qorgontepa', 'Marhamat', 'Poytug', 'Paxtaobod', 'Xonobod', 
      'Xojaobod', 'Shahrixon'
    ],
    coordinates: [40.7821, 72.3442]
  },
  
  Bukhara_Region: {
    labels: { 
      en: 'Bukhara Region', 
      ru: 'Бухарская область', 
      uz: 'Buxoro viloyati' 
    },
    cities: [
      'Olot', 'Buxoro', 'Vobkent', 'Gazli', 'Galaosiyo', 'Gijduvon', 
      'Jondor', 'Kogon', 'Qorakol', 'Qorovulbozor', 'Romitan', 'Shofirkon'
    ],
    coordinates: [39.7747, 64.4286]
  },
  
  Fergana_Region: {
    labels: { 
      en: 'Fergana Region', 
      ru: 'Ферганская область', 
      uz: "Farg'ona viloyati" 
    },
    cities: [
      'Oltiariq', 'Bogdod', 'Beshariq', 'Vodil', 'Dangara', 'Qoqon', 
      'Quva', 'Quvasoy', 'Langar', 'Margilon', 'Navbahor', 'Ravon', 
      'Rishton', 'Toshloq', 'Uchkoprik', 'Fargona', 'Hamza', 
      'Shohimardon', 'Yozyovon', 'Yaypan', 'YangiMargilon', 'Yangiqorgon'
    ],
    coordinates: [40.3864, 71.7864]
  },
  
  Jizzakh_Region: {
    labels: { 
      en: 'Jizzakh Region', 
      ru: 'Джизакская область', 
      uz: 'Jizzax viloyati' 
    },
    cities: [
      'Aydarkol', 'Balandchaqir', 'Gagarin', 'Gallaorol', 'Goliblar',
      'Dashtaobod', 'Jizzax', 'Dostlik', 'Zomin', 'Zarbdor', 
      'Zafarobod', 'Marjonbuloq', 'Paxtakor', 'Osmat', 'Uchtepa', 'Yangiqishloq'
    ],
    coordinates: [40.1158, 67.8422]
  },
  
  Namangan_Region: {
    labels: { 
      en: 'Namangan Region', 
      ru: 'Наманганская область', 
      uz: 'Namangan viloyati' 
    },
    cities: [
      'Jamashoy', 'Kosonsoy', 'Namangan', 'Pop', 'Toshbuloq', 
      'Toraqorgon', 'Uchqorgon', 'Xaqqulobod', 'Chortoq', 'Chust'
    ],
    coordinates: [40.9983, 71.6726]
  },
  
  Navoiy_Region: {
    labels: { 
      en: 'Navoiy Region', 
      ru: 'Навоийская область', 
      uz: 'Navoiy viloyati' 
    },
    cities: [
      'Beshrobot', 'Zarafshon', 'Konimex', 'Karmana', 'Qiziltepa', 
      'Navoiy', 'Nurota', 'Tomdibuloq', 'Uchquduq', 'Yangirobot'
    ],
    coordinates: [40.0844, 65.3792]
  },
  
  Qashqadaryo_Region: {
    labels: { 
      en: 'Qashqadaryo Region', 
      ru: 'Кашкадарьинская область', 
      uz: 'Qashqadaryo viloyati' 
    },
    cities: [
      'Beshkent', 'Guzor', 'Dehqonobod', 'Qamashi', 'Karashina', 
      'Qarshi', 'Koson', 'Kasbi', 'Kitob', 'Muborak', 'Muglon', 
      'Talimarjon', 'Chiroqchi', 'Shahrisabz', 'Yakkabog', 'Mirishkor', 'Nishon'
    ],
    coordinates: [38.8606, 65.7897]
  },
  
  Samarqand_Region: {
    labels: { 
      en: 'Samarqand Region', 
      ru: 'Самаркандская область', 
      uz: 'Samarqand viloyati' 
    },
    cities: [
      'Oqtosh', 'Bulungur', 'Gozalkent', 'Gulobod', 'Darband', 
      'Jomboy', 'Juma', 'Ziadin', 'Ishtixon', 'Kottaqorgon', 
      'Qoshrobod', 'Loish', 'Nurobod', 'Payariq', 'Payshanba', 
      'Samarqand', 'Tayloq', 'Urgut', 'Chelak'
    ],
    coordinates: [39.6542, 66.9597]
  },
  
  Sirdaryo_Region: {
    labels: { 
      en: 'Sirdaryo Region', 
      ru: 'Сырдарьинская область', 
      uz: 'Sirdaryo viloyati' 
    },
    cities: [
      'Sirdaryo', 'Baxt', 'Boyovut', 'Guliston', 'Navroz', 
      'Sayxun', 'Sardoba', 'Terenozek', 'Xovos', 'Shirin', 'Yangiyer'
    ],
    coordinates: [40.4897, 68.7842]
  },
  
  Surxondaryo_Region: {
    labels: { 
      en: 'Surxondaryo Region', 
      ru: 'Сурхандарьинская область', 
      uz: 'Surxondaryo viloyati' 
    },
    cities: [
      'Angor', 'Boysun', 'Bandixon', 'Denov', 'Jarqorgon', 
      'Qorlik', 'Qiziriq', 'Qumqorgon', 'Muzrobod', 'Sariosiyo', 
      'Sariq', 'Termiz', 'Uzun', 'Uchqizil', 'Xalqobod', 
      'Shargun', 'Sherobod', 'Shorchi'
    ],
    coordinates: [37.2242, 67.2783]
  },
  
  Tashkent_Region: {
    labels: { 
      en: 'Tashkent Region', 
      ru: 'Ташкентская область', 
      uz: 'Toshkent viloyati' 
    },
    cities: [
      'Soqoq', 'Oqqorgon', 'Olmaliq', 'Angren', 'Ohangaron', 
      'Bekobod', 'KattaChimyon', 'Boka', 'Gazalkent', 'Gulbahor', 
      'Durmen', 'Dostobod', 'Zangiota', 'Zafar', 'Iskandar', 
      'Qorasuv_Tashkent', 'Keles', 'Qibray', 'Koksaroy', 'Krasnogorsk', 'Mirobod', 
      'Nazarbek', 'Toytepa', 'Parkent', 'Pskent', 'Salar', 
      'Tashmore', 'Turkiston', 'Ortaovul', 'Xojakent', 'Chorvoq', 
      'Chinoz', 'Chirchiq', 'Eshonguzar', 'Yangibozor', 'Yangiyol'
    ],
    coordinates: [41.2995, 69.2401]
  },
  
  Xorazm_Region: {
    labels: { 
      en: 'Xorazm Region', 
      ru: 'Хорезмская область', 
      uz: 'Xorazm viloyati' 
    },
    cities: [
      'Bogot', 'Gurlan', 'Qorovul', 'Qoshkopir', 'Pitnak', 
      'Urganch', 'Xozarasp', 'Xonqa', 'Xiva', 'Cholish', 
      'Shovot', 'Yangiariq'
    ],
    coordinates: [41.5500, 60.6333]
  },
  
  Karakalpakstan: {
    labels: { 
      en: 'Republic of Karakalpakstan', 
      ru: 'Республика Каракалпакстан', 
      uz: "Qoraqalpog'iston Respublikasi" 
    },
    cities: [
      'Oqmangit', 'Beruniy', 'Boston', 'Qanlikol', 'Qoraozak', 
      'Kegeyli', 'Qongirot', 'Mangit', 'Moynoq', 'Nukus', 
      'Taxiatosh', 'Tortkol', 'Xojayli', 'Chimboy', 'Shumanay'
    ],
    coordinates: [42.4531, 59.6103]
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
