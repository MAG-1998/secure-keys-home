import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";


export type Language = 'en' | 'ru' | 'uz';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': {
    en: 'Home',
    ru: 'Главная',
    uz: 'Bosh sahifa'
  },
  'nav.search': {
    en: 'Search',
    ru: 'Поиск',
    uz: 'Qidiruv'
  },
  'nav.map': {
    en: 'Map',
    ru: 'Карта',
    uz: 'Xarita'
  },
  'nav.features': {
    en: 'Features',
    ru: 'Функции',
    uz: 'Imkoniyatlar'
  },
  'nav.financing': {
    en: 'Financing',
    ru: 'Финансы',
    uz: 'Moliya'
  },
  'nav.signIn': {
    en: 'Sign In',
    ru: 'Войти',
    uz: 'Kirish'
  },

  // Property actions
  'property.messageOwner': {
    en: 'Message Owner',
    ru: 'Написать владельцу',
    uz: 'Egasiga xabar'
  },
  'property.reportProperty': {
    en: 'Report Property',
    ru: 'Пожаловаться',
    uz: 'Mulkni bildiruv'
  },
  'property.totalPropertyPrice': {
    en: 'Total Property Price:',
    ru: 'Общая стоимость недвижимости:',
    uz: 'Umumiy mulk narxi:'
  },
  'property.bed': {
    en: 'bed',
    ru: 'спальня',
    uz: 'yotoq xona'
  },
  'property.beds': {
    en: 'beds',
    ru: 'спален',
    uz: 'yotoq xonalar'
  },
  'property.bath': {
    en: 'bath',
    ru: 'ванная',
    uz: 'hammom'
  },
  'property.baths': {
    en: 'baths',
    ru: 'ванных',
    uz: 'hammomlar'
  },

  // Halal financing
  'halal.calculator': {
    en: 'Halal Financing Calculator',
    ru: 'Калькулятор халяльной рассрочки',
    uz: 'Halol moliyalashtirish kalkulyatori'
  },
  'nav.getStarted': {
    en: 'Get Started',
    ru: 'Начать',
    uz: 'Boshlash'
  },

  // Hero Section - Original functionality preserved
  'hero.titleStandard': {
    en: 'Find Your Perfect Home',
    ru: 'Найди свой идеальный дом',
    uz: 'Mukammal uyingizni toping'
  },
  'hero.titleHalal': {
    en: 'Find Your Perfect Home',
    ru: 'Найди свой идеальный дом',
    uz: 'Mukammal uyingizni toping'
  },
  // Split title parts for precise styling (avoid word-splitting bugs)
  'hero.titleStandardLead': {
    en: 'Find Your',
    ru: 'Найди свой',
    uz: 'Toping'
  },
  'hero.titleStandardHighlight': {
    en: 'Perfect Home',
    ru: 'идеальный дом',
    uz: 'mukammal uyingizni'
  },
  'hero.titleHalalLead': {
    en: 'Find Your',
    ru: 'Найди свой',
    uz: 'Toping'
  },
  'hero.titleHalalHighlight': {
    en: 'Perfect Home',
    ru: 'идеальный дом',
    uz: 'mukammal uyingizni'
  },
  // Unauthenticated hero tagline split
  'hero.buyLead': {
    en: 'Buy Smart',
    ru: 'Покупай умно',
    uz: 'Aqlli xarid qiling'
  },
  'hero.buyHighlight': {
    en: 'Buy Fair',
    ru: 'покупай честно',
    uz: 'adolatli xarid qiling'
  },
  'hero.subtitleStandard': {
    en: 'Discover verified properties with transparent pricing',
    ru: 'Проверенные объекты с прозрачными ценами',
    uz: 'Shaffof narxlar bilan tekshirilgan eʼlonlarni kashf eting'
  },
  'hero.subtitleHalal': {
    en: 'Search verified properties with halal financing options',
    ru: 'Ищите проверенные объекты с халяль финансированием',
    uz: 'Halol moliyalashtirish bilan tekshirilgan eʼlonlarni qidiring'
  },
  'hero.trustedBy': {
    en: 'Trusted by 50,000+ users',
    ru: 'Доверяют 50,000+ пользователей',
    uz: '50,000+ foydalanuvchi ishonadi'
  },
  'hero.verifiedHomes': {
    en: 'Verified Homes',
    ru: 'Проверенные дома',
    uz: 'Tekshirilgan uylar'
  },
  'hero.financing': {
    en: 'Zero Interest Rates',
    ru: 'Нулевая ставка',
    uz: 'Foizsiz'
  },
  'hero.financingHalal': {
    en: '100% Halal Financing',
    ru: '100% халяль финансы',
    uz: '100% halol moliya'
  },
  'hero.verified': {
    en: 'ID Verified Sellers',
    ru: 'Проверенные продавцы',
    uz: 'Tekshirilgan sotuvchilar'
  },
  'hero.badgeStandard': {
    en: '✓ Verified Marketplace',
    ru: '✓ Проверенная площадка',
    uz: '✓ Tekshirilgan platforma'
  },
  'hero.badgeHalal': {
    en: '✓ Sharia-Compliant Platform',
    ru: '✓ Шариатская платформа',
    uz: '✓ Shariatga mos platforma'
  },

  'hero.welcomeBack': {
    en: 'Welcome back',
    ru: 'С возвращением',
    uz: 'Qaytganingiz bilan'
  },
  'hero.transparentPricing': {
    en: 'Transparent Pricing',
    ru: 'Прозрачные цены',
    uz: 'Ochiq narxlar'
  },

  // Search Section
  'search.halalMode': {
    en: 'Halal Financing Mode',
    ru: 'Режим халяль финансов',
    uz: 'Halol moliya rejimi'
  },
  'search.propertiesFound': {
    en: 'properties found',
    ru: 'объектов найдено',
    uz: 'eʼlon topildi'
  },
  'search.eligibleProperties': {
    en: 'eligible properties',
    ru: 'подходящих объектов',
    uz: 'mos eʼlonlar'
  },
  'search.halalBadge': {
    en: '✓ Sharia Compliant',
    ru: '✓ По шариату',
    uz: '✓ Shariatga mos'
  },
  'search.halalToggle': { en: 'Halal Financing Mode', ru: 'Режим халяльной рассрочки', uz: 'Halol moliya rejimi' },
  'search.titleStandard': {
    en: 'Search Verified Properties',
    ru: 'Поиск проверенных домов',
    uz: 'Tekshirilgan uylarni qidirish'
  },
  'search.titleHalal': {
    en: 'Find Halal-Financed Homes',
    ru: 'Дома с халяль финансами',
    uz: 'Halol moliyali uylar'
  },
  'search.descStandard': {
    en: 'Scam-free marketplace with verified properties across Tashkent',
    ru: 'Безопасная площадка с проверенными объектами в Ташкенте',
    uz: 'Toshkentda tekshirilgan uylar bilan xavfsiz platforma'
  },
  'search.descHalal': {
    en: 'Discover verified homes with Sharia-compliant financing options across Tashkent',
    ru: 'Проверенные дома с шариатским финансированием в Ташкенте',
    uz: 'Toshkentda shariatga mos moliya bilan tekshirilgan uylar'
  },
  'search.placeholder': {
    en: "Tell us what you're looking for... (e.g., '3-bedroom near metro with garden')",
    ru: 'Расскажите, что ищете... (например, "3-комнатная рядом с метро с садом")',
    uz: 'Nimani qidirayotganingizni ayting... (masalan, "metro yaqinida bogʻli 3 xonali")'
  },
  'search.searchBtn': {
    en: 'Search',
    ru: 'Найти',
    uz: 'Qidirish'
  },
  'search.filters': {
    en: 'Filters',
    ru: 'Фильтры',
    uz: 'Filtrlar'
  },
  'search.advancedFilters': {
    en: 'Advanced Filters',
    ru: 'Расширенный поиск',
    uz: 'Kengaytirilgan qidiruv'
  },
  'search.advancedFiltersDesc': {
    en: 'More filtering options including land area, price range, and more',
    ru: 'Больше опций фильтрации: площадь участка, диапазон цен и другое',
    uz: 'Qo\'shimcha filtrlash: er maydoni, narx oralig\'i va boshqalar'
  },
  'search.halalFinancing': {
    en: '✓ Halal Financing',
    ru: '✓ Халяль финансы',
    uz: '✓ Halol moliya'
  },
  'search.financialProfile': {
    en: 'Your Financial Profile',
    ru: 'Ваш финансовый профиль',
    uz: 'Moliyaviy profilingiz'
  },
  'search.cashAvailable': {
    en: 'Cash Available ($)',
    ru: 'Наличные ($)',
    uz: 'Naqd pul ($)'
  },
  'search.monthlyPayment': {
    en: 'Monthly Payment ($)',
    ru: 'Месячный платеж ($)',
    uz: 'Oylik toʻlov ($)'
  },
  'search.financingPeriod': {
    en: 'Financing Period',
    ru: 'Период финансирования',
    uz: 'Moliyalashtirish muddati'
  },
  'search.calculatedPayment': {
    en: 'Required Monthly Payment',
    ru: 'Требуемый месячный платеж',
    uz: 'Talab qilinadigan oylik toʻlov'
  },
  'search.totalCost': {
    en: 'Total Financing Cost',
    ru: 'Общая стоимость финансирования',
    uz: 'Umumiy moliyalashtirish narxi'
  },
  'search.breakdown': {
    en: 'Payment Breakdown',
    ru: 'Разбивка платежей',
    uz: 'Toʻlov tafsiloti'
  },
  'search.showAll': {
    en: 'Show all properties (not just what I can afford)',
    ru: 'Показать все (не только по карману)',
    uz: 'Barcha uylarni koʻrsatish (faqat qiziqtirganlar emas)'
  },
  'search.smartMatch': {
    en: 'Smart Match',
    ru: 'Умный подбор',
    uz: 'Aqlli tanlov'
  },
  'search.yunusobod': {
    en: 'Yunusobod',
    ru: 'Юнусабад',
    uz: 'Yunusobod'
  },
  'search.bedrooms': {
    en: '2-3 bedrooms',
    ru: '2-3 комнаты',
    uz: '2-3 xonali'
  },
  'search.priceRange': {
    en: '$40k-60k',
    ru: '$40к-60к',
    uz: '$40k-60k'
  },

  // Filters
  'filter.district': {
    en: 'District',
    ru: 'Район',
    uz: 'Tuman'
  },
  'filter.chooseDistrict': {
    en: 'Choose district',
    ru: 'Выберите район',
    uz: 'Tumanni tanlang'
  },
  'filter.priceRange': {
    en: 'Price Range',
    ru: 'Цена',
    uz: 'Narx oraligʻi'
  },
  'filter.min': { en: 'Min', ru: 'Мин', uz: 'Min' },
  'filter.max': { en: 'Max', ru: 'Макс', uz: 'Maks' },
  'filter.selectBudget': {
    en: 'Select budget',
    ru: 'Выберите бюджет',
    uz: 'Byudjetni tanlang'
  },
  'filter.squareMeters': {
    en: 'Square Meters',
    ru: 'Площадь',
    uz: 'Maydoni'
  },
  'filter.size': {
    en: 'Size',
    ru: 'Размер',
    uz: 'Oʻlchami'
  },
  'filter.propertyType': {
    en: 'Property Type',
    ru: 'Тип',
    uz: 'Uy turi'
  },
  'filter.type': {
    en: 'Type',
    ru: 'Тип',
    uz: 'Turi'
  },
  'filter.apartment': {
    en: 'Apartment',
    ru: 'Квартира',
    uz: 'Kvartira'
  },
  'filter.house': {
    en: 'House',
    ru: 'Дом',
    uz: 'Uy'
  },
  'filter.studio': {
    en: 'Studio',
    ru: 'Студия',
    uz: 'Studiya'
  },
  'filter.commercial': {
    en: 'Commercial',
    ru: 'Коммерческая',
    uz: 'Tijorat'
  },
  'filter.land': {
    en: 'Land',
    ru: 'Участок',
    uz: 'Yer'
  },
  'filter.bedrooms': {
    en: 'Bedrooms',
    ru: 'Комнаты',
    uz: 'Xonalar'
  },
    'filter.landArea': {
      en: 'Land Area (hundred m²)',
      ru: 'Площадь участка (соток)',
      uz: 'Yer maydoni (sotix)'
    },
    'filter.minSotka': {
      en: 'Min hundred m²',
      ru: 'Мин соток',
      uz: 'Min sotix'
    },
    'filter.maxSotka': {
      en: 'Max hundred m²',
      ru: 'Макс соток',
      uz: 'Max sotix'
    },
    'filter.searchByName': {
      en: 'Search by name',
      ru: 'Поиск по названию',
      uz: 'Nom bo\'yicha qidirish'
    },
    'filter.searchPlaceholder': {
      en: 'Search properties...',
      ru: 'Поиск недвижимости...',
      uz: 'Mulkni qidirish...'
    },
    'filter.city': {
      en: 'City',
      ru: 'Город',
      uz: 'Shahar'
    },
    'filter.allCities': {
      en: 'All Cities',
      ru: 'Все города',
      uz: 'Barcha shaharlar'
    },
    'filter.allTypes': {
      en: 'All Types',
      ru: 'Все типы',
      uz: 'Barcha turlar'
    },
    'filter.any': {
      en: 'Any',
      ru: 'Любой',
      uz: 'Har qanday'
    },
    'filter.priceUSD': {
      en: 'Price (USD)',
      ru: 'Цена (USD)',
      uz: 'Narx (USD)'
    },
    'filter.livingArea': {
      en: 'Living Area (m²)',
      ru: 'Жилая площадь (м²)',
      uz: 'Yashash maydoni (m²)'
    },
    'filter.halalFinancing': {
      en: 'Halal financing available',
      ru: 'Доступно халяльное финансирование',
      uz: 'Halol moliyalashtirish mavjud'
    },
    'filter.clearFilters': {
      en: 'Clear Filters',
      ru: 'Очистить фильтры',
      uz: 'Filtrlarni tozalash'
    },
    'filter.bed': {
      en: 'bed',
      ru: 'комн',
      uz: 'xona'
    },
    'filter.bath': {
      en: 'bath',
      ru: 'санузел',
      uz: 'hojatxona'
    },
  'filter.chooseBedrooms': {
    en: 'Choose bedrooms',
    ru: 'Выберите количество комнат',
    uz: 'Xonalar sonini tanlang'
  },
  'filter.chooseType': {
    en: 'Choose type',
    ru: 'Выберите тип',
    uz: 'Turini tanlang'
  },

  // Halal financing translations
  'halal.financing': {
    en: 'Halal Financing',
    ru: 'Халяль финансирование',
    uz: 'Halol moliyalashtirish'
  },
  'halal.cashAvailable': {
    en: 'Cash Available',
    ru: 'Наличные средства',
    uz: 'Naqd pul'
  },
  'halal.financingPeriod': {
    en: 'Financing Period',
    ru: 'Период финансирования',
    uz: 'Moliyalashtirish muddati'
  },

  // Halal financing period options
  'halal.period.6months': { en: '6 months', ru: '6 месяцев', uz: '6 oy' },
  'halal.period.1year': { en: '1 year', ru: '1 год', uz: '1 yil' },
  'halal.period.1.5years': { en: '1.5 years', ru: '1.5 года', uz: '1.5 yil' },
  'halal.period.2years': { en: '2 years', ru: '2 года', uz: '2 yil' },
  'halal.period.3years': { en: '3 years', ru: '3 года', uz: '3 yil' },
  'halal.period.4years': { en: '4 years', ru: '4 года', uz: '4 yil' },
  'halal.period.5years': { en: '5 years', ru: '5 лет', uz: '5 yil' },
  'halal.tax': { en: 'Tax (20%)', ru: 'Налог (20%)', uz: 'Soliq (20%)' },
  'halal.propertyPrice': {
    en: 'Property Price',
    ru: 'Стоимость недвижимости',
    uz: 'Uy narxi'
  },
  'halal.monthlyPayment': {
    en: 'Monthly Payment',
    ru: 'Ежемесячный платёж',
    uz: 'Oylik toʻlov'
  },
  'halal.totalCost': {
    en: 'Total Cost',
    ru: 'Общая стоимость',
    uz: 'Umumiy narx'
  },
  'halal.startingFrom': {
    en: 'Starting from',
    ru: 'От',
    uz: 'Dan boshlab'
  },
  'halal.cashPayment': {
    en: 'Cash Payment',
    ru: 'Наличный платеж',
    uz: 'Naqd toʻlov'
  },
  'halal.requestFinancing': {
    en: 'Request Financing',
    ru: 'Запросить финансирование',
    uz: 'Moliyalashtirish soʻrash'
  },
  'halal.paymentBreakdown': {
    en: 'Payment Breakdown',
    ru: 'Разбивка платежей',
    uz: 'Toʻlov tafsiloti'
  },
  'halal.enterDetailsForBreakdown': {
    en: 'Enter cash available and period to see payment breakdown',
    ru: 'Введите наличные средства и период для просмотра разбивки платежей',
    uz: 'Toʻlov tafsilotini koʻrish uchun naqd pul va muddatni kiriting'
  },
  'halal.enterCashAmount': {
    en: 'Enter cash amount',
    ru: 'Введите сумму наличных',
    uz: 'Naqd pul miqdorini kiriting'
  },
  'halal.selectPeriod': {
    en: 'Select period',
    ru: 'Выберите период',
    uz: 'Muddatni tanlang'
  },
  'halal.minimumCashRequired': {
    en: 'Minimum cash required:',
    ru: 'Минимум наличных требуется:',
    uz: 'Minimum naqd pul kerak:'
  },
  'halal.noFinancingNeeded': {
    en: 'No financing needed - you have enough cash!',
    ru: 'Финансирование не требуется - у вас достаточно наличных!',
    uz: 'Moliyalashtirish kerak emas - sizda yetarli naqd pul bor!'
  },

  // Common
  'common.any': {
    en: 'Any',
    ru: 'Любой',
    uz: 'Hammasi'
  },
  'common.success': {
    en: 'Success',
    ru: 'Успех',
    uz: 'Muvaffaqiyat'
  },

  // Contact section translations
  'contact.title': {
    en: 'Contact Seller',
    ru: 'Связаться с продавцом',
    uz: 'Sotuvchi bilan aloqa'
  },
  'contact.sellerPhone': {
    en: "Seller's Phone",
    ru: 'Телефон продавца',
    uz: 'Sotuvchi telefoni'
  },
  'contact.callNow': {
    en: 'Call Now',
    ru: 'Позвонить',
    uz: "Qo'ng'iroq qilish"
  },
  'contact.preferMessages': {
    en: 'Seller prefers to be contacted via messages',
    ru: 'Продавец предпочитает связь через сообщения',
    uz: "Sotuvchi xabarlar orqali aloqani afzal ko'radi"
  },
  'seller.profile': {
    en: 'Seller Profile',
    ru: 'Профиль продавца',
    uz: 'Sotuvchi profili'
  },
  'seller.memberSince': {
    en: 'Member since',
    ru: 'С нами с',
    uz: 'A\'zo bo\'lgan'
  },
  'seller.totalProperties': {
    en: 'Total properties',
    ru: 'Всего объектов',
    uz: 'Jami mulklar'
  },
  'seller.otherListings': {
    en: 'Other listings by this seller',
    ru: 'Другие объявления продавца',
    uz: 'Sotuvchining boshqa e\'lonlari'
  },
  'seller.viewAll': {
    en: 'View all {{count}} properties',
    ru: 'Посмотреть все {{count}} объектов',
    uz: 'Barcha {{count}} mulkni ko\'rish'
  },
  'seller.business': {
    en: 'Business',
    ru: 'Бизнес',
    uz: 'Biznes'
  },
  'seller.individual': {
    en: 'Individual',
    ru: 'Частное лицо',
    uz: 'Jismoniy shaxs'
  },
  'seller.verified': {
    en: 'Verified',
    ru: 'Проверено',
    uz: 'Tasdiqlangan'
  },
  'seller.noOtherListings': {
    en: 'No other listings',
    ru: 'Нет других объявлений',
    uz: 'Boshqa e\'lonlar yo\'q'
  },
  'seller.viewDetails': {
    en: 'View All Properties',
    ru: 'Посмотреть все объекты',
    uz: 'Barcha mulklarni ko\'rish'
  },
  'seller.anonymous': {
    en: 'Anonymous Seller',
    ru: 'Анонимный продавец',
    uz: 'Anonim sotuvchi'
  },
  'contact.signInRequired': {
    en: 'Sign in to see contact information',
    ru: 'Войдите, чтобы увидеть контактную информацию',
    uz: "Aloqa ma'lumotlarini ko'rish uchun kiring"
  },
  'contact.signInButton': {
    en: 'Sign In',
    ru: 'Войти',
    uz: 'Kirish'
  },

  // Actions section
  'actions.title': {
    en: 'Actions',
    ru: 'Действия',
    uz: 'Amallar'
  },
  'actions.requestVisit': {
    en: 'Request a visit',
    ru: 'Запросить просмотр',
    uz: "Ko'rib chiqish so'rash"
  },
  'actions.chooseDate': {
    en: 'Choose a date',
    ru: 'Выберите дату',
    uz: 'Sanani tanlang'
  },
  'actions.pickDate': {
    en: 'Pick a date',
    ru: 'Выбрать дату',
    uz: 'Sanani tanlash'
  },
  'actions.chooseTime': {
    en: 'Choose an available time',
    ru: 'Выберите доступное время',
    uz: 'Mavjud vaqtni tanlang'
  },
  'actions.noTimesForDate': {
    en: 'No predefined times for this date',
    ru: 'Нет предустановленного времени для этой даты',
    uz: 'Bu sana uchun oldindan belgilangan vaqt yo\'q'
  },
  'actions.pickDateFirst': {
    en: 'Pick a date to see available times',
    ru: 'Выберите дату, чтобы увидеть доступное время',
    uz: 'Mavjud vaqtlarni ko\'rish uchun sanani tanlang'
  },
  'actions.requestOtherTime': {
    en: 'Request other time (requires 200,000 UZS deposit)',
    ru: 'Запросить другое время (требуется депозит 200,000 сум)',
    uz: 'Boshqa vaqt so\'rash (200,000 so\'m depozit talab qilinadi)'
  },
  'actions.requestOtherTimeButton': {
    en: 'Request other time',
    ru: 'Запросить другое время',
    uz: 'Boshqa vaqt so\'rash'
  },
  'actions.cancelOtherTime': {
    en: 'Cancel other time',
    ru: 'Отменить другое время',
    uz: 'Boshqa vaqtni bekor qilish'
  },
  'actions.pickPreferredTime': {
    en: 'Pick your preferred time',
    ru: 'Выберите удобное время',
    uz: 'Qulay vaqtni tanlang'
  },
  'actions.depositInfo': {
    en: 'A refundable 200,000 UZS deposit is required for custom times to show seriousness.',
    ru: 'Для выбора произвольного времени требуется возвратный депозит в размере 200,000 сум, чтобы показать серьезность намерений.',
    uz: 'Jiddiylikni ko\'rsatish uchun maxsus vaqt uchun 200,000 so\'mlik qaytariladigan depozit talab qilinadi.'
  },
  'actions.sendRequest': {
    en: 'Send Request',
    ru: 'Отправить запрос',
    uz: 'So\'rov yuborish'
  },
  'actions.sendRequestDeposit': {
    en: 'Send Request (200k deposit)',
    ru: 'Отправить запрос (депозит 200k)',
    uz: 'So\'rov yuborish (200k depozit)'
  },
  'actions.requestSent': {
    en: 'Request Sent ✓',
    ru: 'Запрос отправлен ✓',
    uz: 'So\'rov yuborildi ✓'
  },

  // Property edit - phone sharing
  'property.showPhoneLabel': {
    en: 'Display my phone number on this listing',
    ru: 'Показывать мой номер телефона в этом объявлении',
    uz: "Bu e'londa telefon raqamimni ko'rsatish"
  },
  'property.showPhoneDescription': {
    en: 'Allow buyers to see your phone number',
    ru: 'Разрешить покупателям видеть ваш номер телефона',
    uz: 'Xaridorlarga telefon raqamingizni ko\'rsatish'
  },
  'property.writeMessage': {
    en: 'Write a message...',
    ru: 'Напишите сообщение...',
    uz: 'Xabar yozing...'
  },
  'property.sendMessage': {
    en: 'Send Message',
    ru: 'Отправить сообщение',
    uz: 'Xabar yuborish'
  },
  'property.save': {
    en: 'Save',
    ru: 'Сохранить',
    uz: 'Saqlash'
  },
  'property.saved': {
    en: 'Saved',
    ru: 'Сохранено',
    uz: 'Saqlangan'
  },
  'property.removed': {
    en: 'Removed',
    ru: 'Удалено',
    uz: 'O\'chirildi'
  },
  'property.halalFinancing': {
    en: 'Halal Financing',
    ru: 'Рассрочка',
    uz: 'Bo\'lib to\'lash'
  },
  'property.removedFromSaved': {
    en: 'Property removed from saved',
    ru: 'Объект удален из сохраненных',
    uz: 'Mulk saqlanganlardan o\'chirildi'
  },
  'property.savedForLater': {
    en: 'Property saved for later',
    ru: 'Объект сохранен на потом',
    uz: 'Mulk keyinroq uchun saqlandi'
  },
  'property.locationHeading': {
    en: 'Location',
    ru: 'Местоположение',
    uz: 'Joylashuv'
  },
  
  // Units and measurements
  'property.sqm': {
    en: 'm²',
    ru: 'м²',
    uz: 'm²'
  },
  'property.sotka': {
    en: 'hundred m²',
    ru: 'соток',
    uz: 'sotix'
  },
  'property.location': {
    en: 'Location',
    ru: 'Местоположение',
    uz: 'Manzil'
  },
  'property.address': {
    en: 'Address',
    ru: 'Адрес',
    uz: 'Manzil'
  },
  'property.descriptionPlaceholder': {
    en: 'Describe your property...',
    ru: 'Опишите вашу недвижимость...',
    uz: 'Mulkingizni tasvirlab bering...'
  },
  'property.addressPlaceholder': {
    en: 'Enter property address',
    ru: 'Введите адрес недвижимости',
    uz: 'Mulk manzilini kiriting'
  },
  'property.description': {
    en: 'Description',
    ru: 'Описание',
    uz: 'Tavsif'
  },
  'property.browseAll': {
    en: 'Browse all available properties with advanced filtering',
    ru: 'Просмотр всей доступной недвижимости с расширенными фильтрами',
    uz: 'Barcha mavjud mulklarni kengaytirilgan filtrlash bilan ko\'rish'
  },
  'property.propertiesFound': {
    en: 'Properties Found',
    ru: 'Найдено объектов',
    uz: 'Topilgan mulklar'
  },
  'property.showing': {
    en: 'Showing',
    ru: 'Показано',
    uz: 'Ko\'rsatilmoqda'
  },
  'property.of': {
    en: 'of',
    ru: 'из',
    uz: 'dan'
  },
  'property.properties': {
    en: 'properties',
    ru: 'объектов',
    uz: 'mulklar'
  },
  'property.total': {
    en: 'total',
    ru: 'всего',
    uz: 'jami'
  },
  'property.loadingProperties': {
    en: 'Loading properties...',
    ru: 'Загрузка объектов...',
    uz: 'Mulklar yuklanmoqda...'
  },
  'property.noPropertiesFound': {
    en: 'No properties found matching your criteria.',
    ru: 'Не найдено объектов, соответствующих вашим критериям.',
    uz: 'Mezonlaringizga mos mulklar topilmadi.'
  },
  
  // Property management
  'property.manageProperty': {
    en: 'Manage Property',
    ru: 'Управление объявлением',
    uz: 'Mulkni boshqarish'
  },
  'property.editProperty': {
    en: 'Edit Property',
    ru: 'Редактировать',
    uz: 'Tahrirlash'
  },
  'property.deleteProperty': {
    en: 'Delete Property',
    ru: 'Удалить',
    uz: 'O\'chirish'
  },
  'property.deleteConfirm': {
    en: 'Are you sure you want to delete this property? This action cannot be undone.',
    ru: 'Вы уверены, что хотите удалить это объявление? Это действие нельзя отменить.',
    uz: 'Ushbu mulkni o\'chirmoqchimisiz? Bu harakatni bekor qilib bo\'lmaydi.'
  },
  'property.deleted': {
    en: 'Property deleted',
    ru: 'Объявление удалено',
    uz: 'Mulk o\'chirildi'
  },
  'property.deletedDescription': {
    en: 'Your property has been removed',
    ru: 'Ваше объявление было удалено',
    uz: 'Mulkingiz o\'chirildi'
  },
  
  // Halal financing status messages
  'property.halalFinancingActive': {
    en: 'Halal Financing Active',
    ru: 'Халяльное финансирование активно',
    uz: 'Halol moliyalashtirish faol'
  },
  'property.halalFinancingActiveDescription': {
    en: 'Your property is listed with halal financing option.',
    ru: 'Ваше объявление размещено с опцией халяльного финансирования.',
    uz: 'Mulkingiz halol moliyalashtirish varianti bilan joylashtirilgan.'
  },
  'property.halalPendingApproval': {
    en: 'Pending Admin Approval',
    ru: 'Ожидает одобрения администратора',
    uz: 'Administrator tasdig\'ini kutmoqda'
  },
  'property.halalPendingDescription': {
    en: 'Your halal financing request is being reviewed by administrators.',
    ru: 'Ваш запрос на халяльное финансирование проверяется администраторами.',
    uz: 'Halol moliyalashtirish so\'rovingiz administratorlar tomonidan ko\'rib chiqilmoqda.'
  },
  'property.halalApproved': {
    en: 'Halal Financing Approved',
    ru: 'Халяльное финансирование одобрено',
    uz: 'Halol moliyalashtirish tasdiqlandi'
  },
  'property.halalApprovedDescription': {
    en: 'You can enable halal financing for this property anytime.',
    ru: 'Вы можете включить халяльное финансирование для этого объявления в любое время.',
    uz: 'Siz ushbu mulk uchun halol moliyalashtirishni istalgan vaqtda yoqishingiz mumkin.'
  },
  
  // Filter labels
  'filter.bathrooms': {
    en: 'Bathrooms',
    ru: 'Ванные комнаты',
    uz: 'Hammomlar'
  },
  'common.error': {
    en: 'Error',
    ru: 'Ошибка',
    uz: 'Xatolik'
  },
  'common.cancel': {
    en: 'Cancel',
    ru: 'Отмена',
    uz: 'Bekor qilish'
  },
  'common.back': {
    en: 'Back',
    ru: 'Назад',
    uz: 'Orqaga'
  },

  // Financing Information Page
  'financing.pageTitle': {
    en: 'How Financing Works',
    ru: 'Как работает финансирование',
    uz: 'Moliyalashtirish qanday ishlaydi'
  },
  'financing.pageSubtitle': {
    en: 'Understand our transparent and flexible financing options for your dream home',
    ru: 'Узнайте о наших прозрачных и гибких вариантах финансирования для дома вашей мечты',
    uz: 'Orzuingizdagi uy uchun shaffof va moslashuvchan moliyalashtirish variantlarini tushuning'
  },
  'financing.shariaCompliant': {
    en: '✓ Sharia Compliant',
    ru: '✓ Соответствует шариату',
    uz: '✓ Shariatga mos'
  },
  'financing.transparentFinancing': {
    en: '✓ Transparent Financing',
    ru: '✓ Прозрачное финансирование',
    uz: '✓ Shaffof moliyalashtirish'
  },
  'financing.howItWorks': {
    en: 'How It Works',
    ru: 'Как это работает',
    uz: 'Bu qanday ishlaydi'
  },
  'financing.step1Title': {
    en: '1. Calculate Your Budget',
    ru: '1. Рассчитайте свой бюджет',
    uz: '1. Budjetingizni hisoblang'
  },
  'financing.step1Description': {
    en: 'Use our halal financing calculator to determine how much you can afford based on your available cash and preferred payment period.',
    ru: 'Используйте наш калькулятор халяльного финансирования, чтобы определить, сколько вы можете себе позволить, исходя из ваших наличных средств и предпочтительного периода платежей.',
    uz: 'Mavjud naqd pulingiz va afzal ko\'rgan to\'lov muddatingiz asosida qanchaga sig\'ishingizni aniqlash uchun halol moliyalashtirish kalkulyatorimizdan foydalaning.'
  },
  'financing.step2Title': {
    en: '2. Submit Your Application',
    ru: '2. Подайте заявку',
    uz: '2. Arizangizni yuboring'
  },
  'financing.step2Description': {
    en: 'Complete our simple application form with your financial information and upload required documents for verification.',
    ru: 'Заполните нашу простую форму заявки с вашей финансовой информацией и загрузите необходимые документы для проверки.',
    uz: 'Moliyaviy ma\'lumotlaringiz bilan oddiy ariza formasini to\'ldiring va tekshirish uchun kerakli hujjatlarni yuklang.'
  },
  'financing.step3Title': {
    en: '3. Get Approved & Move In',
    ru: '3. Получите одобрение и въезжайте',
    uz: '3. Tasdiqlang va ko\'chib boring'
  },
  'financing.step3Description': {
    en: 'Once approved, finalize your financing terms and begin making monthly payments while enjoying your new home.',
    ru: 'После одобрения завершите условия финансирования и начните вносить ежемесячные платежи, наслаждаясь своим новым домом.',
    uz: 'Tasdiqlangach, moliyalashtirish shartlarini yakunlang va yangi uyingizdan zavqlanganingizda oylik to\'lovlarni boshlang.'
  },
  'financing.featuresTitle': {
    en: 'Why Choose Our Financing',
    ru: 'Почему выбрать наше финансирование',
    uz: 'Nima uchun bizning moliyalashtirishimizni tanlash kerak'
  },
  'financing.noInterestTitle': {
    en: 'No Interest Rates',
    ru: 'Без процентных ставок',
    uz: 'Foizsiz'
  },
  'financing.noInterestDescription': {
    en: 'Our halal financing model eliminates traditional interest rates, making homeownership more accessible and Sharia-compliant.',
    ru: 'Наша модель халяльного финансирования исключает традиционные процентные ставки, делая владение жильем более доступным и соответствующим шариату.',
    uz: 'Bizning halol moliyalashtirish modelimiz an\'anaviy foiz stavkalarini yo\'q qiladi va uy egaliligini yanada qulayroq va shariatga mos qiladi.'
  },
  'financing.secureTitle': {
    en: 'Secure & Transparent',
    ru: 'Безопасно и прозрачно',
    uz: 'Xavfsiz va shaffof'
  },
  'financing.secureDescription': {
    en: 'All transactions are secured and transparent with clear breakdown of fees and payment schedules.',
    ru: 'Все транзакции защищены и прозрачны с четкой разбивкой комиссий и графиков платежей.',
    uz: 'Barcha tranzaktsiyalar xavfsiz va shaffof bo\'lib, to\'lovlar va to\'lov jadvallari aniq ko\'rsatilgan.'
  },
  'financing.flexibleTitle': {
    en: 'Flexible Terms',
    ru: 'Гибкие условия',
    uz: 'Moslashuvchan shartlar'
  },
  'financing.flexibleDescription': {
    en: 'Choose from multiple financing periods (6 months to 5 years) to fit your financial situation.',
    ru: 'Выберите из нескольких периодов финансирования (от 6 месяцев до 5 лет), чтобы соответствовать вашей финансовой ситуации.',
    uz: 'Moliyaviy holatingizniga mos keladigan bir nechta moliyalashtirish muddatlaridan (6 oydan 5 yilgacha) tanlang.'
  },
  'financing.supportTitle': {
    en: 'Expert Support',
    ru: 'Экспертная поддержка',
    uz: 'Mutaxassis yordami'
  },
  'financing.supportDescription': {
    en: 'Our team of financing experts is available to guide you through every step of the process.',
    ru: 'Наша команда экспертов по финансированию готова провести вас через каждый этап процесса.',
    uz: 'Bizning moliyalashtirish bo\'yicha mutaxassislar jamoamiz jarayonning har bir bosqichida sizga rahbarlik qilishga tayyor.'
  },
  'financing.termsTitle': {
    en: 'Eligibility & Requirements',
    ru: 'Требования и условия',
    uz: 'Huquq va talablar'
  },
  'financing.eligibilityTitle': {
    en: 'Eligibility Criteria',
    ru: 'Критерии соответствия',
    uz: 'Muvofiqlik mezonlari'
  },
  'financing.eligibility1': {
    en: 'Minimum 18 years old',
    ru: 'Минимум 18 лет',
    uz: 'Minimum 18 yoshda'
  },
  'financing.eligibility2': {
    en: 'Stable income for at least 6 months',
    ru: 'Стабильный доход минимум 6 месяцев',
    uz: 'Kamida 6 oy barqaror daromad'
  },
  'financing.eligibility3': {
    en: 'Valid Uzbekistan residency',
    ru: 'Действительное резидентство Узбекистана',
    uz: 'Yaroqli O\'zbekiston rezidentligi'
  },
  'financing.eligibility4': {
    en: 'Minimum 30% down payment',
    ru: 'Минимум 30% первоначальный взнос',
    uz: 'Minimum 30% dastlabki to\'lov'
  },
  'financing.documentsTitle': {
    en: 'Required Documents',
    ru: 'Необходимые документы',
    uz: 'Kerakli hujjatlar'
  },
  'financing.documents1': {
    en: 'Government-issued ID',
    ru: 'Государственное удостоверение личности',
    uz: 'Davlat tomonidan berilgan shaxsni tasdiqlovchi hujjat'
  },
  'financing.documents2': {
    en: 'Proof of income (last 6 months)',
    ru: 'Справка о доходах (последние 6 месяцев)',
    uz: 'Daromad to\'g\'risida ma\'lumotnoma (oxirgi 6 oy)'
  },
  'financing.documents3': {
    en: 'Bank statements',
    ru: 'Банковские выписки',
    uz: 'Bank hisobotlari'
  },
  'financing.documents4': {
    en: 'Employment verification',
    ru: 'Подтверждение трудоустройства',
    uz: 'Ish joyini tasdiqlash'
  },
  'financing.ctaTitle': {
    en: 'Ready to Get Started?',
    ru: 'Готовы начать?',
    uz: 'Boshlashga tayyormisiz?'
  },
  'financing.ctaDescription': {
    en: 'Use our financing calculator to see what you can afford and start your homeownership journey today.',
    ru: 'Используйте наш калькулятор финансирования, чтобы увидеть, что вы можете себе позволить, и начните свой путь к владению жильем сегодня.',
    uz: 'Qanchaga sig\'ishingizni ko\'rish uchun moliyalashtirish kalkulyatorimizdan foydalaning va bugun uy egasi bo\'lish sayohatingizni boshlang.'
  },
  'financing.startCalculating': {
    en: 'Start Calculating',
    ru: 'Начать расчет',
    uz: 'Hisoblashni boshlash'
  },

  // FAQ Page
  'faq.pageTitle': {
    en: 'Frequently Asked Questions',
    ru: 'Часто задаваемые вопросы',
    uz: 'Tez-tez beriladigan savollar'
  },
  'faq.pageSubtitle': {
    en: 'Find answers to common questions about our platform and services',
    ru: 'Найдите ответы на часто задаваемые вопросы о нашей платформе и услугах',
    uz: 'Platformamiz va xizmatlarimiz haqida tez-tez beriladigan savollarga javoblar toping'
  },
  'faq.helpCenter': {
    en: '✓ Help Center',
    ru: '✓ Центр помощи',
    uz: '✓ Yordam markazi'
  },
  'faq.searchPlaceholder': {
    en: 'Search for questions...',
    ru: 'Поиск вопросов...',
    uz: 'Savollarni qidirish...'
  },
  'faq.generalTitle': {
    en: 'General Questions',
    ru: 'Общие вопросы',
    uz: 'Umumiy savollar'
  },
  'faq.propertyTitle': {
    en: 'Property Listings',
    ru: 'Объявления о недвижимости',
    uz: 'Ko\'chmas mulk e\'lonlari'
  },
  'faq.financingTitle': {
    en: 'Financing & Payments',
    ru: 'Финансирование и платежи',
    uz: 'Moliyalashtirish va to\'lovlar'
  },
  'faq.visitsTitle': {
    en: 'Property Visits',
    ru: 'Просмотры недвижимости',
    uz: 'Mulkni ko\'rib chiqish'
  },
  'faq.whatIsMagit': {
    en: 'What is Magit?',
    ru: 'Что такое Magit?',
    uz: 'Magit nima?'
  },
  'faq.whatIsMagitAnswer': {
    en: 'Magit is a verified real estate marketplace in Tashkent that connects buyers with verified property owners. We offer transparent pricing and halal financing options to make homeownership accessible.',
    ru: 'Magit - это проверенная площадка недвижимости в Ташкенте, которая соединяет покупателей с проверенными владельцами недвижимости. Мы предлагаем прозрачные цены и халяльное финансирование для доступного владения жильем.',
    uz: 'Magit - Toshkentdagi tekshirilgan ko\'chmas mulk bozori bo\'lib, xaridorlarni tekshirilgan mulk egalari bilan bog\'laydi. Biz uy egaliligini qulay qilish uchun shaffof narxlar va halol moliyalashtirish imkoniyatlarini taklif qilamiz.'
  },
  'faq.howToCreateAccount': {
    en: 'How do I create an account?',
    ru: 'Как создать аккаунт?',
    uz: 'Qanday hisob yaratish mumkin?'
  },
  'faq.howToCreateAccountAnswer': {
    en: 'Click "Sign In" on the homepage, then choose "Sign Up" to create a new account. You can register using your email address or phone number. Verification is required for account security.',
    ru: 'Нажмите "Войти" на главной странице, затем выберите "Зарегистрироваться" для создания нового аккаунта. Вы можете зарегистрироваться, используя адрес электронной почты или номер телефона. Для безопасности аккаунта требуется верификация.',
    uz: 'Bosh sahifada "Kirish" tugmasini bosing, keyin yangi hisob yaratish uchun "Ro\'yxatdan o\'tish"ni tanlang. Elektron pochta manzili yoki telefon raqami orqali ro\'yxatdan o\'tishingiz mumkin. Hisob xavfsizligi uchun tasdiqlash talab qilinadi.'
  },
  'faq.isItFree': {
    en: 'Is Magit free to use?',
    ru: 'Бесплатно ли использовать Magit?',
    uz: 'Magitdan foydalanish bepulmi?'
  },
  'faq.isItFreeAnswer': {
    en: 'Yes, browsing properties and creating an account is completely free. You get one free property visit request per week. Additional visits cost 50,000 UZS each.',
    ru: 'Да, просмотр недвижимости и создание аккаунта полностью бесплатны. Вы получаете одну бесплатную заявку на просмотр недвижимости в неделю. Дополнительные посещения стоят 50,000 сум каждое.',
    uz: 'Ha, mulklarni ko\'rish va hisob yaratish mutlaqo bepul. Haftasiga bitta bepul mulkni ko\'rish so\'roviga egasiz. Qo\'shimcha tashriflar har biri 50,000 so\'m turadi.'
  },
  'faq.howToContactSupport': {
    en: 'How can I contact customer support?',
    ru: 'Как связаться с поддержкой клиентов?',
    uz: 'Mijozlarni qo\'llab-quvvatlash xizmati bilan qanday bog\'lanish mumkin?'
  },
  'faq.howToContactSupportAnswer': {
    en: 'You can reach our support team via phone at +998 (71) 123-45-67, email at support@magit.uz, or use the live chat feature available on our website.',
    ru: 'Вы можете связаться с нашей службой поддержки по телефону +998 (71) 123-45-67, по электронной почте support@magit.uz или использовать функцию онлайн-чата на нашем сайте.',
    uz: '+998 (71) 123-45-67 telefon raqami orqali, support@magit.uz elektron pochta manzili orqali yoki veb-saytimizda mavjud jonli chat funksiyasidan foydalanib qo\'llab-quvvatlash guruhimiz bilan bog\'lanishingiz mumkin.'
  },
  'faq.howToListProperty': {
    en: 'How do I list my property?',
    ru: 'Как разместить свою недвижимость?',
    uz: 'O\'z mulkimni qanday joylashtirish mumkin?'
  },
  'faq.howToListPropertyAnswer': {
    en: 'After creating an account, go to "List Property" in your dashboard. Fill out the property details, upload high-quality photos, and submit for verification. Approved listings appear within 24 hours.',
    ru: 'После создания аккаунта перейдите в "Разместить недвижимость" в вашей панели управления. Заполните детали недвижимости, загрузите качественные фотографии и отправьте на проверку. Одобренные объявления появляются в течение 24 часов.',
    uz: 'Hisob yaratgach, boshqaruv panelingizdagi "Mulkni joylashtirish" bo\'limiga o\'ting. Mulk tafsilotlarini to\'ldiring, sifatli rasmlar yuklang va tekshirish uchun yuboring. Tasdiqlangan e\'lonlar 24 soat ichida paydo bo\'ladi.'
  },
  'faq.propertyVerification': {
    en: 'How does property verification work?',
    ru: 'Как работает проверка недвижимости?',
    uz: 'Mulkni tekshirish qanday ishlaydi?'
  },
  'faq.propertyVerificationAnswer': {
    en: 'Our team verifies property ownership documents, checks property condition through photos/videos, and confirms location accuracy. This process typically takes 24-48 hours.',
    ru: 'Наша команда проверяет документы на право собственности, проверяет состояние недвижимости через фотографии/видео и подтверждает точность местоположения. Этот процесс обычно занимает 24-48 часов.',
    uz: 'Bizning jamoamiz mulk egaligi hujjatlarini tekshiradi, foto/video orqali mulk holatini tekshiradi va joylashuv aniqligini tasdiqlaydi. Bu jarayon odatda 24-48 soat davom etadi.'
  },
  'faq.editProperty': {
    en: 'Can I edit my property listing?',
    ru: 'Могу ли я редактировать свое объявление?',
    uz: 'O\'z e\'lonimni tahrirlashim mumkinmi?'
  },
  'faq.editPropertyAnswer': {
    en: 'Yes, you can edit your property details, update photos, and modify pricing through your dashboard. Changes require re-verification and may take 24 hours to appear.',
    ru: 'Да, вы можете редактировать детали недвижимости, обновлять фотографии и изменять цены через вашу панель управления. Изменения требуют повторной проверки и могут появиться в течение 24 часов.',
    uz: 'Ha, boshqaruv panelingiz orqali mulk tafsilotlarini tahrirlashingiz, rasmlarni yangilashingiz va narxlarni o\'zgartirishingiz mumkin. O\'zgarishlar qayta tekshirishni talab qiladi va 24 soat ichida paydo bo\'lishi mumkin.'
  },
  'faq.propertyPhotos': {
    en: 'What photo requirements are there?',
    ru: 'Какие требования к фотографиям?',
    uz: 'Rasmlar uchun qanday talablar bor?'
  },
  'faq.propertyPhotosAnswer': {
    en: 'Upload high-resolution photos (minimum 1080p) showing all rooms, exterior, and important features. Avoid filters and ensure good lighting. Minimum 5 photos, maximum 20 photos per listing.',
    ru: 'Загружайте фотографии высокого разрешения (минимум 1080p), показывающие все комнаты, экстерьер и важные особенности. Избегайте фильтров и обеспечьте хорошее освещение. Минимум 5 фотографий, максимум 20 фотографий на объявление.',
    uz: 'Barcha xonalar, tashqi ko\'rinish va muhim xususiyatlarni ko\'rsatuvchi yuqori aniqlikdagi rasmlarni (minimum 1080p) yuklang. Filtrlardan qoching va yaxshi yoritishni ta\'minlang. E\'lon uchun minimum 5 ta, maksimum 20 ta rasm.'
  },
  'faq.whatIsHalalFinancing': {
    en: 'What is halal financing?',
    ru: 'Что такое халяльное финансирование?',
    uz: 'Halol moliyalashtirish nima?'
  },
  'faq.whatIsHalalFinancingAnswer': {
    en: 'Halal financing is a Sharia-compliant payment system without traditional interest rates. Instead of interest, we use a profit-sharing model with transparent fees and no hidden charges.',
    ru: 'Халяльное финансирование - это система платежей, соответствующая шариату, без традиционных процентных ставок. Вместо процентов мы используем модель распределения прибыли с прозрачными комиссиями и без скрытых платежей.',
    uz: 'Halol moliyalashtirish - bu an\'anaviy foiz stavkalarsiz shariatga mos to\'lov tizimi. Foiz o\'rniga biz shaffof to\'lovlar va yashirin to\'lovsiz foyda taqsimlash modelidan foydalanamiz.'
  },
  'faq.minimumDownPayment': {
    en: 'What is the minimum down payment?',
    ru: 'Какой минимальный первоначальный взнос?',
    uz: 'Minimum dastlabki to\'lov qancha?'
  },
  'faq.minimumDownPaymentAnswer': {
    en: 'The minimum down payment is 30% of the property value. This ensures affordable monthly payments and reduces overall financing costs.',
    ru: 'Минимальный первоначальный взнос составляет 30% от стоимости недвижимости. Это обеспечивает доступные ежемесячные платежи и снижает общую стоимость финансирования.',
    uz: 'Minimum dastlabki to\'lov mulk qiymatining 30% ini tashkil qiladi. Bu qulay oylik to\'lovlarni ta\'minlaydi va umumiy moliyalashtirish xarajatlarini kamaytiradi.'
  },
  'faq.financingPeriods': {
    en: 'What financing periods are available?',
    ru: 'Какие периоды финансирования доступны?',
    uz: 'Qanday moliyalashtirish muddatlari mavjud?'
  },
  'faq.financingPeriodsAnswer': {
    en: 'We offer flexible financing periods from 6 months to 5 years. Longer periods mean lower monthly payments but higher total costs.',
    ru: 'Мы предлагаем гибкие периоды финансирования от 6 месяцев до 5 лет. Более длительные периоды означают более низкие ежемесячные платежи, но более высокие общие затраты.',
    uz: '6 oydan 5 yilgacha moslashuvchan moliyalashtirish muddatlarini taklif qilamiz. Uzunroq muddatlar pastroq oylik to\'lovlarni, lekin yuqoriroq umumiy xarajatlarni anglatadi.'
  },
  'faq.financingRequirements': {
    en: 'What are the financing requirements?',
    ru: 'Каковы требования для финансирования?',
    uz: 'Moliyalashtirish uchun qanday talablar bor?'
  },
  'faq.financingRequirementsAnswer': {
    en: 'You must be 18+, have stable income for 6+ months, valid Uzbekistan residency, and provide required documents including ID, income proof, and bank statements.',
    ru: 'Вы должны быть 18+, иметь стабильный доход более 6 месяцев, действительное резидентство Узбекистана и предоставить необходимые документы, включая удостоверение личности, справку о доходах и банковские выписки.',
    uz: '18+ yoshda bo\'lishingiz, 6+ oy davomida barqaror daromadga ega bo\'lishingiz, O\'zbekistonda yaroqli rezidentlikka ega bo\'lishingiz va ID, daromad to\'g\'risida ma\'lumotnoma va bank hisobotlari kabi kerakli hujjatlarni taqdim etishingiz kerak.'
  },
  'faq.howToScheduleVisit': {
    en: 'How do I schedule a property visit?',
    ru: 'Как запланировать просмотр недвижимости?',
    uz: 'Mulkni ko\'rishni qanday rejalashtirish mumkin?'
  },
  'faq.howToScheduleVisitAnswer': {
    en: 'Click "Schedule Visit" on any property listing, choose your preferred date and time, and submit your request. The property owner will confirm or suggest alternative times.',
    ru: 'Нажмите "Запланировать просмотр" на любом объявлении недвижимости, выберите предпочтительную дату и время и отправьте запрос. Владелец недвижимости подтвердит или предложит альтернативное время.',
    uz: 'Istalgan mulk e\'lonida "Tashrifni rejalashtirish" tugmasini bosing, afzal ko\'rgan sana va vaqtni tanlang va so\'rovingizni yuboring. Mulk egasi tasdiqlaydi yoki muqobil vaqtlarni taklif qiladi.'
  },
  'faq.visitCost': {
    en: 'How much do property visits cost?',
    ru: 'Сколько стоят просмотры недвижимости?',
    uz: 'Mulkni ko\'rish qancha turadi?'
  },
  'faq.visitCostAnswer': {
    en: 'You get one free property visit per week. Additional visits cost 50,000 UZS each. Payment is required before scheduling additional visits.',
    ru: 'Вы получаете один бесплатный просмотр недвижимости в неделю. Дополнительные посещения стоят 50,000 сум каждое. Оплата требуется перед планированием дополнительных посещений.',
    uz: 'Haftasiga bitta bepul mulkni ko\'rishga egasiz. Qo\'shimcha tashriflar har biri 50,000 so\'m turadi. Qo\'shimcha tashriflarni rejalashtirish uchun to\'lov talab qilinadi.'
  },
  'faq.cancelVisit': {
    en: 'Can I cancel or reschedule a visit?',
    ru: 'Могу ли я отменить или перенести просмотр?',
    uz: 'Tashrifni bekor qilish yoki boshqa vaqtga o\'tkazish mumkinmi?'
  },
  'faq.cancelVisitAnswer': {
    en: 'Yes, you can cancel or reschedule visits up to 2 hours before the scheduled time. Cancellations within 2 hours may not be refunded.',
    ru: 'Да, вы можете отменить или перенести посещения за 2 часа до запланированного времени. Отмены в течение 2 часов могут не возмещаться.',
    uz: 'Ha, rejalashtirilgan vaqtdan 2 soat oldin tashriflarni bekor qilish yoki boshqa vaqtga o\'tkazish mumkin. 2 soat ichida bekor qilish to\'lovi qaytarilmasligi mumkin.'
  },
  'faq.visitPreparation': {
    en: 'How should I prepare for a property visit?',
    ru: 'Как подготовиться к просмотру недвижимости?',
    uz: 'Mulkni ko\'rishga qanday tayyorgarlik ko\'rish kerak?'
  },
  'faq.visitPreparationAnswer': {
    en: 'Bring a valid ID, prepare questions about the property, neighborhood, and utilities. Consider bringing a checklist of important features you want to verify.',
    ru: 'Принесите действительное удостоверение личности, подготовьте вопросы о недвижимости, районе и коммунальных услугах. Рассмотрите возможность принести контрольный список важных особенностей, которые вы хотите проверить.',
    uz: 'Yaroqli shaxsni tasdiqlovchi hujjat olib keling, mulk, mahalla va kommunal xizmatlar haqida savollar tayyorlang. Tekshirishni istagan muhim xususiyatlar ro\'yxatini olib kelishni o\'ylab ko\'ring.'
  },
  'faq.stillHaveQuestions': {
    en: 'Still have questions?',
    ru: 'Остались вопросы?',
    uz: 'Hali ham savollaringiz bormi?'
  },
  'faq.contactUsDescription': {
    en: 'Our support team is here to help you with any questions or concerns.',
    ru: 'Наша команда поддержки готова помочь вам с любыми вопросами или проблемами.',
    uz: 'Qo\'llab-quvvatlash guruhimiz har qanday savol yoki muammolar bilan sizga yordam berishga tayyor.'
  },
  'faq.callUs': {
    en: 'Call Us',
    ru: 'Позвоните нам',
    uz: 'Bizga qo\'ng\'iroq qiling'
  },
  'faq.callDescription': {
    en: 'Speak directly with our support team',
    ru: 'Говорите напрямую с нашей командой поддержки',
    uz: 'Qo\'llab-quvvatlash guruhimiz bilan bevosita gaplashing'
  },
  'faq.emailUs': {
    en: 'Email Us',
    ru: 'Напишите нам',
    uz: 'Bizga email yuboring'
  },
  'faq.emailDescription': {
    en: 'Send us a detailed message',
    ru: 'Отправьте нам подробное сообщение',
    uz: 'Bizga batafsil xabar yuboring'
  },
  'faq.liveChat': {
    en: 'Live Chat',
    ru: 'Онлайн-чат',
    uz: 'Jonli chat'
  },
  'faq.liveChatDescription': {
    en: 'Get instant help online',
    ru: 'Получите мгновенную помощь онлайн',
    uz: 'Onlayn tezkor yordam oling'
  },
  'faq.startChat': {
    en: 'Start Chat',
    ru: 'Начать чат',
    uz: 'Chatni boshlash'
  },
  'common.delete': {
    en: 'Delete',
    ru: 'Удалить',
    uz: 'O\'chirish'
  },
  'common.signedOut': {
    en: 'Signed out successfully',
    ru: 'Вышли успешно',
    uz: 'Muvaffaqiyatli chiqildi'
  },
  'common.loggedOut': {
    en: 'You have been logged out.',
    ru: 'Вы вышли из системы.',
    uz: 'Tizimdan chiqtingiz.'
  },

  // ListProperty page
  'listProperty.title': {
    en: 'List Property',
    ru: 'Добавить объект',
    uz: 'Mulk qo\'shish'
  },
  'listProperty.propertyInformation': {
    en: 'Property Information',
    ru: 'Информация об объекте',
    uz: 'Mulk ma\'lumotlari'
  },
  'listProperty.contactInformation': {
    en: 'Contact Information',
    ru: 'Контактная информация',
    uz: 'Aloqa ma\'lumotlari'
  },
  'listProperty.propertyName': {
    en: 'Property Name',
    ru: 'Название объекта',
    uz: 'Mulk nomi'
  },
  'listProperty.propertyType': {
    en: 'Property Type',
    ru: 'Тип объекта',
    uz: 'Mulk turi'
  },
  'listProperty.propertyAddress': {
    en: 'Property Address',
    ru: 'Адрес объекта',
    uz: 'Mulk manzili'
  },
  'listProperty.district': {
    en: 'District',
    ru: 'Район',
    uz: 'Tuman'
  },
  'listProperty.price': {
    en: 'Price (USD)',
    ru: 'Цена (USD)',
    uz: 'Narx (USD)'
  },
  'listProperty.area': {
    en: 'Area (m²)',
    ru: 'Площадь (м²)',
    uz: 'Maydon (m²)'
  },
  'listProperty.livingArea': {
    en: 'Living Area (m²)',
    ru: 'Жилая площадь (м²)',
    uz: 'Yashash maydoni (m²)'
  },
  'listProperty.landArea': {
    en: 'Land Area (соток)',
    ru: 'Площадь участка (соток)',
    uz: 'Yer maydoni (sotix)'
  },
  'listProperty.bedrooms': {
    en: 'Bedrooms',
    ru: 'Спальни',
    uz: 'Yotoq xonalar'
  },
  'listProperty.bathrooms': {
    en: 'Bathrooms',
    ru: 'Ванные комнаты',
    uz: 'Hammom xonalar'
  },
  'listProperty.description': {
    en: 'Description',
    ru: 'Описание',
    uz: 'Tavsif'
  },
  'listProperty.selectLocation': {
    en: 'Select Location',
    ru: 'Выберите местоположение',
    uz: 'Joylashuvni tanlang'
  },
  'listProperty.photosDocuments': {
    en: 'Photos & Documents',
    ru: 'Фотографии и документы',
    uz: 'Rasmlar va hujjatlar'
  },
  'listProperty.uploadPhotos': {
    en: 'Upload Photos',
    ru: 'Загрузить фотографии',
    uz: 'Rasmlarni yuklash'
  },
  'listProperty.minPhotos': {
    en: 'Minimum 5 photos required',
    ru: 'Минимум 5 фотографий',
    uz: 'Kamida 5 ta rasm kerak'
  },
  'listProperty.visitHours': {
    en: 'Visit Hours',
    ru: 'Часы посещения',
    uz: 'Tashrif vaqtlari'
  },
  'listProperty.additionalServices': {
    en: 'Additional Services',
    ru: 'Дополнительные услуги',
    uz: 'Qo\'shimcha xizmatlar'
  },
  'listProperty.virtualTour': {
    en: 'Virtual Tour',
    ru: 'Виртуальный тур',
    uz: 'Virtual tur'
  },
  'listProperty.halalFinancing': {
    en: 'Halal Financing',
    ru: 'Халяльное финансирование',
    uz: 'Halol moliyalashtirish'
  },
  'listProperty.payment': {
    en: 'Payment',
    ru: 'Оплата',
    uz: 'To\'lov'
  },
  'listProperty.review': {
    en: 'Review & Submit',
    ru: 'Проверка и подача',
    uz: 'Ko\'rib chiqish va yuborish'
  },
  'listProperty.submit': {
    en: 'Submit Application',
    ru: 'Подать заявку',
    uz: 'Ariza yuborish'
  },
  'listProperty.next': {
    en: 'Next',
    ru: 'Далее',
    uz: 'Keyingi'
  },
  'listProperty.previous': {
    en: 'Previous',
    ru: 'Назад',
    uz: 'Oldingi'
  },
  'listProperty.saveDraft': {
    en: 'Save Draft',
    ru: 'Сохранить черновик',
    uz: 'Qoralamani saqlash'
  },
  'listProperty.clearDraft': {
    en: 'Clear Draft',
    ru: 'Очистить черновик',
    uz: 'Qoralamani tozalash'
  },
  'listProperty.selectPropertyType': {
    en: 'Select property type',
    ru: 'Выберите тип объекта',
    uz: 'Mulk turini tanlang'
  },
  'listProperty.apartment': {
    en: 'Apartment',
    ru: 'Квартира',
    uz: 'Kvartira'
  },
  'listProperty.house': {
    en: 'House',
    ru: 'Дом',
    uz: 'Uy'
  },
  'listProperty.studio': {
    en: 'Studio',
    ru: 'Студия',
    uz: 'Studiya'
  },
  'listProperty.commercial': {
    en: 'Commercial',
    ru: 'Коммерческая',
    uz: 'Tijorat'
  },
  'listProperty.land': {
    en: 'Land',
    ru: 'Участок',
    uz: 'Yer'
  },
  'listProperty.halalFinancingNotAvailable': {
    en: 'Halal financing is not currently available for this property type',
    ru: 'Халяль финансирование пока недоступно для этого типа недвижимости',
    uz: 'Halol moliyalashtirish hozircha ushbu mulk turi uchun mavjud emas'
  },
  'listProperty.addressPlaceholder': {
    en: 'Enter full address in Tashkent',
    ru: 'Введите полный адрес в Ташкенте',
    uz: 'Toshkentda to\'liq manzilni kiriting'
  },
  'listProperty.selectDistrict': {
    en: 'Select or type district',
    ru: 'Выберите или введите район',
    uz: 'Tumanni tanlang yoki yozing'
  },
  'listProperty.other': {
    en: 'Other',
    ru: 'Другой',
    uz: 'Boshqa'
  },
  'listProperty.selectBedrooms': {
    en: 'Select bedrooms',
    ru: 'Выберите спальни',
    uz: 'Yotoq xonalarni tanlang'
  },
  'listProperty.bedroom': {
    en: 'bedroom',
    ru: 'спальня',
    uz: 'yotoq xona'
  },
  'listProperty.bedroomsPlural': {
    en: 'bedrooms',
    ru: 'спален',
    uz: 'yotoq xonalar'
  },
  'listProperty.otherCustom': {
    en: 'Other (enter custom number)',
    ru: 'Другое (введите число)',
    uz: 'Boshqa (raqam kiriting)'
  },
  'listProperty.enterBedrooms': {
    en: 'Enter number of bedrooms',
    ru: 'Введите количество спален',
    uz: 'Yotoq xonalar sonini kiriting'
  },
  'listProperty.selectBathrooms': {
    en: 'Select bathrooms',
    ru: 'Выберите ванные',
    uz: 'Hammom xonalarni tanlang'
  },
  'listProperty.bathroom': {
    en: 'bathroom',
    ru: 'ванная',
    uz: 'hammom xona'
  },
  'listProperty.bathroomsPlural': {
    en: 'bathrooms',
    ru: 'ванных',
    uz: 'hammom xonalar'
  },
  'listProperty.enterBathrooms': {
    en: 'Enter number of bathrooms',
    ru: 'Введите количество ванных',
    uz: 'Hammom xonalar sonini kiriting'
  },
  'listProperty.propertyDescription': {
    en: 'Property Description',
    ru: 'Описание объекта',
    uz: 'Mulk tavsifi'
  },
  'listProperty.descriptionPlaceholder': {
    en: 'Describe your property\'s features, condition, and highlights...',
    ru: 'Опишите особенности, состояние и преимущества вашего объекта...',
    uz: 'Mulkingizning xususiyatlari, ahvoli va afzalliklarini tasvirlang...'
  },
  'listProperty.comfortableVisitHours': {
    en: 'Comfortable Visit Hours',
    ru: 'Удобные часы для просмотра',
    uz: 'Qulay ko\'rish vaqtlari'
  },
  'listProperty.visitHoursDescription': {
    en: 'Select time slots when you\'re comfortable showing your property to potential buyers',
    ru: 'Выберите время, когда вам удобно показывать объект потенциальным покупателям',
    uz: 'Potensial xaridorlarga mulkingizni ko\'rsatishga qulay vaqtingizni tanlang'
  },
  'listProperty.selectTimeSlot': {
    en: 'Please select at least one time slot for property visits',
    ru: 'Пожалуйста, выберите хотя бы один временной слот для просмотра',
    uz: 'Iltimos, mulkni ko\'rish uchun kamida bitta vaqt oralig\'ini tanlang'
  },
  'listProperty.propertyPhotos': {
    en: 'Property Photos',
    ru: 'Фотографии объекта',
    uz: 'Mulk rasmlari'
  },
  'listProperty.uploadPropertyPhotos': {
    en: 'Upload Property Photos',
    ru: 'Загрузить фотографии объекта',
    uz: 'Mulk rasmlarini yuklash'
  },
  'listProperty.uploadDescription': {
    en: 'Upload at least 5 high-quality photos of your property',
    ru: 'Загрузите не менее 5 качественных фотографий вашего объекта',
    uz: 'Mulkingizning kamida 5 ta sifatli rasmini yuklang'
  },
  'listProperty.choosePhotos': {
    en: 'Choose Photos',
    ru: 'Выбрать фотографии',
    uz: 'Rasmlarni tanlash'
  },
  'listProperty.selectedPhotos': {
    en: 'Selected: {count}/20 (minimum 5 required)',
    ru: 'Выбрано: {count}/20 (минимум 5 требуется)',
    uz: 'Tanlangan: {count}/20 (kamida 5 ta kerak)'
  },
  'listProperty.uploadMorePhotos': {
    en: 'Upload at least {count} more photo(s) to continue',
    ru: 'Загрузите ещё {count} фото для продолжения',
    uz: 'Davom etish uchun yana {count} ta rasm yuklang'
  },
  'listProperty.propertyPhoto': {
    en: 'Property photo {number}',
    ru: 'Фото объекта {number}',
    uz: 'Mulk rasmi {number}'
  },
  'halal.magitFee': {
    en: 'Magit Marketplace Fee (1%)',
    ru: 'Комиссия Magit (1%)',
    uz: 'Magit bozor to\'lovi (1%)'
  },
  'halal.magitFeeExplanation': {
    en: '💡 The 1% Magit marketplace fee is charged to the seller when property is sold with financing, helping us maintain and verify the platform.',
    ru: '💡 Комиссия Magit в размере 1% взимается с продавца при продаже недвижимости с финансированием, что помогает нам поддерживать и проверять платформу.',
    uz: '💡 1% Magit bozor to\'lovi sotuvchidan mulk moliyalashtirish bilan sotilganda olinadi, bu bizga platformani saqlash va tekshirishga yordam beradi.'
  },
  'listProperty.paymentFees': {
    en: 'Payment & Fees',
    ru: 'Оплата и сборы',
    uz: 'To\'lov va yig\'imlar'
  },
  'listProperty.listingFees': {
    en: 'Listing Fees',
    ru: 'Сборы за размещение',
    uz: 'Joylashtirish yig\'imlari'
  },
  'listProperty.basicListing': {
    en: 'Basic Listing:',
    ru: 'Базовое размещение:',
    uz: 'Asosiy joylashtirish:'
  },
  'listProperty.free': {
    en: 'FREE',
    ru: 'БЕСПЛАТНО',
    uz: 'BEPUL'
  },
  'listProperty.professionalVirtualTour': {
    en: 'Professional Virtual Tour:',
    ru: 'Профессиональный виртуальный тур:',
    uz: 'Professional virtual tur:'
  },
  'listProperty.total': {
    en: 'Total:',
    ru: 'Итого:',
    uz: 'Jami:'
  },
  'listProperty.reviewSubmit': {
    en: 'Review & Submit',
    ru: 'Проверка и отправка',
    uz: 'Ko\'rib chiqish va yuborish'
  },
  'listProperty.applicationSummary': {
    en: 'Application Summary',
    ru: 'Сводка заявки',
    uz: 'Ariza xulosasi'
  },
  'listProperty.propertyTypeLabel': {
    en: 'Property Type:',
    ru: 'Тип объекта:',
    uz: 'Mulk turi:'
  },
  'listProperty.addressLabel': {
    en: 'Address:',
    ru: 'Адрес:',
    uz: 'Manzil:'
  },
  'listProperty.priceLabel': {
    en: 'Price:',
    ru: 'Цена:',
    uz: 'Narx:'
  },
  'listProperty.location': {
    en: 'Location:',
    ru: 'Местоположение:',
    uz: 'Joylashuv:'
  },
  'listProperty.coordinatesSet': {
    en: 'Coordinates set ✓',
    ru: 'Координаты установлены ✓',
    uz: 'Koordinatalar o\'rnatildi ✓'
  },
  'listProperty.halalFinancingLabel': {
    en: 'Halal Financing:',
    ru: 'Халяльное финансирование:',
    uz: 'Halol moliyalashtirish:'
  },
  'listProperty.requested': {
    en: 'Requested ✓',
    ru: 'Запрошено ✓',
    uz: 'So\'ralgan ✓'
  },
  'listProperty.notSpecified': {
    en: 'Not specified',
    ru: 'Не указано',
    uz: 'Ko\'rsatilmagan'
  },
  'listProperty.whatHappensNext': {
    en: 'What happens next?',
    ru: 'Что будет дальше?',
    uz: 'Keyin nima bo\'ladi?'
  },
  'listProperty.documentReview': {
    en: '• Document review within 24-48 hours',
    ru: '• Проверка документов в течение 24-48 часов',
    uz: '• Hujjatlar 24-48 soat ichida ko\'rib chiqiladi'
  },
  'listProperty.fieldAgentVisit': {
    en: '• Field agent visit scheduled',
    ru: '• Назначен визит полевого агента',
    uz: '• Dala agenti tashrifi belgilandi'
  },
  'listProperty.propertyVerification': {
    en: '• Property verification and photos',
    ru: '• Проверка объекта и фотографии',
    uz: '• Mulk tekshiruvi va rasmlar'
  },
  'listProperty.listingGoesLive': {
    en: '• Listing goes live with verified badge',
    ru: '• Объявление публикуется с подтверждённым значком',
    uz: '• E\'lon tasdiqlangan nishon bilan jonli efirga chiqadi'
  },
  'listProperty.applicationUnderReview': {
    en: 'Application Under Review',
    ru: 'Заявка на рассмотрении',
    uz: 'Ariza ko\'rib chiqilmoqda'
  },
  'listProperty.reviewNotification': {
    en: 'Your property listing application has been sent to our moderation team. You\'ll receive an email notification once it\'s reviewed (typically within 24-48 hours).',
    ru: 'Ваша заявка на размещение объекта отправлена команде модерации. Вы получите уведомление по электронной почте после проверки (обычно в течение 24-48 часов).',
    uz: 'Mulkingizni joylashtirish bo\'yicha arizangiz moderatsiya jamoasiga yuborildi. Ko\'rib chiqilgandan so\'ng elektron pochta orqali xabar olasiz (odatda 24-48 soat ichida).'
  },
  'listProperty.saved': {
    en: 'Saved {time}',
    ru: 'Сохранено {time}',
    uz: 'Saqlandi {time}'
  },
  'listProperty.backToHome': {
    en: 'Back to Home',
    ru: 'На главную',
    uz: 'Bosh sahifaga'
  },
  'listProperty.sellerPortal': {
    en: 'Seller Portal',
    ru: 'Портал продавца',
    uz: 'Sotuvchi portali'
  },
  'listProperty.listYourProperty': {
    en: 'List Your Property on Magit',
    ru: 'Разместите свой объект на Magit',
    uz: 'Mulkingizni Magit\'da joylashtiring'
  },
  'listProperty.marketplaceDescription': {
    en: 'Join our verified marketplace and reach serious buyers with transparent, Halal-compliant financing options.',
    ru: 'Присоединяйтесь к нашей проверенной площадке и находите серьёзных покупателей с прозрачными, халяльными вариантами финансирования.',
    uz: 'Bizning tasdiqlangan bozorimizga qo\'shiling va shaffof, halol moliyalashtirish variantlari bilan jiddiy xaridorlarni toping.'
  },
  'listProperty.stepProgress': {
    en: 'Step {current} of {total}',
    ru: 'Шаг {current} из {total}',
    uz: '{current}-qadam {total}dan'
  },
  'listProperty.percentComplete': {
    en: '{percent}% Complete',
    ru: '{percent}% завершено',
    uz: '{percent}% tugallandi'
  },
  'listProperty.nextStep': {
    en: 'Next Step',
    ru: 'Следующий шаг',
    uz: 'Keyingi qadam'
  },
  'listProperty.submitting': {
    en: 'Submitting...',
    ru: 'Отправка...',
    uz: 'Yuborilmoqda...'
  },
  'listProperty.applicationSubmitted': {
    en: 'Application Submitted',
    ru: 'Заявка отправлена',
    uz: 'Ariza yuborildi'
  },
  'listProperty.completeApplication': {
    en: 'Complete Application',
    ru: 'Завершить заявку',
    uz: 'Arizani tugatish'
  },
  'listProperty.whyListWithMagit': {
    en: 'Why List with Magit?',
    ru: 'Почему стоит размещать на Magit?',
    uz: 'Nega Magit\'da joylashtirish kerak?'
  },
  'listProperty.verifiedBuyersOnly': {
    en: 'Verified Buyers Only',
    ru: 'Только проверенные покупатели',
    uz: 'Faqat tasdiqlangan xaridorlar'
  },
  'listProperty.verifiedBuyersDescription': {
    en: 'All buyers are pre-screened with verified financing and serious intent.',
    ru: 'Все покупатели предварительно проверены с подтверждённым финансированием и серьёзными намерениями.',
    uz: 'Barcha xaridorlar oldindan tekshirilgan, tasdiqlangan moliyalashtirish va jiddiy niyat bilan.'
  },
  'listProperty.zeroCommission': {
    en: 'Zero Commission',
    ru: 'Без комиссии',
    uz: 'Komissiyasiz'
  },
  'listProperty.zeroCommissionDescription': {
    en: 'List your property for free. No hidden fees or commission charges.* (*For properties with Halal financing, Magit charges a 1% marketplace fee from the seller.)',
    ru: 'Размещайте объект бесплатно. Никаких скрытых платежей или комиссий.* (*Для объектов с халяльным финансированием Magit взимает 1% комиссию с продавца.)',
    uz: 'Mulkingizni bepul joylashtiring. Yashirin to\'lovlar yoki komissiya yo\'q.* (*Halol moliyalashtirish bilan mulklar uchun Magit sotuvchidan 1% bozor to\'lovini oladi.)'
  },
  'listProperty.premiumExposure': {
    en: 'Premium Exposure',
    ru: 'Премиальная экспозиция',
    uz: 'Premium namoyish'
  },
  'listProperty.premiumExposureDescription': {
    en: 'Featured on our AI-powered platform with smart buyer matching.',
    ru: 'Представлено на нашей платформе с ИИ и умным подбором покупателей.',
    uz: 'AI bilan ishlaydigan platformamizda aqlli xaridor moslashtirish bilan namoyish etiladi.'
  },

  // Additional ListProperty translations for remaining sections
  'listProperty.selectedPhotosText': {
    en: 'Selected: {count}/20 (minimum 5 required)',
    ru: 'Выбрано: {count}/20 (минимум 5 требуется)',
    uz: 'Tanlangan: {count}/20 (kamida 5 ta kerak)'
  },
  'listProperty.uploadMoreText': {
    en: 'Upload at least {count} more photo(s) to continue',
    ru: 'Загрузите ещё {count} фото для продолжения',
    uz: 'Davom etish uchun yana {count} ta rasm yuklang'
  },
  'listProperty.remove': {
    en: 'Remove',
    ru: 'Удалить',
    uz: 'Olib tashlash'
  },
  'listProperty.photoGuidelines': {
    en: 'Photo Guidelines',
    ru: 'Рекомендации по фото',
    uz: 'Rasm bo\'yicha tavsiyalar'
  },
  'listProperty.includeExteriorInterior': {
    en: '• Include exterior and interior shots',
    ru: '• Включите внешние и внутренние снимки',
    uz: '• Tashqi va ichki rasmlarni kiriting'
  },
  'listProperty.showAllRooms': {
    en: '• Show all rooms and key features',
    ru: '• Покажите все комнаты и ключевые особенности',
    uz: '• Barcha xonalar va asosiy xususiyatlarni ko\'rsating'
  },
  'listProperty.useGoodLighting': {
    en: '• Use good lighting and clean spaces',
    ru: '• Используйте хорошее освещение и чистые помещения',
    uz: '• Yaxshi yorug\'lik va toza joylardan foydalaning'
  },
  'listProperty.photoLimits': {
    en: '• Maximum 20 photos, minimum 5',
    ru: '• Максимум 20 фото, минимум 5',
    uz: '• Maksimum 20 ta rasm, minimum 5 ta'
  },

  // MyRequests page
  'myRequests.title': {
    en: 'My Visit Requests',
    ru: 'Мои запросы на просмотр',
    uz: 'Mening ko\'rish so\'rovlarim'
  },
  'myRequests.noRequests': {
    en: 'No visit requests yet',
    ru: 'Пока нет запросов на просмотр',
    uz: 'Hali ko\'rish so\'rovlari yo\'q'
  },
  'myRequests.noRequestsDesc': {
    en: 'You haven\'t requested any property visits yet. Browse properties to start viewing!',
    ru: 'Вы ещё не запрашивали просмотр недвижимости. Просматривайте объекты, чтобы начать!',
    uz: 'Siz hali hech qanday mulk ko\'rishini so\'ramagansiz. Ko\'rishni boshlash uchun mulklarni ko\'rib chiqing!'
  },
  'myRequests.tabs.active': {
    en: 'Active',
    ru: 'Активные',
    uz: 'Faol'
  },
  'myRequests.tabs.denied': {
    en: 'Denied',
    ru: 'Отклонённые',
    uz: 'Rad etilgan'
  },
  'myRequests.tabs.finished': {
    en: 'Finished',
    ru: 'Завершённые',
    uz: 'Tugallangan'
  },
  'myRequests.noActiveRequests': {
    en: 'No active requests',
    ru: 'Нет активных запросов',
    uz: 'Faol so\'rovlar yo\'q'
  },
  'myRequests.noActiveDesc': {
    en: 'All your active visit requests will appear here.',
    ru: 'Все ваши активные запросы на просмотр появятся здесь.',
    uz: 'Barcha faol ko\'rish so\'rovlaringiz shu yerda ko\'rinadi.'
  },
  'myRequests.noDeniedRequests': {
    en: 'No denied requests',
    ru: 'Нет отклонённых запросов',
    uz: 'Rad etilgan so\'rovlar yo\'q'
  },
  'myRequests.noDeniedDesc': {
    en: 'Any denied visit requests will appear here.',
    ru: 'Все отклонённые запросы на просмотр появятся здесь.',
    uz: 'Barcha rad etilgan ko\'rish so\'rovlari shu yerda ko\'rinadi.'
  },
  'myRequests.noFinishedVisits': {
    en: 'No finished visits',
    ru: 'Нет завершённых посещений',
    uz: 'Tugallangan tashriflar yo\'q'
  },
  'myRequests.noFinishedDesc': {
    en: 'Your completed property visits will appear here.',
    ru: 'Ваши завершённые просмотры недвижимости появятся здесь.',
    uz: 'Tugallangan mulk ko\'rishlaringiz shu yerda ko\'rinadi.'
  },
  'myRequests.messageOwner': {
    en: 'Message Owner',
    ru: 'Сообщение владельцу',
    uz: 'Egaga xabar'
  },
  'myRequests.finished': {
    en: 'finished',
    ru: 'завершено',
    uz: 'tugallandi'
  },
  'myRequests.confirmed': {
    en: 'confirmed',
    ru: 'подтверждено',
    uz: 'tasdiqlangan'
  },
  'myRequests.denied': {
    en: 'denied',
    ru: 'отклонено',
    uz: 'rad etilgan'
  },
  'myRequests.awaitingResponse': {
    en: 'awaiting response',
    ru: 'ожидается ответ',
    uz: 'javob kutilmoqda'
  },
  'myRequests.pending': {
    en: 'pending',
    ru: 'ожидается',
    uz: 'kutilmoqda'
  },
  'myRequests.cancelVisit': {
    en: 'Cancel visit',
    ru: 'Отменить посещение',
    uz: 'Tashrifni bekor qilish'
  },
  'myRequests.goToProperty': {
    en: 'Go to property profile',
    ru: 'Перейти к профилю недвижимости',
    uz: 'Mulk profiliga o\'tish'
  },
  'myRequests.property': {
    en: 'Property',
    ru: 'Недвижимость',
    uz: 'Mulk'
  },
  'myRequests.locationNotAvailable': {
    en: 'Location not available',
    ru: 'Местоположение недоступно',
    uz: 'Joylashuv mavjud emas'
  },
  'myRequests.alternativeTime': {
    en: 'Alternative time',
    ru: 'Альтернативное время',
    uz: 'Muqobil vaqt'
  },
  'myRequests.note': {
    en: 'Note',
    ru: 'Примечание',
    uz: 'Eslatma'
  },
  'myRequests.paidVisit': {
    en: 'Paid Visit',
    ru: 'Платное посещение',
    uz: 'Pullik tashrif'
  },
  'myRequests.ownerReview': {
    en: 'Owner\'s Review',
    ru: 'Отзыв владельца',
    uz: 'Eganing sharhi'
  },
  'myRequests.message': {
    en: 'Message',
    ru: 'Сообщение',
    uz: 'Xabar'
  },
  'myRequests.typeMessage': {
    en: 'Type your message to the property owner...',
    ru: 'Введите сообщение владельцу недвижимости...',
    uz: 'Mulk egasiga xabaringizni yozing...'
  },
  'myRequests.cancel': {
    en: 'Cancel',
    ru: 'Отмена',
    uz: 'Bekor qilish'
  },
  'myRequests.send': {
    en: 'Send',
    ru: 'Отправить',
    uz: 'Yuborish'
  },
  'myRequests.loadingRequests': {
    en: 'Loading your requests...',
    ru: 'Загрузка ваших запросов...',
    uz: 'So\'rovlaringiz yuklanmoqda...'
  },
  'myRequests.penaltyApplied': {
    en: 'Penalty applied',
    ru: 'Штраф применён',
    uz: 'Jarima qo\'llanildi'
  },
  'myRequests.error': {
    en: 'Error',
    ru: 'Ошибка',
    uz: 'Xato'
  },
  'myRequests.couldNotCancel': {
    en: 'Could not cancel visit request',
    ru: 'Не удалось отменить заявку на посещение',
    uz: 'Tashrif so\'rovini bekor qilib bo\'lmadi'
  },
  'myRequests.visitCancelled': {
    en: 'Visit cancelled',
    ru: 'Посещение отменено',
    uz: 'Tashrif bekor qilindi'
  },
  'myRequests.requestCancelled': {
    en: 'Your visit request has been cancelled',
    ru: 'Ваша заявка на посещение была отменена',
    uz: 'Sizning tashrif so\'rovingiz bekor qilindi'
  },
  'myRequests.cancelError': {
    en: 'An error occurred while cancelling the visit',
    ru: 'Произошла ошибка при отмене посещения',
    uz: 'Tashrifni bekor qilishda xato yuz berdi'
  },
  'myRequests.messageSent': {
    en: 'Message sent',
    ru: 'Сообщение отправлено',
    uz: 'Xabar yuborildi'
  },
  'myRequests.couldNotSendMessage': {
    en: 'Could not send message',
    ru: 'Не удалось отправить сообщение',
    uz: 'Xabar yuborib bo\'lmadi'
  },
  'myRequests.failedToLoad': {
    en: 'Failed to load requests',
    ru: 'Не удалось загрузить запросы',
    uz: 'So\'rovlarni yuklab bo\'lmadi'
  },

  // Additional VisitRequests keys
  'visitRequests.property': {
    en: 'Property',
    ru: 'Объект',
    uz: 'Mulk'
  },
  'visitRequests.visitor': {
    en: 'Visitor',
    ru: 'Посетитель',
    uz: 'Mehmon'
  },
  'visitRequests.user': {
    en: 'User',
    ru: 'Пользователь',
    uz: 'Foydalanuvchi'
  },
  'visitRequests.deny': {
    en: 'Deny',
    ru: 'Отклонить',
    uz: 'Rad etish'
  },
  'visitRequests.leaveReview': {
    en: 'Leave Review',
    ru: 'Оставить отзыв',
    uz: 'Sharh qoldirish'
  },
  'visitRequests.areYouSure': {
    en: 'Are you sure?',
    ru: 'Вы уверены?',
    uz: 'Ishonchingiz komilmi?'
  },
  'visitRequests.denyDescription': {
    en: 'This will mark the request as denied. The visitor will no longer see it as active.',
    ru: 'Это отметит запрос как отклонённый. Посетитель больше не увидит его как активный.',
    uz: 'Bu so\'rovni rad etilgan deb belgilaydi. Mehmon uni faol deb ko\'rmaydi.'
  },
  'visitRequests.cancel': {
    en: 'Cancel',
    ru: 'Отмена',
    uz: 'Bekor qilish'
  },
  'visitRequests.yesDeny': {
    en: 'Yes, deny',
    ru: 'Да, отклонить',
    uz: 'Ha, rad etish'
  },
  'visitRequests.visitRequestsInbox': {
    en: 'Visit Requests Inbox',
    ru: 'Входящие запросы на просмотр',
    uz: 'Tashrif so\'rovlari qutisi'
  },
  'visitRequests.myListings': {
    en: 'My Listings',
    ru: 'Мои объявления',
    uz: 'Mening e\'lonlarim'
  },
  'visitRequests.noRequestsYet': {
    en: 'No Requests Yet',
    ru: 'Пока нет запросов',
    uz: 'Hali so\'rovlar yo\'q'
  },
  'visitRequests.noRequestsDescription': {
    en: 'You will see visit requests for your properties here.',
    ru: 'Здесь вы увидите запросы на просмотр ваших объектов.',
    uz: 'Bu yerda mulklaringiz uchun tashrif so\'rovlarini ko\'rasiz.'
  },
  'visitRequests.browseBuyers': {
    en: 'Browse Buyers',
    ru: 'Просмотреть покупателей',
    uz: 'Xaridorlarni ko\'rish'
  },
  'visitRequests.coming': {
    en: 'Coming',
    ru: 'Предстоящие',
    uz: 'Kelgusi'
  },
  'visitRequests.noUpcomingVisits': {
    en: 'No Upcoming Visits',
    ru: 'Нет предстоящих посещений',
    uz: 'Kelgusi tashriflar yo\'q'
  },
  'visitRequests.upcomingVisitsDescription': {
    en: 'All confirmed visits are showing here.',
    ru: 'Все подтверждённые посещения показаны здесь.',
    uz: 'Barcha tasdiqlangan tashriflar shu yerda ko\'rsatiladi.'
  },
  'visitRequests.noDeniedRequests': {
    en: 'No Denied Requests',
    ru: 'Нет отклонённых запросов',
    uz: 'Rad etilgan so\'rovlar yo\'q'
  },
  'visitRequests.deniedRequestsDescription': {
    en: 'Denied visit requests will appear here.',
    ru: 'Отклонённые запросы на посещение появятся здесь.',
    uz: 'Rad etilgan tashrif so\'rovlari shu yerda ko\'rinadi.'
  },
  'visitRequests.noFinishedVisits': {
    en: 'No Finished Visits',
    ru: 'Нет завершённых посещений',
    uz: 'Tugallangan tashriflar yo\'q'
  },
  'visitRequests.finishedVisitsDescription': {
    en: 'Completed visits will appear here for review.',
    ru: 'Завершённые посещения появятся здесь для отзыва.',
    uz: 'Tugallangan tashriflar sharh uchun shu yerda ko\'rinadi.'
  },
  'visitRequests.messageVisitor': {
    en: 'Message Visitor',
    ru: 'Написать посетителю',
    uz: 'Mehmonga xabar'
  },
  'visitRequests.typeMessageToVisitor': {
    en: 'Type your message to the visitor...',
    ru: 'Введите сообщение посетителю...',
    uz: 'Mehmonga xabaringizni yozing...'
  },
  'visitRequests.send': {
    en: 'Send',
    ru: 'Отправить',
    uz: 'Yuborish'
  },
  'visitRequests.proposeAlternativeTime': {
    en: 'Propose an alternative time',
    ru: 'Предложить альтернативное время',
    uz: 'Muqobil vaqt taklif qilish'
  },
  'visitRequests.date': {
    en: 'Date',
    ru: 'Дата',
    uz: 'Sana'
  },
  'visitRequests.time': {
    en: 'Time',
    ru: 'Время',
    uz: 'Vaqt'
  },
  'visitRequests.sendProposal': {
    en: 'Send Proposal',
    ru: 'Отправить предложение',
    uz: 'Taklif yuborish'
  },
  'visitRequests.reviewVisit': {
    en: 'Review Visit',
    ru: 'Оценить посещение',
    uz: 'Tashrifni baholash'
  },
  'visitRequests.didVisitorShow': {
    en: 'Did the visitor show up?',
    ru: 'Посетитель пришёл?',
    uz: 'Mehmon keldimi?'
  },
  'visitRequests.yesCame': {
    en: 'Yes, they came',
    ru: 'Да, пришли',
    uz: 'Ha, kelishdi'
  },
  'visitRequests.noDidNotShow': {
    en: 'No, they didn\'t show',
    ru: 'Нет, не пришли',
    uz: 'Yo\'q, kelishmadi'
  },
  'visitRequests.additionalNotes': {
    en: 'Additional notes (optional)',
    ru: 'Дополнительные заметки (необязательно)',
    uz: 'Qo\'shimcha eslatmalar (ixtiyoriy)'
  },
  'visitRequests.shareExperience': {
    en: 'Share your experience or notes about this visit...',
    ru: 'Поделитесь своим опытом или заметками об этом посещении...',
    uz: 'Ushbu tashrif haqida tajribangiz yoki eslatmalaringizni baham ko\'ring...'
  },
  'visitRequests.saveReview': {
    en: 'Save Review',
    ru: 'Сохранить отзыв',
    uz: 'Sharhni saqlash'
  },
  'visitRequests.loadingVisitRequests': {
    en: 'Loading visit requests...',
    ru: 'Загрузка запросов на посещение...',
    uz: 'Tashrif so\'rovlari yuklanmoqda...'
  },
  'visitRequests.approved': {
    en: 'Approved',
    ru: 'Одобрено',
    uz: 'Tasdiqlangan'
  },
  'visitRequests.visitConfirmed': {
    en: 'Visit confirmed.',
    ru: 'Посещение подтверждено.',
    uz: 'Tashrif tasdiqlandi.'
  },
  'visitRequests.requestDenied': {
    en: 'Request denied.',
    ru: 'Запрос отклонён.',
    uz: 'So\'rov rad etildi.'
  },
  'visitRequests.error': {
    en: 'Error',
    ru: 'Ошибка',
    uz: 'Xato'
  },
  'visitRequests.couldNotApprove': {
    en: 'Could not approve request',
    ru: 'Не удалось одобрить запрос',
    uz: 'So\'rovni tasdiqlab bo\'lmadi'
  },
  'visitRequests.couldNotDeny': {
    en: 'Could not deny request',
    ru: 'Не удалось отклонить запрос',
    uz: 'So\'rovni rad etib bo\'lmadi'
  },
  'visitRequests.alternativeTimeProposed': {
    en: 'Alternative time proposed',
    ru: 'Альтернативное время предложено',
    uz: 'Muqobil vaqt taklif qilindi'
  },
  'visitRequests.visitorNotified': {
    en: 'The visitor will be notified and can accept or propose another time.',
    ru: 'Посетитель будет уведомлён и может принять или предложить другое время.',
    uz: 'Mehmon xabardor qilinadi va qabul qilishi yoki boshqa vaqt taklif qilishi mumkin.'
  },
  'visitRequests.couldNotProposeTime': {
    en: 'Could not propose time',
    ru: 'Не удалось предложить время',
    uz: 'Vaqt taklif qilib bo\'lmadi'
  },
  'visitRequests.messageSent': {
    en: 'Message sent',
    ru: 'Сообщение отправлено',
    uz: 'Xabar yuborildi'
  },
  'visitRequests.couldNotSendMessage': {
    en: 'Could not send message',
    ru: 'Не удалось отправить сообщение',
    uz: 'Xabar yuborib bo\'lmadi'
  },
  'visitRequests.reviewSaved': {
    en: 'Review saved',
    ru: 'Отзыв сохранён',
    uz: 'Sharh saqlandi'
  },
  'visitRequests.thankYouFeedback': {
    en: 'Thank you for your feedback.',
    ru: 'Спасибо за ваш отзыв.',
    uz: 'Fikr-mulohazangiz uchun rahmat.'
  },
  'visitRequests.reviewSavedPenalty': {
    en: 'Review saved and penalty applied for no-show.',
    ru: 'Отзыв сохранён и штраф применён за неявку.',
    uz: 'Sharh saqlandi va kelmagan uchun jarima qo\'llanildi.'
  },
  'visitRequests.couldNotSaveReview': {
    en: 'Could not save review',
    ru: 'Не удалось сохранить отзыв',
    uz: 'Sharhni saqlab bo\'lmadi'
  },
  'visitRequests.userRestricted': {
    en: 'User restricted',
    ru: 'Пользователь ограничен',
    uz: 'Foydalanuvchi cheklandi'
  },
  'visitRequests.userRestrictedDescription': {
    en: 'User has been restricted from creating visit requests.',
    ru: 'Пользователь был ограничен в создании запросов на посещение.',
    uz: 'Foydalanuvchi tashrif so\'rovlari yaratishdan cheklandi.'
  },
  'visitRequests.couldNotRestrictUser': {
    en: 'Could not restrict user',
    ru: 'Не удалось ограничить пользователя',
    uz: 'Foydalanuvchini cheklab bo\'lmadi'
  },
  'visitRequests.failedToLoadRequests': {
    en: 'Failed to load requests',
    ru: 'Не удалось загрузить запросы',
    uz: 'So\'rovlarni yuklab bo\'lmadi'
  },
  'visitRequests.penaltyApplied': {
    en: 'Penalty applied',
    ru: 'Штраф применён',
    uz: 'Jarima qo\'llanildi'
  },
  'visitRequests.penaltyLevel': {
    en: 'User received level {level} penalty for no-show',
    ru: 'Пользователь получил штраф уровня {level} за неявку',
    uz: 'Foydalanuvchi kelmagan uchun {level}-darajali jarima oldi'
  },
  'listProperty.requiredDocuments': {
    en: 'Required Documents',
    ru: 'Необходимые документы',
    uz: 'Kerakli hujjatlar'
  },
  'listProperty.propertyTitle': {
    en: 'Property Title/Deed',
    ru: 'Свидетельство о собственности',
    uz: 'Mulkchilik guvohnomasi'
  },
  'listProperty.proofOfOwnership': {
    en: 'Proof of ownership',
    ru: 'Подтверждение собственности',
    uz: 'Mulkchilik isboti'
  },
  'listProperty.upload': {
    en: 'Upload',
    ru: 'Загрузить',
    uz: 'Yuklash'
  },
  'listProperty.passportId': {
    en: 'Passport/ID',
    ru: 'Паспорт/Удостоверение',
    uz: 'Pasport/Guvohnoma'
  },
  'listProperty.ownerIdentification': {
    en: 'Owner identification',
    ru: 'Удостоверение владельца',
    uz: 'Eganing shaxsini tasdiqlovchi'
  },
  'listProperty.propertyAssessment': {
    en: 'Property Assessment',
    ru: 'Оценка недвижимости',
    uz: 'Mulk baholash'
  },
  'listProperty.officialValuation': {
    en: 'Official valuation (if available)',
    ru: 'Официальная оценка (если есть)',
    uz: 'Rasmiy baholash (agar mavjud bo\'lsa)'
  },
  'listProperty.professionalVirtualTourFull': {
    en: 'Professional Virtual Tour (+300,000 UZS)',
    ru: 'Профессиональный виртуальный тур (+300,000 UZS)',
    uz: 'Professional virtual tur (+300,000 UZS)'
  },
  'listProperty.agentVisitDescription': {
    en: 'Our certified agent will visit your property within 2-3 business days to verify details and create professional virtual tour photos.',
    ru: 'Наш сертифицированный агент посетит ваш объект в течение 2-3 рабочих дней для проверки деталей и создания профессиональных фотографий виртуального тура.',
    uz: 'Bizning sertifikatlangan agentimiz 2-3 ish kuni ichida mulkingizga tashrif buyurib, tafsilotlarni tekshiradi va professional virtual tur rasmlarini yaratadi.'
  },
  'listProperty.halalFinancingAvailable': {
    en: 'Halal Financing Available',
    ru: 'Доступно халяльное финансирование',
    uz: 'Halol moliyalashtirish mavjud'
  },
  'listProperty.shariaCompliantDescription': {
    en: 'Request to make your property available for Sharia-compliant financing. Our Islamic finance team will contact you within 1 week to discuss options.',
    ru: 'Запросите, чтобы ваш объект стал доступен для финансирования, соответствующего шариату. Наша команда исламского финансирования свяжется с вами в течение 1 недели для обсуждения вариантов.',
    uz: 'Mulkingizni Shariatga mos moliyalashtirish uchun mavjud qilishni so\'rang. Bizning islom moliyasi jamoamiz imkoniyatlarni muhokama qilish uchun 1 hafta ichida siz bilan bog\'lanadi.'
  },
  'listProperty.halalFinancingDescription': {
    en: 'Request to make your property available for Sharia-compliant financing. Our Islamic finance team will contact you within 1 week to discuss options.',
    ru: 'Запросите, чтобы ваш объект стал доступен для финансирования, соответствующего шариату. Наша команда исламского финансирования свяжется с вами в течение 1 недели для обсуждения вариантов.',
    uz: 'Mulkingizni Shariatga mos moliyalashtirish uchun mavjud qilishni so\'rang. Bizning islom moliyasi jamoamiz imkoniyatlarni muhokama qilish uchun 1 hafta ichida siz bilan bog\'lanadi.'
  },
  'listProperty.halalServiceFee': {
    en: '⚠️ Please note: Enabling Halal financing includes a 1% service fee for facilitating Sharia-compliant transactions.',
    ru: '⚠️ Обратите внимание: включение халяльного финансирования включает комиссию в размере 1% за содействие в сделках, соответствующих шариату.',
    uz: '⚠️ Eslatma: Halol moliyalashtirishni yoqish Shariatga mos bitimlarni amalga oshirish uchun 1% xizmat to\'lovini o\'z ichiga oladi.'
  },
  'listProperty.pricingImpact': {
    en: '💰 Pricing Impact',
    ru: '💰 Влияние на цену',
    uz: '💰 Narx ta\'siri'
  },
  'listProperty.listedPrice': {
    en: 'Listed Price:',
    ru: 'Указанная цена:',
    uz: 'Ko\'rsatilgan narx:'
  },
  'listProperty.magitFee': {
    en: 'Magit Fee (1%):',
    ru: 'Комиссия Magit (1%):',
    uz: 'Magit to\'lovi (1%):'
  },
  'listProperty.halalServiceFeeLabel': {
    en: 'Halal Service Fee (1%):',
    ru: 'Комиссия за халяльное обслуживание (1%):',
    uz: 'Halol xizmat to\'lovi (1%):'
  },
  'listProperty.netProceeds': {
    en: 'Your Net Proceeds:',
    ru: 'Ваша чистая прибыль:',
    uz: 'Sizning sof daromadingiz:'
  },
  'listProperty.feeExplanation': {
    en: 'These fees help us maintain the platform and provide halal financing services. The Magit fee is charged when the property is sold with financing.',
    ru: 'Эти комиссии помогают нам поддерживать платформу и предоставлять услуги халяльного финансирования. Комиссия Magit взимается при продаже недвижимости с финансированием.',
    uz: 'Bu to\'lovlar platformani saqlashga va halol moliyalashtirish xizmatlarini taqdim etishga yordam beradi. Magit to\'lovi mulk moliyalashtirish bilan sotilganda olinadi.'
  },

  // AllResults page
  'allResults.searchResults': {
    en: 'Search Results',
    ru: 'Результаты поиска',
    uz: 'Qidiruv natijalari'
  },
  'allResults.back': {
    en: 'Back',
    ru: 'Назад',
    uz: 'Orqaga'
  },
  'allResults.loading': {
    en: 'Loading...',
    ru: 'Загрузка...',
    uz: 'Yuklanmoqda...'
  },
  'allResults.propertiesFound': {
    en: 'properties found',
    ru: 'объектов найдено',
    uz: 'mulk topildi'
  },
  'allResults.filters': {
    en: 'Filters',
    ru: 'Фильтры',
    uz: 'Filtrlar'
  },
  'allResults.sortBy': {
    en: 'Sort by',
    ru: 'Сортировать по',
    uz: 'Saralash'
  },
  'allResults.relevance': {
    en: 'Relevance',
    ru: 'Релевантность',
    uz: 'Dolzarblik'
  },
  'allResults.priceLowToHigh': {
    en: 'Price: Low to High',
    ru: 'Цена: по возрастанию',
    uz: 'Narx: kamdan ko\'pga'
  },
  'allResults.priceHighToLow': {
    en: 'Price: High to Low',
    ru: 'Цена: по убыванию',
    uz: 'Narx: ko\'pdan kamga'
  },
  'allResults.largestFirst': {
    en: 'Largest First',
    ru: 'Сначала большие',
    uz: 'Avval kattalar'
  },
  'allResults.smallestFirst': {
    en: 'Smallest First',
    ru: 'Сначала маленькие',
    uz: 'Avval kichiklar'
  },
  'allResults.chooseDistrict': {
    en: 'Choose district',
    ru: 'Выберите район',
    uz: 'Tumanni tanlang'
  },
  'allResults.allDistricts': {
    en: 'All Districts',
    ru: 'Все районы',
    uz: 'Barcha tumanlar'
  },
  'allResults.minPrice': {
    en: 'Min Price',
    ru: 'Мин. цена',
    uz: 'Min. narx'
  },
  'allResults.maxPrice': {
    en: 'Max Price',
    ru: 'Макс. цена',
    uz: 'Maks. narx'
  },
  'allResults.anyPrice': {
    en: 'Any Price',
    ru: 'Любая цена',
    uz: 'Har qanday narx'
  },
  'allResults.anyType': {
    en: 'Any Type',
    ru: 'Любой тип',
    uz: 'Har qanday tur'
  },
  'allResults.any': {
    en: 'Any',
    ru: 'Любой',
    uz: 'Har qanday'
  },
  'allResults.noProperties': {
    en: 'No properties found matching your criteria.',
    ru: 'Объекты по вашим критериям не найдены.',
    uz: 'Sizning mezonlaringizga mos mulk topilmadi.'
  },
  'allResults.loadingResults': {
    en: 'Loading results...',
    ru: 'Загрузка результатов...',
    uz: 'Natijalar yuklanmoqda...'
  },

  // Messages page
  'messages.conversations': {
    en: 'Conversations',
    ru: 'Беседы',
    uz: 'Suhbatlar'
  },
  'messages.noConversations': {
    en: 'No conversations yet',
    ru: 'Пока нет бесед',
    uz: 'Hali suhbatlar yo\'q'
  },
  'messages.active': {
    en: 'Active',
    ru: 'Активный',
    uz: 'Faol'
  },
  'messages.report': {
    en: 'Report',
    ru: 'Жалоба',
    uz: 'Shikoyat'
  },
  'messages.reportUser': {
    en: 'Report User',
    ru: 'Пожаловаться на пользователя',
    uz: 'Foydalanuvchiga shikoyat'
  },
  'messages.reportDescription': {
    en: 'Describe the reason for reporting this user...',
    ru: 'Опишите причину жалобы на этого пользователя...',
    uz: 'Ushbu foydalanuvchiga shikoyat qilish sababini tasvirlab bering...'
  },
  'messages.submitReport': {
    en: 'Submit Report',
    ru: 'Отправить жалобу',
    uz: 'Shikoyat yuborish'
  },
  'messages.typeMessage': {
    en: 'Type your message...',
    ru: 'Введите сообщение...',
    uz: 'Xabaringizni yozing...'
  },
  'messages.send': {
    en: 'Send',
    ru: 'Отправить',
    uz: 'Yuborish'
  },

  // VisitRequests page
  'visitRequests.title': {
    en: 'Visit Requests',
    ru: 'Запросы на просмотр',
    uz: 'Ko\'rish so\'rovlari'
  },
  'visitRequests.inbox': {
    en: 'Visit Requests Inbox',
    ru: 'Входящие запросы на просмотр',
    uz: 'Ko\'rish so\'rovlari qutisi'
  },
  'visitRequests.pending': {
    en: 'Pending',
    ru: 'Ожидающие',
    uz: 'Kutilayotgan'
  },
  'visitRequests.upcoming': {
    en: 'Upcoming',
    ru: 'Предстоящие',
    uz: 'Kelgusi'
  },
  'visitRequests.finished': {
    en: 'Finished',
    ru: 'Завершенные',
    uz: 'Tugallangan'
  },
  'visitRequests.confirmed': {
    en: 'Confirmed',
    ru: 'Подтверждено',
    uz: 'Tasdiqlangan'
  },
  'visitRequests.denied': {
    en: 'Denied',
    ru: 'Отклонено',
    uz: 'Rad etilgan'
  },
  'visitRequests.requestedBy': {
    en: 'Requested by',
    ru: 'Запросил',
    uz: 'So\'ragan'
  },
  'visitRequests.requestSent': {
    en: 'Request sent',
    ru: 'Заявка отправлена',
    uz: 'So\'rov yuborilgan'
  },
  'visitRequests.alternativeTime': {
    en: 'Alternative time',
    ru: 'Альтернативное время',
    uz: 'Muqobil vaqt'
  },
  'visitRequests.reviewCompleted': {
    en: 'Review completed',
    ru: 'Отзыв завершен',
    uz: 'Sharh tugallandi'
  },
  'visitRequests.visitorShowedUp': {
    en: 'Visitor showed up',
    ru: 'Посетитель пришел',
    uz: 'Mehmon keldi'
  },
  'visitRequests.visitorDidNotShow': {
    en: 'Visitor did not show up',
    ru: 'Посетитель не пришел',
    uz: 'Mehmon kelmadi'
  },
  'visitRequests.awaitingReview': {
    en: 'Awaiting review',
    ru: 'Ожидается отзыв',
    uz: 'Sharh kutilmoqda'
  },
  'visitRequests.paidVisit': {
    en: 'Paid visit',
    ru: 'Платный просмотр',
    uz: 'Pullik ko\'rish'
  },
  'visitRequests.message': {
    en: 'Message',
    ru: 'Сообщение',
    uz: 'Xabar'
  },
  'visitRequests.offerAlternative': {
    en: 'Offer alternative',
    ru: 'Предложить альтернативу',
    uz: 'Muqobil taklif qilish'
  },
  'visitRequests.approve': {
    en: 'Approve',
    ru: 'Одобрить',
    uz: 'Tasdiqlash'
  },
  'visitRequests.noRequests': {
    en: 'No visit requests yet.',
    ru: 'Пока нет запросов на просмотр.',
    uz: 'Hali ko\'rish so\'rovlari yo\'q.'
  },
  'visitRequests.noUpcoming': {
    en: 'No upcoming visits.',
    ru: 'Нет предстоящих просмотров.',
    uz: 'Kelgusi ko\'rishlar yo\'q.'
  },
  'visitRequests.noFinished': {
    en: 'No finished visits yet.',
    ru: 'Пока нет завершенных просмотров.',
    uz: 'Hali tugallangan ko\'rishlar yo\'q.'
  },

  // SavedProperties page
  'savedProperties.title': {
    en: 'Saved Properties',
    ru: 'Сохраненные объекты',
    uz: 'Saqlangan mulklar'
  },
  'savedProperties.noProperties': {
    en: 'No saved properties yet',
    ru: 'Пока нет сохраненных объектов',
    uz: 'Hali saqlangan mulklar yo\'q'
  },
  'savedProperties.startBrowsing': {
    en: 'Start browsing properties to save your favorites',
    ru: 'Начните просматривать объекты, чтобы сохранить избранные',
    uz: 'Sevimlilaringizni saqlash uchun mulklarni ko\'rishni boshlang'
  },
  'savedProperties.browseProperties': {
    en: 'Browse Properties',
    ru: 'Просмотреть объекты',
    uz: 'Mulklarni ko\'rish'
  },
  'savedProperties.requestVisit': {
    en: 'Request Visit',
    ru: 'Запросить просмотр',
    uz: 'Ko\'rishni so\'rash'
  },
  'savedProperties.removeFromSaved': {
    en: 'Remove from saved',
    ru: 'Удалить из сохраненных',
    uz: 'Saqlanganlardan olib tashlash'
  },

  // Popular searches
  'search.popularSearches': {
    en: 'Popular searches:',
    ru: 'Популярные запросы:',
    uz: 'Ommabop qidiruvlar:'
  },
  'search.popular1': {
    en: '3-bedroom Yunusobod',
    ru: '3-комнатная Юнусабад',
    uz: '3 xonali Yunusobod'
  },
  'search.popular2': {
    en: 'New construction Chilonzor',
    ru: 'Новостройка Чиланзар',
    uz: 'Yangi bino Chilonzor'
  },
  'search.popular3': {
    en: 'Apartment with parking',
    ru: 'Квартира с парковкой',
    uz: 'Garaj bilan kvartira'
  },
  'search.popular4': {
    en: 'Halal financing available',
    ru: 'Халяль финансирование',
    uz: 'Halol moliyalashtirish'
  },

  // Features Section
  'features.title': {
    en: 'Your home journey, reimagined',
    ru: 'Поиск дома по-новому',
    uz: 'Uy izlash yangi usulda'
  },
  'features.subtitle': {
    en: 'Everything you need to find, finance, and secure your perfect home — all in one trusted platform.',
    ru: 'Все для поиска, финансирования и покупки идеального дома на одной платформе.',
    uz: 'Mukammal uyni topish, moliyalashtirish va xarid qilish uchun barcha imkoniyatlar bir platformada.'
  },
  'features.verified': {
    en: 'Verified Properties',
    ru: 'Проверенные дома',
    uz: 'Tekshirilgan uylar'
  },
  'features.verifiedDesc': {
    en: 'Every listing is verified with ID checks and document validation. No scams, no surprises.',
    ru: 'Каждое объявление проверено документально. Никаких мошенников.',
    uz: 'Har bir uy hujjatlar bilan tekshirilgan. Firibgarlik yoq.'
  },
  'features.halalFinancing': {
    en: 'Halal Financing',
    ru: 'Рассрочка',
    uz: 'Bo\'lib to\'lash'
  },
  'features.halalFinancingTooltip': {
    en: 'Halal financing is a Sharia-compliant payment system without traditional interest rates. Learn more about how it works.',
    ru: 'Халяльное финансирование - это система платежей, соответствующая шариату, без традиционных процентных ставок. Узнайте больше о том, как это работает.',
    uz: 'Halol moliyalashtirish - bu an\'anaviy foiz stavkalarsiz shariatga mos to\'lov tizimi. Bu qanday ishlashini bilib oling.'
  },
  'features.halalDesc': {
    en: 'Sharia-compliant buy-now-pay-later options with transparent terms and zero interest.',
    ru: 'Шариатское финансирование без процентов с прозрачными условиями.',
    uz: 'Foizsiz, ochiq shartlar bilan shariatga mos moliyalashtirish.'
  },
  'features.map': {
    en: 'Interactive Map',
    ru: 'Интерактивная карта',
    uz: 'Interaktiv xarita'
  },
  'features.mapDesc': {
    en: 'Explore neighborhoods, check amenities, and find homes that match your lifestyle.',
    ru: 'Изучайте районы, проверяйте инфраструктуру, находите дом мечты.',
    uz: 'Hududlarni oʻrganish, infratuzilmani tekshirish va hayot tarziga mos uy topish.'
  },
  'features.community': {
    en: 'Trusted Community',
    ru: 'Надежное сообщество',
    uz: 'Ishonchli jamoa'
  },
  'features.communityDesc': {
    en: 'Connect with verified sellers and join a community of families upgrading their homes.',
    ru: 'Общайтесь с проверенными продавцами в сообществе семей.',
    uz: 'Tekshirilgan sotuvchilar va oilalar jamoasi bilan aloqa.'
  },
  'features.smartMatching': {
    en: 'Smart Matching',
    ru: 'Умный подбор',
    uz: 'Aqlli tanlov'
  },
  'features.smartDesc': {
    en: 'Our algorithm matches you with homes that fit your budget, preferences, and financing needs.',
    ru: 'Алгоритм подбирает дома по вашему бюджету, предпочтениям и финансам.',
    uz: 'Algoritm byudjet, istaklar va moliya imkoniyatlariga mos uylarni tanlaydi.'
  },
  'features.secure': {
    en: 'Secure Process',
    ru: 'Безопасная сделка',
    uz: 'Xavfsiz jarayon'
  },
  'features.secureDesc': {
    en: 'End-to-end protection with escrow services, legal support, and transparent documentation.',
    ru: 'Полная защита с депозитом, юридической поддержкой и прозрачными документами.',
    uz: 'Depozit xizmati, yuridik yordam va ochiq hujjatlar bilan toʻliq himoya.'
  },

  // Stats
  'stats.verifiedHomes': {
    en: 'Verified Homes',
    ru: 'Проверенные дома',
    uz: 'Tekshirilgan uylar'
  },
  'stats.trustRating': {
    en: 'Trust Rating',
    ru: 'Рейтинг доверия',
    uz: 'Ishonch reytingi'
  },
  'stats.interestRate': {
    en: 'Interest Rate',
    ru: 'Процентная ставка',
    uz: 'Foiz stavkasi'
  },
  'stats.support': {
    en: 'Support',
    ru: 'Поддержка',
    uz: 'Yordam'
  },

  // Dashboard (Authenticated quick stats)
  'dashboard.yourJourney': {
    en: 'Your Property Journey',
    ru: 'Ваш путь к недвижимости',
    uz: 'Ko‘chmas mulk sayohatingiz'
  },
  'dashboard.saved': {
    en: 'Saved Properties',
    ru: 'Сохранённые объекты',
    uz: 'Saqlangan eʼlonlar'
  },
  'dashboard.viewSaved': {
    en: 'View Saved Properties',
    ru: 'Смотреть сохранённые',
    uz: 'Saqlanganlarni ko‘rish'
  },
  'dashboard.listed': {
    en: 'Properties Listed',
    ru: 'Размещённые объекты',
    uz: 'Joylashtirilgan eʼlonlar'
  },
  'dashboard.viewListed': {
    en: 'View Listed Properties',
    ru: 'Смотреть размещённые',
    uz: 'Joylashtirilganlarni ko‘rish'
  },
  'dashboard.yourRequests': {
    en: 'Your Visit Requests',
    ru: 'Ваши заявки на просмотр',
    uz: 'Sizning tashrif so‘rovlari'
  },
  'dashboard.pendingConfirmed': {
    en: 'Pending and confirmed',
    ru: 'В ожидании и подтверждено',
    uz: 'Kutilmoqda va tasdiqlangan'
  },
  'dashboard.viewYourRequests': {
    en: 'View Your Requests',
    ru: 'Смотреть ваши заявки',
    uz: 'So‘rovlaringizni ko‘rish'
  },
  'dashboard.incomingRequests': {
    en: 'Requests To Your Properties',
    ru: 'Заявки на ваши объекты',
    uz: 'Sizning eʼlonlaringizga so‘rovlar'
  },
  'dashboard.ownerInbox': {
    en: 'Owner inbox',
    ru: 'Владельцу входящие',
    uz: 'Egasi uchun kirish qutisi'
  },
  'dashboard.manageRequests': {
    en: 'Manage Requests',
    ru: 'Управлять заявками',
    uz: 'So‘roqlarni boshqarish'
  },
  'dashboard.financingRequests': {
    en: 'Financing Requests',
    ru: 'Заявки на финансирование',
    uz: 'Moliyalashtirish so\'rovlari'
  },
  'dashboard.activeApplications': {
    en: 'Active applications',
    ru: 'Активные заявки',
    uz: 'Faol ilovalar'
  },
  'dashboard.viewFinancing': {
    en: 'View Financing',
    ru: 'Смотреть финансирование',
    uz: 'Moliyani korish'
  },

  // CTA
  'cta.title': {
    en: 'Ready to find your perfect home?',
    ru: 'Готовы найти идеальный дом?',
    uz: 'Mukammal uyni topishga tayyormisiz?'
  },
  'cta.subtitle': {
    en: 'Join thousands of families who\'ve found their dream homes through our verified marketplace with honest, Halal financing options.',
    ru: 'Присоединяйтесь к тысячам семей, нашедших дом мечты на нашей проверенной платформе с честным халяль финансированием.',
    uz: 'Bizning ishonchli platformamizda halol moliyalashtirish bilan orzuingizdagi uyni topgan minglab oilalarga qoʻshiling.'
  },
  'cta.button': {
    en: 'Start Your Journey',
    ru: 'Начать поиск',
    uz: 'Izlashni boshlash'
  },
  'cta.learnMore': {
    en: 'Learn More',
    ru: 'Узнать больше',
    uz: 'Batafsil'
  },
  'common.learnMore': {
    en: 'Learn More',
    ru: 'Узнать больше',
    uz: 'Batafsil bilish'
  },

  // Actions
  'actions.findProperties': {
    en: 'Find Properties',
    ru: 'Найти объекты',
    uz: 'Eʼlonlarni topish'
  },
  'actions.listProperty': {
    en: 'List Your Property',
    ru: 'Разместить объявление',
    uz: 'Eʼlon joylash'
  },

  // Footer
  'footer.tagline': {
    en: 'Verified homes. Honest financing. Peace of mind.',
    ru: 'Проверенные дома. Честное финансирование. Спокойствие.',
    uz: 'Tekshirilgan uylar. Halol moliya. Xotirjamlik.'
  },
  'footer.platform': {
    en: 'Platform',
    ru: 'Платформа',
    uz: 'Platforma'
  },
  'footer.browseHomes': {
    en: 'Browse Homes',
    ru: 'Просмотр домов',
    uz: 'Uylarni koʻrish'
  },
  'footer.financing': {
    en: 'Financing',
    ru: 'Финансирование',
    uz: 'Moliyalashtirish'
  },
  'footer.howItWorks': {
    en: 'How it Works',
    ru: 'Как это работает',
    uz: 'Qanday ishlaydi'
  },
  'footer.support': {
    en: 'Support',
    ru: 'Поддержка',
    uz: 'Yordam'
  },
  'footer.helpCenter': {
    en: 'Help Center',
    ru: 'Центр помощи',
    uz: 'Yordam markazi'
  },
  'footer.contactUs': {
    en: 'Contact Us',
    ru: 'Связаться с нами',
    uz: 'Biz bilan aloqa'
  },
  'footer.safety': {
    en: 'Safety',
    ru: 'Безопасность',
    uz: 'Xavfsizlik'
  },
  'footer.company': {
    en: 'Company',
    ru: 'Компания',
    uz: 'Kompaniya'
  },
  'footer.about': {
    en: 'About',
    ru: 'О нас',
    uz: 'Biz haqimizda'
  },
  'footer.privacy': {
    en: 'Privacy',
    ru: 'Конфиденциальность',
    uz: 'Maxfiylik'
  },
  'footer.terms': {
    en: 'Terms & Conditions',
    ru: 'Условия использования',
    uz: 'Foydalanish shartlari'
  },
  'footer.copyright': {
    en: '© 2024 Magit. All rights reserved. Made with care for families in Uzbekistan.',
    ru: '© 2024 Magit. Все права защищены. Сделано с заботой для семей в Узбекистане.',
    uz: '© 2024 Magit. Barcha huquqlar himoyalangan. Oʻzbekistondagi oilalar uchun g\'amxoʻrlik bilan yaratilgan.'
  },
  'footer.autoDarkMode': {
    en: 'Auto Dark Mode',
    ru: 'Авто темная тема',
    uz: 'Avto qora rejim'
  },

  // Map Section
  'map.halalMarketplace': {
    en: 'Halal Marketplace',
    ru: 'Халяль платформа',
    uz: 'Halol bozor'
  },
  'map.liveMarketplace': {
    en: 'Live Marketplace',
    ru: 'Живая платформа',
    uz: 'Jonli bozor'
  },
  'map.title': {
    en: 'Find your perfect home on the map',
    ru: 'Найдите идеальный дом на карте',
    uz: 'Xaritada mukammal uyingizni toping'
  },
  'map.description': {
    en: 'Browse 1,500+ verified properties across Tashkent. Filter by price, financing options, and neighborhood preferences.',
    ru: 'Просматривайте 1,500+ проверенных объектов по Ташкенту. Фильтруйте по цене, финансированию и районам.',
    uz: 'Toshkent bo\'ylab 1,500+ tekshirilgan uylarni ko\'ring. Narx, moliya va mahalla bo\'yicha filtrlang.'
  },
  'map.halalFinancing': {
    en: 'Halal Financing Available',
    ru: 'Халяль финансирование',
    uz: 'Halol moliyalashtirish'
  },
  'map.yunusobodDistrict': {
    en: 'Yunusobod District',
    ru: 'Юнусабадский район',
    uz: 'Yunusobod tumani'
  },
  'map.bedrooms': {
    en: '2-3 Bedrooms',
    ru: '2-3 комнаты',
    uz: '2-3 xonali'
  },
  'map.openMap': {
    en: 'Open Interactive Map',
    ru: 'Открыть интерактивную карту',
    uz: 'Interaktiv xaritani ochish'
  },
  'map.liveProperties': {
    en: 'Live Properties',
    ru: 'Актуальные объекты',
    uz: 'Jonli e\'lonlar'
  },
  'map.clickMarkers': {
    en: 'Click markers to view details',
    ru: 'Нажмите на маркеры для деталей',
    uz: 'Tafsilotlar uchun belgilarni bosing'
  },
  'map.availableNow': {
    en: 'Available Now',
    ru: 'Доступно сейчас',
    uz: 'Hozir mavjud'
  },
  'map.realTimeUpdates': {
    en: 'Real-time Updates',
    ru: 'Обновления в реальном времени',
    uz: 'Real vaqt yangilanishlari'
  },
  // Map UI extras
  'map.propertiesFound': {
    en: 'Properties Found',
    ru: 'Найдено объектов',
    uz: 'Topilgan eʼlonlar'
  },
  'map.loadingProperties': {
    en: 'Loading properties...',
    ru: 'Загрузка объектов...',
    uz: 'Eʼlonlar yuklanmoqda...'
  },
  'map.loadingMap': {
    en: 'Loading Yandex Maps...',
    ru: 'Загрузка Яндекс.Карт...',
    uz: 'Yandex xaritalari yuklanmoqda...'
  },
  'map.noHalalFound': {
    en: 'No halal-approved properties found right now.',
    ru: 'Сейчас нет объектов с халяль рассрочкой.',
    uz: 'Hozircha halol tasdiqlangan eʼlonlar yoʻq.'
  },
  'map.viewAllProperties': {
    en: 'View All Properties',
    ru: 'Смотреть все объекты',
    uz: 'Barcha eʼlonlarni ko‘rish'
  },
  // Address/Location picker
  'address.selectPropertyLocation': {
    en: 'Select Property Location',
    ru: 'Выберите расположение объекта',
    uz: 'Obyekt manzilini tanlang'
  },
  'address.searchPlaceholder': {
    en: 'Search address',
    ru: 'Поиск адреса',
    uz: 'Manzil qidirish'
  },
  'address.searchAria': {
    en: 'Search address',
    ru: 'Поиск адреса',
    uz: 'Manzil qidirish'
  },
  'address.useMyLocation': {
    en: 'Use my location',
    ru: 'Моё местоположение',
    uz: 'Joylashuvimdan foydalanish'
  },
  'address.loadingMap': {
    en: 'Loading map...',
    ru: 'Загрузка карты...',
    uz: 'Xarita yuklanmoqda...'
  },
  'address.selectedLocation': {
    en: 'Selected Location:',
    ru: 'Выбранное место:',
    uz: 'Tanlangan joy:'
  },
  'address.instructions': {
    en: 'Search for your address, click on the map, or use My Location. You can also drag the marker to adjust.',
    ru: 'Найдите адрес, кликните по карте или используйте Моё местоположение. Маркер можно перетаскивать.',
    uz: 'Manzilingizni qidiring, xaritaga bosing yoki Joylashuvimdan foydalaning. Markerni sudrab sozlashingiz mumkin.'
  },
  'address.notFound': {
    en: 'Location not found',
    ru: 'Местоположение не найдено',
    uz: 'Manzil topilmadi'
  },
  'address.onlyUzbekistan': {
    en: 'Only locations within Uzbekistan are supported',
    ru: 'Поддерживаются только места в Узбекистане',
    uz: 'Faqat Oʻzbekiston hududidagi joylar qoʻllab-quvvatlanadi'
  },
  'address.outOfBounds': {
    en: 'Outside Uzbekistan',
    ru: 'За пределами Узбекистана',
    uz: 'Oʻzbekistondan tashqarida'
  },
  'address.searchError': {
    en: 'Search error',
    ru: 'Ошибка поиска',
    uz: 'Qidiruv xatosi'
  },
  'address.enterAddress': {
    en: 'Please enter an address to search',
    ru: 'Введите адрес для поиска',
    uz: 'Qidirish uchun manzil kiriting'
  },
  'address.mapNotReady': {
    en: 'Map not ready',
    ru: 'Карта не готова',
    uz: 'Xarita tayyor emas'
  },
  'address.tryAgain': {
    en: 'Please wait for the map to load',
    ru: 'Подождите загрузки карты',
    uz: 'Xarita yuklanishini kuting'
  },
  'address.tryDifferent': {
    en: 'Try a different search term',
    ru: 'Попробуйте другой запрос',
    uz: 'Boshqa soʻrov kiriting'
  },
  'address.searchFailed': {
    en: 'Search failed',
    ru: 'Поиск не удался',
    uz: 'Qidiruv muvaffaqiyatsiz'
  },
  'address.checkConnection': {
    en: 'Please check your connection and try again',
    ru: 'Проверьте подключение и повторите попытку',
    uz: 'Internetni tekshiring va qayta urinib koʻring'
  },

  'common.min': {
    en: 'Min',
    ru: 'Мин',
    uz: 'Eng kam'
  },
  'common.max': {
    en: 'Max',
    ru: 'Макс',
    uz: 'Eng ko‘p'
  },

  // Filter extras
  'filter.allDistricts': {
    en: 'All Districts',
    ru: 'Все районы',
    uz: 'Barcha tumanlar'
  },
  'filter.bedroomsLabel': {
    en: 'Bedrooms',
    ru: 'Комнаты',
    uz: 'Xonalar'
  },
  'filter.bedrooms1Plus': {
    en: '1+ bed',
    ru: '1+ комн.',
    uz: '1+ xona'
  },
  'filter.bedrooms2Plus': {
    en: '2+ bed',
    ru: '2+ комн.',
    uz: '2+ xona'
  },
  'filter.bedrooms3Plus': {
    en: '3+ bed',
    ru: '3+ комн.',
    uz: '3+ xona'
  },
  'filter.bedrooms4Plus': {
    en: '4+ bed',
    ru: '4+ комн.',
    uz: '4+ xona'
  },

  // Map badges

  // Auth Page
  'auth.titleLogin': { en: 'Welcome Back', ru: 'С возвращением', uz: 'Qaytganingiz bilan' },
  'auth.titleSignup': { en: 'Create Account', ru: 'Создать аккаунт', uz: 'Hisob yaratish' },
  'auth.subtitleLogin': { en: 'Sign in to access your property dashboard', ru: 'Войдите, чтобы получить доступ к панели управления', uz: 'Kabinetga kirish uchun tizimga kiring' },
  'auth.subtitleSignup': { en: 'Join Magit to start your property journey', ru: 'Присоединяйтесь к Magit и начните свой путь в недвижимости', uz: 'Magitga qoʻshiling va uy-joy sayohatingizni boshlang' },
  'auth.fullName': { en: 'Full Name', ru: 'Полное имя', uz: 'Toʻliq ism' },
  'auth.phoneNumber': { en: 'Phone Number', ru: 'Номер телефона', uz: 'Telefon raqami' },
  'auth.email': { en: 'Email', ru: 'Email', uz: 'Email' },
  'auth.password': { en: 'Password', ru: 'Пароль', uz: 'Parol' },
  'auth.fullNamePlaceholder': { en: 'Enter your full name', ru: 'Введите полное имя', uz: 'Toʻliq ismingizni kiriting' },
  'auth.phonePlaceholder': { en: '90 123 45 67', ru: '90 123 45 67', uz: '90 123 45 67' },
  'auth.emailPlaceholder': { en: 'Enter your email', ru: 'Введите email', uz: 'Emailingizni kiriting' },
  'auth.passwordPlaceholder': { en: 'Enter your password', ru: 'Введите пароль', uz: 'Parolingizni kiriting' },
  'auth.toggleToSignup': { en: "Don't have an account? Sign up", ru: 'Нет аккаунта? Зарегистрируйтесь', uz: 'Hisob yoʻqmi? Roʻyxatdan oʻting' },
  'auth.toggleToLogin': { en: 'Already have an account? Sign in', ru: 'Уже есть аккаунт? Войти', uz: 'Allaqachon hisob bormi? Kirish' },
  'auth.signIn': { en: 'Sign In', ru: 'Войти', uz: 'Kirish' },
  'auth.signUp': { en: 'Create Account', ru: 'Создать аккаунт', uz: 'Roʻyxatdan oʻtish' },
  'auth.loading': { en: 'Loading...', ru: 'Загрузка...', uz: 'Yuklanmoqda...' },
  'auth.fillAllFields': { en: 'Please fill in all fields', ru: 'Пожалуйста, заполните все поля', uz: 'Iltimos, barcha maydonlarni toʻldiring' },
  'auth.userExists': { en: 'User with this email is already registered. You can reset your password.', ru: 'Пользователь с таким email уже зарегистрирован. Вы можете сбросить пароль.', uz: 'Bu email bilan foydalanuvchi allaqachon roʻyxatdan oʻtgan. Parolingizni tiklashingiz mumkin.' },
  'auth.accountCreatedTitle': { en: 'Account created successfully!', ru: 'Аккаунт успешно создан!', uz: 'Hisob muvaffaqiyatli yaratildi!' },
  'auth.accountCreatedDesc': { en: 'Please check your email to confirm your account.', ru: 'Пожалуйста, подтвердите аккаунт по ссылке в письме.', uz: 'Hisobingizni tasdiqlash uchun emailingizni tekshiring.' },
  'auth.resetPassword': { en: 'Reset password via email', ru: 'Сбросить пароль по email', uz: 'Email orqali parolni tiklash' },

  // Common
  'common.backToHome': { en: 'Back to Home', ru: 'На главную', uz: 'Bosh sahifaga qaytish' },
  'common.returnHome': { en: 'Return to Home', ru: 'Вернуться на главную', uz: 'Bosh sahifaga qaytish' },
  'common.tryAgain': { en: 'Try Again', ru: 'Повторить', uz: 'Qayta urinish' },
  'common.contactSupport': { en: 'Contact Support', ru: 'Связаться с поддержкой', uz: 'Yordam bilan bogʻlanish' },
  'common.passwordResetSent': { en: 'Password reset sent', ru: 'Письмо для сброса пароля отправлено', uz: 'Parolni tiklash xati yuborildi' },
  'common.checkEmailReset': { en: 'Check your email for reset instructions.', ru: 'Проверьте почту для инструкций по сбросу.', uz: 'Tiklash yoʻriqnomasi uchun emailingizni tekshiring.' },
  'common.listAnotherProperty': { en: 'List Another Property', ru: 'Разместить ещё объявление', uz: 'Yana bir eʼlon joylash' },
  'common.signOut': { en: 'Sign Out', ru: 'Выйти', uz: 'Chiqish' },
  'common.menu': { en: 'Menu', ru: 'Меню', uz: 'Menyu' },
  'common.viewDetails': { en: 'View Details', ru: 'Посмотреть детали', uz: 'Batafsil koʻrish' },
  'common.viewAllProperties': { en: 'View All Properties', ru: 'Посмотреть все объекты', uz: 'Barcha uylarni koʻrish' },
  'common.messages': { en: 'Messages', ru: 'Сообщения', uz: 'Xabarlar' },
  'common.chat': { en: 'Chat', ru: 'Чат', uz: 'Chat' },
  'common.refresh': { en: 'Refresh', ru: 'Обновить', uz: 'Yangilash' },
  'common.noMessagesYet': { en: 'No messages yet.', ru: 'Пока нет сообщений.', uz: 'Hali xabarlar yoʻq.' },
  'common.close': { en: 'Close', ru: 'Закрыть', uz: 'Yopish' },
  'header.myProperties': { en: 'My Properties', ru: 'Мои объекты', uz: 'Mening uylarim' },
  'header.saved': { en: 'Saved', ru: 'Сохранённые', uz: 'Saqlangan' },
  'header.visitRequests': { en: 'Visit Requests', ru: 'Заявки на просмотр', uz: 'Koʻrish soʻrovlari' },
  'header.listProperty': { en: 'List Property', ru: 'Разместить объект', uz: 'Uy joylash' },
  'header.dashboard': { en: 'Dashboard', ru: 'Панель управления', uz: 'Boshqaruv paneli' },
  'header.profile': { en: 'Profile', ru: 'Профиль', uz: 'Profil' },
  'header.myListedProperties': { en: 'My Listed Properties', ru: 'Мои размещённые объекты', uz: 'Mening joylashgan uylarim' },
  'header.savedProperties': { en: 'Saved Properties', ru: 'Сохранённые объекты', uz: 'Saqlangan uylar' },
  'header.listNewProperty': { en: 'List New Property', ru: 'Разместить новый объект', uz: 'Yangi uy joylash' },

  // Payment
  'payment.cancelled.title': { en: 'Payment Cancelled', ru: 'Платёж отменён', uz: 'Toʻlov bekor qilindi' },
  'payment.cancelled.desc': { en: 'Your payment was cancelled. You can try again or return to the application.', ru: 'Платёж был отменён. Вы можете попробовать снова или вернуться в приложение.', uz: 'Toʻlov bekor qilindi. Qayta urinishingiz yoki ilovaga qaytishingiz mumkin.' },
  'payment.success.title': { en: 'Payment Successful!', ru: 'Платёж успешен!', uz: 'Toʻlov muvaffaqiyatli!' },
  'payment.success.desc': { en: 'Your payment has been processed successfully. Your property listing application is now being reviewed.', ru: 'Ваш платёж успешно обработан. Ваша заявка на размещение объявления рассматривается.', uz: 'Toʻlovingiz muvaffaqiyatli amalga oshirildi. Eʼloningiz koʻrib chiqilmoqda.' },

  // Not Found
  'notFound.subtitle': { en: 'Oops! Page not found', ru: 'Упс! Страница не найдена', uz: 'Uzr! Sahifa topilmadi' },

  // Property Edit
  'edit.enableHalalFinancing': { en: 'Enable Halal Financing', ru: 'Включить Халяль финансирование', uz: 'Halol moliyani yoqish' },
  'edit.halalPendingApproval': { en: 'Halal financing approval is pending. You will be notified once it\'s reviewed.', ru: 'Одобрение халяль финансирования ожидается. Вы получите уведомление после рассмотрения.', uz: 'Halol moliya tasdiqlanishi kutilmoqda. Ko\'rib chiqilgandan so\'ng sizga xabar beriladi.' },
  'edit.halalApproved': { en: 'Halal financing has been approved for this property. You can toggle it on/off as needed.', ru: 'Халяль финансирование одобрено для этого объекта. Вы можете включать/выключать по необходимости.', uz: 'Ushbu mulk uchun halol moliya tasdiqlangan. Kerak bo\'lganda yoqib/o\'chirib turishingiz mumkin.' },

  // Visit status
  'visit.confirmed': { en: 'confirmed', ru: 'подтверждено', uz: 'tasdiqlangan' },
  'visit.pending': { en: 'pending', ru: 'ожидается', uz: 'kutilmoqda' },
  'visit.cancelled': { en: 'cancelled', ru: 'отменено', uz: 'bekor qilingan' },
  'visit.completed': { en: 'completed', ru: 'завершено', uz: 'tugallangan' },
  'visit.expired': { en: 'expired', ru: 'истекло', uz: 'muddati tugagan' },

  // General UI
  'common.noUpcomingVisits': { en: 'No upcoming visits', ru: 'Нет предстоящих визитов', uz: 'Kelgusidagi tashriflar yo\'q' },
  'common.moreVisits': { en: 'more visits', ru: 'ещё визитов', uz: 'yana tashriflar' },
  'common.additionalNotes': { en: 'Additional notes (optional)', ru: 'Дополнительные заметки (необязательно)', uz: 'Qo\'shimcha eslatmalar (ixtiyoriy)' },
  'common.shareExperience': { en: 'Share your experience or notes about this visit...', ru: 'Поделитесь опытом или заметками об этом визите...', uz: 'Ushbu tashrif haqida tajribangiz yoki eslatmalaringizni ulashing...' },
  

  // Admin
  'admin.pending': { en: 'pending', ru: 'ожидает', uz: 'kutilmoqda' },
  'admin.approved': { en: 'approved', ru: 'одобрено', uz: 'tasdiqlangan' },
  'admin.rejected': { en: 'rejected', ru: 'отклонено', uz: 'rad etilgan' },
  'admin.saveFailed': { en: 'Failed to save review', ru: 'Не удалось сохранить отзыв', uz: 'Sharhni saqlash muvaffaqiyatsiz' },

  // Property Management
  'property.edit': { en: 'Edit', ru: 'Редактировать', uz: 'Tahrirlash' },
  'property.saveChanges': { en: 'Save Changes', ru: 'Сохранить изменения', uz: 'O\'zgarishlarni saqlash' },
  'property.generalInfo': { en: 'General Info', ru: 'Общая информация', uz: 'Umumiy ma\'lumot' },
  'property.photos': { en: 'Photos', ru: 'Фотографии', uz: 'Suratlar' },
  'property.financing': { en: 'Financing', ru: 'Финансирование', uz: 'Moliyalashtirish' },
  'property.displayName': { en: 'Display Name', ru: 'Отображаемое имя', uz: 'Ko\'rsatiladigan nom' },
  'property.displayNamePlaceholder': { en: 'Enter property name', ru: 'Введите название объекта', uz: 'Mulk nomini kiriting' },
  'property.price': { en: 'Price (USD)', ru: 'Цена (USD)', uz: 'Narx (USD)' },

  // Photo management
  'photo.dragToReorder': { en: 'Drag to reorder • First photo will be the primary image', ru: 'Перетащите для изменения порядка • Первое фото станет главным', uz: 'Tartibni o\'zgartirish uchun sudrang • Birinchi surat asosiy bo\'ladi' },
  'photo.uploading': { en: 'Uploading...', ru: 'Загрузка...', uz: 'Yuklanmoqda...' },
  'photo.addPhotos': { en: 'Add Photos', ru: 'Добавить фото', uz: 'Surat qo\'shish' },
  'photo.propertyPhotos': { en: 'Property Photos', ru: 'Фотографии объекта', uz: 'Mulk suratlari' },
  'photo.primary': { en: 'Primary', ru: 'Главное', uz: 'Asosiy' },
  'photo.tooMany': { en: 'Too many photos', ru: 'Слишком много фото', uz: 'Juda ko\'p surat' },
  'photo.maxAllowed': { en: 'Maximum 20 photos allowed', ru: 'Максимум 20 фотографий', uz: 'Maksimum 20 ta surat mumkin' },
  'photo.uploaded': { en: 'Photos uploaded', ru: 'Фото загружены', uz: 'Suratlar yuklandi' },
  'photo.uploadedSuccess': { en: 'photo(s) uploaded successfully', ru: 'фото успешно загружены', uz: 'surat muvaffaqiyatli yuklandi' },
  'photo.uploadFailed': { en: 'Upload failed', ru: 'Загрузка не удалась', uz: 'Yuklash muvaffaqiyatsiz' },
  'photo.failedToUpload': { en: 'Failed to upload photos', ru: 'Не удалось загрузить фото', uz: 'Suratlarni yuklash muvaffaqiyatsiz' },
  'photo.cannotRemove': { en: 'Cannot remove', ru: 'Нельзя удалить', uz: 'O\'chirib bo\'lmaydi' },
  'photo.oneRequired': { en: 'At least one photo is required', ru: 'Требуется минимум одно фото', uz: 'Kamida bitta surat kerak' },
  'photo.noPhotos': { en: 'No photos uploaded yet', ru: 'Фото пока не загружены', uz: 'Hali suratlar yuklanmagan' },
  'photo.clickToUpload': { en: 'Click "Add Photos" to upload property images', ru: 'Нажмите "Добавить фото" для загрузки изображений объекта', uz: 'Mulk suratlarini yuklash uchun "Surat qo\'shish" tugmasini bosing' },

  // Missing common translations
  'common.saving': { en: 'Saving...', ru: 'Сохранение...', uz: 'Saqlanmoqda...' },
  'common.updated': { en: 'Property updated successfully', ru: 'Объект успешно обновлен', uz: 'Mulk muvaffaqiyatli yangilandi' },
  'common.updateFailed': { en: 'Failed to update property', ru: 'Не удалось обновить объект', uz: 'Mulkni yangilash muvaffaqiyatsiz' },

  'common.live': {
    en: 'Live',
    ru: 'Вживую', 
    uz: 'Jonli'
  },
  'common.verified': {
    en: 'Verified',
    ru: 'Проверено',
    uz: 'Tekshirilgan'
  },
  'common.protected': {
    en: 'Protected',
    ru: 'Защищено',
    uz: 'Himoyalangan'
  },
  'search.find': {
    en: 'Find',
    ru: 'Найти',
    uz: 'Topish'
  },

  // Map-related translations
  'map.loading': {
    en: 'Loading map...',
    ru: 'Загрузка карты...',
    uz: 'Xarita yuklanmoqda...'
  },
  'map.loadingMessage': {
    en: 'Please wait while we load the interactive map',
    ru: 'Пожалуйста, подождите, пока мы загружаем интерактивную карту',
    uz: 'Iltimos, interaktiv xarita yuklanayotganda kuting'
  },
  'map.error': {
    en: 'Map Error',
    ru: 'Ошибка карты',
    uz: 'Xarita xatosi'
  },
  'map.errorMessage': {
    en: 'Failed to load the map. Please check your connection.',
    ru: 'Не удалось загрузить карту. Проверьте подключение к интернету.',
    uz: 'Xaritani yuklashda xatolik. Internet aloqangizni tekshiring.'
  },
  'map.offline': {
    en: 'No Connection',
    ru: 'Нет соединения',
    uz: 'Ulanish yo\'q'
  },
  'map.offlineMessage': {
    en: 'You\'re offline. Check your internet connection to load the map.',
    ru: 'Вы не в сети. Проверьте подключение к интернету для загрузки карты.',
    uz: 'Siz offlaynsiz. Xaritani yuklash uchun internet aloqangizni tekshiring.'
  },
  'map.unknown': {
    en: 'Unknown Error',
    ru: 'Неизвестная ошибка',
    uz: 'Noma\'lum xato'
  },
  'map.unknownMessage': {
    en: 'An unexpected error occurred while loading the map.',
    ru: 'Произошла неожиданная ошибка при загрузке карты.',
    uz: 'Xaritani yuklashda kutilmagan xatolik yuz berdi.'
  },
  'map.retry': {
    en: 'Try Again',
    ru: 'Попробовать снова',
    uz: 'Qayta urinish'
  },
  'map.reload': {
    en: 'Reload Map',
    ru: 'Перезагрузить карту',
    uz: 'Xaritani qayta yuklash'
  },
  'map.locateMe': {
    en: 'Locate Me',
    ru: 'Найти меня',
    uz: 'Meni topish'
  },
  'map.bed': {
    en: 'bed',
    ru: 'спальня',
    uz: 'yotoq xona'
  },
  'map.bath': {
    en: 'bath',
    ru: 'ванная',
    uz: 'hammom'
  },
  'map.myListing': {
    en: 'My Listing',
    ru: 'Мое объявление',
    uz: 'Mening e\'lonim'
  },

  // Notifications translations
  'notifications.title': {
    en: 'Notifications',
    ru: 'Уведомления',
    uz: 'Bildirishnomalar'
  },
  'notifications.markAllAsRead': {
    en: 'Mark all as read',
    ru: 'Отметить все как прочитанные',
    uz: 'Barchasini o\'qilgan deb belgilash'
  },
  'notifications.allCaughtUp': {
    en: 'You\'re all caught up!',
    ru: 'Все уведомления прочитаны!',
    uz: 'Siz hamma narsadan xabardorsiz!'
  },
  'notifications.showingLatest': {
    en: 'Showing latest',
    ru: 'Показаны последние',
    uz: 'Eng so\'nggisi ko\'rsatilmoqda'
  },
  'notifications.of': {
    en: 'of',
    ru: 'из',
    uz: 'dan'
  },

  // Notification types
  'notification.message.new': {
    en: 'New message',
    ru: 'Новое сообщение',
    uz: 'Yangi xabar'
  },
  'notification.message.reply': {
    en: 'Message reply',
    ru: 'Ответ на сообщение',
    uz: 'Xabarga javob'
  },
  'notification.visit.new': {
    en: 'New visit request',
    ru: 'Новая заявка на просмотр',
    uz: 'Yangi ko\'rish so\'rovi'
  },
  'notification.visit.approved': {
    en: 'Visit approved',
    ru: 'Просмотр одобрен',
    uz: 'Ko\'rish tasdiqlandi'
  },
  'notification.visit.denied': {
    en: 'Visit denied',
    ru: 'Просмотр отклонен',
    uz: 'Ko\'rish rad etildi'
  },
  'notification.visit.proposal': {
    en: 'Alternative time proposed',
    ru: 'Предложено альтернативное время',
    uz: 'Muqobil vaqt taklif qilindi'
  },
  'notification.financing.assigned': {
    en: 'Financing request assigned',
    ru: 'Заявка на финансирование назначена',
    uz: 'Moliyalashtirish so\'rovi tayinlandi'
  },
  'notification.financing.approved': {
    en: 'Financing approved',
    ru: 'Финансирование одобрено',
    uz: 'Moliyalashtirish tasdiqlandi'
  },
  'notification.financing.rejected': {
    en: 'Financing rejected',
    ru: 'Финансирование отклонено',
    uz: 'Moliyalashtirish rad etildi'
  },
  'notification.financing.documents_required': {
    en: 'Documents required',
    ru: 'Требуются документы',
    uz: 'Hujjatlar talab qilinadi'
  },
  'notification.financing.under_review': {
    en: 'Under review',
    ru: 'На рассмотрении',
    uz: 'Ko\'rib chiqilmoqda'
  },
  'notification.property.verified': {
    en: 'Property verified',
    ru: 'Недвижимость верифицирована',
    uz: 'Mulk tasdiqlandi'
  },
  'notification.property.approved': {
    en: 'Property approved',
    ru: 'Недвижимость одобрена',
    uz: 'Mulk tasdiqlandi'
  },
  'notification.property.rejected': {
    en: 'Property rejected',
    ru: 'Недвижимость отклонена',
    uz: 'Mulk rad etildi'
  },
  'notification.property.sold': {
    en: 'Property sold',
    ru: 'Недвижимость продана',
    uz: 'Mulk sotildi'
  },
  'notification.property.financing_listed': {
    en: 'Property listed for financing',
    ru: 'Недвижимость добавлена для финансирования',
    uz: 'Mulk moliyalashtirish uchun qo\'shildi'
  },
  'notification.property.halal_approved': {
    en: 'Halal financing approved',
    ru: 'Халяльное финансирование одобрено',
    uz: 'Halol moliyalashtirish tasdiqlandi'
  },
  'notification.property.halal_denied': {
    en: 'Halal financing denied',
    ru: 'Халяльное финансирование отклонено',
    uz: 'Halol moliyalashtirish rad etildi'
  },
  'notification.saved.new': {
    en: 'Property saved',
    ru: 'Недвижимость сохранена',
    uz: 'Mulk saqlandi'
  },

  // Additional notification types
  'notification.visit.no_show': {
    en: 'Visit no-show',
    ru: 'Неявка на просмотр',
    uz: 'Ko\'rib chiqishga kelmadi'
  },
  'notification.financing.stage_change': {
    en: 'Status update',
    ru: 'Обновление статуса',
    uz: 'Status yangilanishi'
  },
  'notification.financing.documents_complete': {
    en: 'Documents complete',
    ru: 'Документы готовы',
    uz: 'Hujjatlar tayyor'
  },
  'notification.financing.final_approval': {
    en: 'Final approval',
    ru: 'Окончательное одобрение',
    uz: 'Yakuniy tasdiqlash'
  },
  'notification.financing.sent_back': {
    en: 'Request sent back',
    ru: 'Заявка возвращена',
    uz: 'So\'rov qaytarildi'
  },
  'notification.support.ticket_new': {
    en: 'New support ticket',
    ru: 'Новый запрос в поддержку',
    uz: 'Yangi yordam so\'rovi'
  },
  'notification.support.ticket_escalated': {
    en: 'Ticket escalated',
    ru: 'Запрос эскалирован',
    uz: 'So\'rov eskalatsiya qilindi'
  },
  'notification.report.new': {
    en: 'New report',
    ru: 'Новый отчет',
    uz: 'Yangi hisobot'
  },

  // Notification bodies
  'notification.body.message.new': {
    en: 'You have received a new message',
    ru: 'Вы получили новое сообщение',
    uz: 'Yangi xabar oldingiz'
  },
  'notification.body.visit.new': {
    en: 'Someone wants to visit your property',
    ru: 'Кто-то хочет посмотреть вашу недвижимость',
    uz: 'Kimdir mulkingizni ko\'rishni xohlaydi'
  },
  'notification.body.visit.approved': {
    en: 'Your visit request has been approved',
    ru: 'Ваша заявка на просмотр одобрена',
    uz: 'Ko\'rish so\'rovingiz tasdiqlandi'
  },
  'notification.body.visit.denied': {
    en: 'Your visit request has been denied',
    ru: 'Ваша заявка на просмотр отклонена',
    uz: 'Ko\'rish so\'rovingiz rad etildi'
  },
  'notification.body.financing.assigned': {
    en: 'Your financing request has been assigned to a specialist',
    ru: 'Ваша заявка на финансирование назначена специалисту',
    uz: 'Moliyalashtirish so\'rovingiz mutaxassisga tayinlandi'
  },
  'notification.body.financing.documents_required': {
    en: 'Additional documents are required for your financing request',
    ru: 'Для вашей заявки на финансирование требуются дополнительные документы',
    uz: 'Moliyalashtirish so\'rovingiz uchun qo\'shimcha hujjatlar kerak'
  },
  'notification.body.property.verified': {
    en: 'Your property has been successfully verified',
    ru: 'Ваша недвижимость успешно верифицирована',
    uz: 'Mulkingiz muvaffaqiyatli tasdiqlandi'
  },
  'notification.body.property.approved': {
    en: 'Your property listing has been approved and is now visible to buyers',
    ru: 'Ваше объявление о недвижимости одобрено и теперь видно покупателям',
    uz: 'Mulk e\'loningiz tasdiqlandi va endi xaridorlarga ko\'rinadi'
  },
  'notification.body.property.rejected': {
    en: 'Your property listing was rejected. Please review the feedback and resubmit',
    ru: 'Ваше объявление о недвижимости было отклонено. Пожалуйста, ознакомьтесь с отзывами и подайте заново',
    uz: 'Mulk e\'loningiz rad etildi. Iltimos, fikr-mulohazalarni ko\'rib chiqing va qayta yuboring'
  },
  'notification.body.property.halal_approved': {
    en: 'Your property has been approved for Sharia-compliant financing',
    ru: 'Ваша недвижимость одобрена для шариатского финансирования',
    uz: 'Mulkingiz shariat qoidalariga mos moliyalashtirish uchun tasdiqlandi'
  },
  'notification.body.property.halal_denied': {
    en: 'Your halal financing request has been denied. Contact support for details',
    ru: 'Ваша заявка на халяльное финансирование отклонена. Обратитесь в поддержку за подробностями',
    uz: 'Halol moliyalashtirish so\'rovingiz rad etildi. Tafsilotlar uchun qo\'llab-quvvatlash xizmatiga murojaat qiling'
  },

  // Additional notification body translations
  'notification.body.visit.no_show': {
    en: 'You did not show up for your scheduled visit',
    ru: 'Вы не явились на запланированный просмотр',
    uz: 'Rejalashtirilgan ko\'rib chiqishga kelmadingiz'
  },
  'notification.body.financing.stage_change': {
    en: 'Your financing request status has been updated',
    ru: 'Статус вашей заявки на финансирование обновлен',
    uz: 'Moliyalashtirish so\'rovingiz holati yangilandi'
  },
  'notification.body.financing.documents_complete': {
    en: 'All required documents have been submitted',
    ru: 'Все необходимые документы предоставлены',
    uz: 'Barcha kerakli hujjatlar taqdim etildi'
  },
  'notification.body.financing.final_approval': {
    en: 'Your financing request has received final approval',
    ru: 'Ваша заявка на финансирование получила окончательное одобрение',
    uz: 'Moliyalashtirish so\'rovingiz yakuniy tasdiqlandi'
  },
  'notification.body.financing.sent_back': {
    en: 'Your financing request has been sent back for revisions',
    ru: 'Ваша заявка на финансирование возвращена на доработку',
    uz: 'Moliyalashtirish so\'rovingiz qayta ko\'rib chiqish uchun qaytarildi'
  },
  'notification.body.support.ticket_new': {
    en: 'A new support ticket has been created',
    ru: 'Создан новый запрос в поддержку',
    uz: 'Yangi yordam so\'rovi yaratildi'
  },
  'notification.body.support.ticket_escalated': {
    en: 'Your support ticket has been escalated',
    ru: 'Ваш запрос в поддержку эскалирован',
    uz: 'Yordam so\'rovingiz eskalatsiya qilindi'
  },
  'notification.body.report.new': {
    en: 'A new report has been generated',
    ru: 'Создан новый отчет',
    uz: 'Yangi hisobot yaratildi'
  },

  // Visit and Alternative Time Offer translations
  'visit.alternativeTimeOffered': {
    en: 'Alternative Time Offered',
    ru: 'Предложено альтернативное время',
    uz: 'Muqobil vaqt taklif etildi'
  },
  'visit.ownerProposedDifferentTime': {
    en: 'The property owner has proposed a different time for your visit:',
    ru: 'Владелец недвижимости предложил другое время для вашего визита:',
    uz: 'Mulk egasi tashrif uchun boshqa vaqt taklif qildi:'
  },
  'visit.acceptTime': {
    en: 'Accept',
    ru: 'Принять',
    uz: 'Qabul qilish'
  },
  'visit.counterOffer': {
    en: 'Counter-offer',
    ru: 'Встречное предложение',
    uz: 'Qarshi taklif'
  },
  'visit.message': {
    en: 'Message',
    ru: 'Сообщение',
    uz: 'Xabar'
  },
  'visit.cancel': {
    en: 'Cancel',
    ru: 'Отменить',
    uz: 'Bekor qilish'
  },
  'visit.cancelRequestTitle': {
    en: 'Cancel visit request?',
    ru: 'Отменить заявку на посещение?',
    uz: 'Tashrif so\'rovini bekor qilishni istaysizmi?'
  },
  'visit.cancelRequestDesc': {
    en: 'This will permanently cancel your visit request. You won\'t be able to recover it.',
    ru: 'Это навсегда отменит вашу заявку на посещение. Вы не сможете её восстановить.',
    uz: 'Bu sizning tashrif so\'rovingizni butunlay bekor qiladi. Uni tiklashning iloji bo\'lmaydi.'
  },
  'visit.keepRequest': {
    en: 'Keep request',
    ru: 'Оставить заявку',
    uz: 'So\'rovni saqlash'
  },
  'visit.yesCancel': {
    en: 'Yes, cancel',
    ru: 'Да, отменить',
    uz: 'Ha, bekor qilish'
  },
  'visit.proposePreferredTime': {
    en: 'Propose your preferred time',
    ru: 'Предложите удобное время',
    uz: 'Qulay vaqtingizni taklif qiling'
  },
  'visit.date': {
    en: 'Date',
    ru: 'Дата',
    uz: 'Sana'
  },
  'visit.time': {
    en: 'Time',
    ru: 'Время',
    uz: 'Vaqt'
  },
  'visit.sendCounterOffer': {
    en: 'Send Counter-offer',
    ru: 'Отправить встречное предложение',
    uz: 'Qarshi taklifni yuborish'
  },
  'visit.messagePropertyOwner': {
    en: 'Message Property Owner',
    ru: 'Сообщение владельцу',
    uz: 'Mulk egasiga xabar'
  },
  'visit.typeMessageAboutTime': {
    en: 'Type your message about the visit time...',
    ru: 'Напишите сообщение о времени посещения...',
    uz: 'Tashrif vaqti haqida xabaringizni yozing...'
  },
  'visit.sendMessage': {
    en: 'Send Message',
    ru: 'Отправить сообщение',
    uz: 'Xabar yuborish'
  },
  'visit.alternativeTimeAccepted': {
    en: 'Alternative time accepted',
    ru: 'Альтернативное время принято',
    uz: 'Muqobil vaqt qabul qilindi'
  },
  'visit.visitConfirmedNewTime': {
    en: 'Your visit has been confirmed for the new time.',
    ru: 'Ваш визит подтвержден на новое время.',
    uz: 'Sizning tashrifingiz yangi vaqt uchun tasdiqlandi.'
  },
  'visit.counterOfferSent': {
    en: 'Counter-offer sent',
    ru: 'Встречное предложение отправлено',
    uz: 'Qarshi taklif yuborildi'
  },
  'visit.alternativeTimeProposalSent': {
    en: 'Your alternative time proposal has been sent to the property owner.',
    ru: 'Ваше предложение альтернативного времени отправлено владельцу недвижимости.',
    uz: 'Sizning muqobil vaqt taklifingiz mulk egasiga yuborildi.'
  },
  'visit.messageSent': {
    en: 'Message sent',
    ru: 'Сообщение отправлено',
    uz: 'Xabar yuborildi'
  },
  'visit.visitRequestCancelled': {
    en: 'Visit request cancelled',
    ru: 'Заявка на посещение отменена',
    uz: 'Tashrif so\'rovi bekor qilindi'
  },
  'visit.visitRequestCancelledDesc': {
    en: 'Your visit request has been cancelled.',
    ru: 'Ваша заявка на посещение была отменена.',
    uz: 'Sizning tashrif so\'rovingiz bekor qilindi.'
  },
  'visit.selectBothDateTime': {
    en: 'Please select both date and time',
    ru: 'Пожалуйста, выберите дату и время',
    uz: 'Iltimos, sana va vaqtni tanlang'
  },
  'visit.enterMessage': {
    en: 'Please enter a message',
    ru: 'Пожалуйста, введите сообщение',
    uz: 'Iltimos, xabar kiriting'
  },
  'visit.failedAcceptTime': {
    en: 'Failed to accept alternative time',
    ru: 'Не удалось принять альтернативное время',
    uz: 'Muqobil vaqtni qabul qilish muvaffaqiyatsiz'
  },
  'visit.failedSendCounterOffer': {
    en: 'Failed to send counter-offer',
    ru: 'Не удалось отправить встречное предложение',
    uz: 'Qarshi taklifni yuborishda xatolik'
  },
  'visit.failedSendMessage': {
    en: 'Failed to send message',
    ru: 'Не удалось отправить сообщение',
    uz: 'Xabar yuborishda xatolik'
  },
  'visit.failedCancelRequest': {
    en: 'Failed to cancel request',
    ru: 'Не удалось отменить заявку',
    uz: 'So\'rovni bekor qilishda xatolik'
  },


  // Payment methods translations
  'payment.selectMethod': {
    en: 'Select Payment Method',
    ru: 'Выберите способ оплаты',
    uz: 'To\'lov usulini tanlang'
  },
  'payment.payWithPayme': {
    en: 'Pay with Payme wallet',
    ru: 'Оплатить через Payme кошелек',
    uz: 'Payme hamyoni orqali to\'lash'
  },
  'payment.payWithClick': {
    en: 'Pay with Click payment system',
    ru: 'Оплатить через платежную систему Click',
    uz: 'Click to\'lov tizimi orqali to\'lash'
  },
  'payment.payWithUzum': {
    en: 'Pay with Uzum Bank card',
    ru: 'Оплатить картой Uzum Bank',
    uz: 'Uzum Bank kartasi orqali to\'lash'
  },
  'payment.processing': {
    en: 'Processing...',
    ru: 'Обработка...',
    uz: 'Qayta ishlanmoqda...'
  },
  'payment.payNow': {
    en: 'Pay Now',
    ru: 'Оплатить сейчас',
    uz: 'Hozir to\'lash'
  },
  'payment.paymentError': {
    en: 'Payment Error',
    ru: 'Ошибка платежа',
    uz: 'To\'lov xatosi'
  },
  'payment.failedInitiate': {
    en: 'Failed to initiate payment. Please try again.',
    ru: 'Не удалось инициировать платеж. Попробуйте еще раз.',
    uz: 'To\'lovni boshlashda xatolik. Qayta urinib ko\'ring.'
  },
  'payment.selectMethodFirst': {
    en: 'Please select a payment method',
    ru: 'Пожалуйста, выберите способ оплаты',
    uz: 'Iltimos, to\'lov usulini tanlang'
  },

  // Visit payment dialog translations
  'visitPayment.paymentRequired': {
    en: 'Payment Required',
    ru: 'Требуется оплата',
    uz: 'To\'lov talab qilinadi'
  },
  'visitPayment.usedFreeVisit': {
    en: 'You\'ve already used your free visit request this week',
    ru: 'Вы уже использовали бесплатную заявку на посещение на этой неделе',
    uz: 'Siz bu hafta tekin tashrif so\'rovingizdan foydalandingiz'
  },
  'visitPayment.additionalCost': {
    en: 'Additional visit cost: 50,000 UZS',
    ru: 'Стоимость дополнительного визита: 50,000 сум',
    uz: 'Qo\'shimcha tashrif narxi: 50,000 so\'m'
  },
  'visitPayment.clickPayment': {
    en: 'Click Payment',
    ru: 'Click Платеж',
    uz: 'Click to\'lov'
  },
  'visitPayment.payWithBankCard': {
    en: 'Pay with bank card',
    ru: 'Оплатить банковской картой',
    uz: 'Bank kartasi orqali to\'lash'
  },
  'visitPayment.payme': {
    en: 'Payme',
    ru: 'Payme',
    uz: 'Payme'
  },
  'visitPayment.payWithPaymeWallet': {
    en: 'Pay with Payme wallet',
    ru: 'Оплатить через Payme кошелек',
    uz: 'Payme hamyoni orqali to\'lash'
  },
  'visitPayment.uzumBank': {
    en: 'Uzum Bank',
    ru: 'Uzum Bank',
    uz: 'Uzum Bank'
  },
  'visitPayment.payWithUzumBank': {
    en: 'Pay with Uzum Bank',
    ru: 'Оплатить через Uzum Bank',
    uz: 'Uzum Bank orqali to\'lash'
  },
  'visitPayment.paymentSuccessful': {
    en: 'Payment successful!',
    ru: 'Платеж успешен!',
    uz: 'To\'lov muvaffaqiyatli!'
  },
  'visitPayment.visitRequestCreated': {
    en: 'Visit request created.',
    ru: 'Заявка на посещение создана.',
    uz: 'Tashrif so\'rovi yaratildi.'
  },
  'visitPayment.paymentFailed': {
    en: 'Payment failed',
    ru: 'Платеж не удался',
    uz: 'To\'lov muvaffaqiyatsiz'
  },
  'visitPayment.pleaseRetry': {
    en: 'Please try again.',
    ru: 'Попробуйте еще раз.',
    uz: 'Qayta urinib ko\'ring.'
  },

  // Visit limit checker translations
  'visitLimit.restricted': {
    en: 'Visit Requests Restricted',
    ru: 'Заявки на посещение ограничены',
    uz: 'Tashrif so\'rovlari cheklangan'
  },
  'visitLimit.duplicateNotAllowed': {
    en: 'Duplicate Request Not Allowed',
    ru: 'Повторная заявка не разрешена',
    uz: 'Takroriy so\'rov ruxsat etilmagan'
  },
  'visitLimit.limitReached': {
    en: 'Visit Limit Reached',
    ru: 'Лимит посещений достигнут',
    uz: 'Tashrif chegarasiga yetildi'
  },
  'visitLimit.close': {
    en: 'Close',
    ru: 'Закрыть',
    uz: 'Yopish'
  },

  // Visit restriction dialog translations
  'visitRestriction.restrictUser': {
    en: 'Restrict User',
    ru: 'Ограничить пользователя',
    uz: 'Foydalanuvchini cheklash'
  },
  'visitRestriction.reasonForRestriction': {
    en: 'Reason for restriction',
    ru: 'Причина ограничения',
    uz: 'Cheklash sababi'
  },
  'visitRestriction.permanentRestriction': {
    en: 'Permanent restriction',
    ru: 'Постоянное ограничение',
    uz: 'Doimiy cheklash'
  },
  'visitRestriction.restrictedUntil': {
    en: 'Restricted until',
    ru: 'Ограничено до',
    uz: 'Cheklash muddati'
  },
  'visitRestriction.pickDate': {
    en: 'Pick a date',
    ru: 'Выберите дату',
    uz: 'Sanani tanlang'
  },

  // Visit warning dialog translations (Russian text was hardcoded)
  'visitWarning.importantWarning': {
    en: 'Important Warning',
    ru: 'Важное предупреждение',
    uz: 'Muhim ogohlantirish'
  },
  'visitWarning.cancellationWarning': {
    en: 'Cancellation Warning',
    ru: 'Предупреждение об отмене',
    uz: 'Bekor qilish haqida ogohlantirish'
  },
  'visitWarning.attentionToRules': {
    en: 'Please pay attention to the property visit rules:',
    ru: 'Обратите внимание на правила посещения недвижимости:',
    uz: 'Ko\'chmas mulkni ziyorat qilish qoidalariga e\'tibor bering:'
  },
  'visitWarning.firstCancellation': {
    en: 'First cancellation or no-show: Warning',
    ru: 'Первая отмена или неявка: Предупреждение',
    uz: 'Birinchi bekor qilish yoki kelmay qolish: Ogohlantirish'
  },
  'visitWarning.secondCancellation': {
    en: 'Second cancellation or no-show: 1 week ban',
    ru: 'Вторая отмена или неявка: Запрет на 1 неделю',
    uz: 'Ikkinchi bekor qilish yoki kelmay qolish: 1 haftalik taqiq'
  },
  'visitWarning.thirdCancellation': {
    en: 'Third cancellation or no-show: 1 month ban',
    ru: 'Третья отмена или неявка: Запрет на 1 месяц',
    uz: 'Uchinchi bekor qilish yoki kelmay qolish: 1 oylik taqiq'
  },
  'visitWarning.repeatedViolations': {
    en: 'Repeated violations may lead to permanent account suspension',
    ru: 'Повторные нарушения могут привести к пожизненной блокировке аккаунта',
    uz: 'Takroriy buzilishlar hisobning doimiy bloklashiga olib kelishi mumkin'
  },
  'visitWarning.bansApplyToBoth': {
    en: 'Bans apply to both visit requests and halal financing applications.',
    ru: 'Запреты действуют как на заявки на посещение, так и на заявки на халяльное финансирование.',
    uz: 'Taqiqlar ham tashrif so\'rovlariga, ham halol moliyalashtirish arizalariga tegishli.'
  },
  'visitWarning.sureToCancel': {
    en: 'Are you sure you want to cancel the confirmed visit?',
    ru: 'Вы уверены, что хотите отменить подтвержденное посещение?',
    uz: 'Tasdiqlangan tashrifni bekor qilishni istaysizmi?'
  },
  'visitWarning.cancelConfirmedVisit': {
    en: 'Cancelling a confirmed visit may result in penalties:',
    ru: 'Отмена подтвержденного посещения может привести к наложению штрафных санкций:',
    uz: 'Tasdiqlangan tashrifni bekor qilish jarimaga olib kelishi mumkin:'
  },
  'visitWarning.temporaryBlock': {
    en: 'Temporary block on creating new requests',
    ru: 'Временная блокировка создания новых заявок',
    uz: 'Yangi so\'rovlar yaratishda vaqtinchalik bloklash'
  },
  'visitWarning.restrictedFinancing': {
    en: 'Restricted access to halal financing',
    ru: 'Ограничение доступа к халяльному финансированию',
    uz: 'Halol moliyalashtirishga kirish cheklovi'
  },
  'visitWarning.repeatedViolationsBlock': {
    en: 'Account suspension for repeated violations',
    ru: 'При повторных нарушениях - блокировка аккаунта',
    uz: 'Takroriy buzilishlarda hisob bloklashi'
  },
  'visitWarning.notCancel': {
    en: 'Don\'t cancel',
    ru: 'Не отменять',
    uz: 'Bekor qilmaslik'
  },
  'visitWarning.understandContinue': {
    en: 'I understand, continue',
    ru: 'Понимаю, продолжить',
    uz: 'Tushundim, davom etish'
  },
  'visitWarning.confirmCancellation': {
    en: 'Confirm cancellation',
    ru: 'Подтвердить отмену',
    uz: 'Bekor qilishni tasdiqlash'
  },

  // Financing request box translations
  'financing.status': {
    en: 'Status',
    ru: 'Статус',
    uz: 'Holat'
  },
  'financing.pending': {
    en: 'Pending Review',
    ru: 'Ожидает рассмотрения',
    uz: 'Ko\'rib chiqilmoqda'
  },
  'financing.approved': {
    en: 'Approved',
    ru: 'Одобрено',
    uz: 'Tasdiqlangan'
  },
  'financing.rejected': {
    en: 'Rejected',
    ru: 'Отклонено',
    uz: 'Rad etilgan'
  },
  'financing.requestedAmount': {
    en: 'Requested Amount',
    ru: 'Запрашиваемая сумма',
    uz: 'So\'ralgan miqdor'
  },
  'financing.monthlyPayment': {
    en: 'Monthly Payment',
    ru: 'Ежемесячный платеж',
    uz: 'Oylik to\'lov'
  },
  'financing.term': {
    en: 'Term',
    ru: 'Срок',
    uz: 'Muddat'
  },
  'financing.months': {
    en: 'months',
    ru: 'месяцев',
    uz: 'oy'
  },
  'financing.interestRate': {
    en: 'Interest Rate',
    ru: 'Процентная ставка',
    uz: 'Foiz stavkasi'
  },
  'financing.perYear': {
    en: 'per year',
    ru: 'в год',
    uz: 'yiliga'
  },
  'financing.property': {
    en: 'Property',
    ru: 'Недвижимость',
    uz: 'Ko\'chmas mulk'
  },
  'financing.documents': {
    en: 'Documents',
    ru: 'Документы',
    uz: 'Hujjatlar'
  },
  'financing.activity': {
    en: 'Activity',
    ru: 'Активность',
    uz: 'Faoliyat'
  },
  'financing.uploadDocuments': {
    en: 'Upload Documents',
    ru: 'Загрузить документы',
    uz: 'Hujjatlar yuklash'
  },
  'financing.noDocuments': {
    en: 'No documents uploaded yet',
    ru: 'Документы еще не загружены',
    uz: 'Hali hujjatlar yuklanmagan'
  },
  'financing.clickToUpload': {
    en: 'Click "Upload Documents" to submit required files',
    ru: 'Нажмите "Загрузить документы" для отправки необходимых файлов',
    uz: 'Zarur fayllarni yuborish uchun "Hujjatlar yuklash" tugmasini bosing'
  },
  'financing.noActivityYet': {
    en: 'No activity recorded yet',
    ru: 'Активность пока не зафиксирована',
    uz: 'Hali faoliyat qayd etilmagan'
  },
  'financing.activityDescription': {
    en: 'Activity will appear here when documents are uploaded, status changes, or other actions are taken',
    ru: 'Активность появится здесь при загрузке документов, изменении статуса или других действиях',
    uz: 'Hujjatlar yuklanganda, holat o\'zgarganda yoki boshqa harakatlar amalga oshirilganda faoliyat bu yerda paydo bo\'ladi'
  },

  // Profile Page
  'profile.backToDashboard': {
    en: 'Back to Dashboard',
    ru: 'Вернуться на панель',
    uz: 'Boshqaruv paneliga qaytish'
  },
  'profile.title': {
    en: 'Profile',
    ru: 'Профиль',
    uz: 'Profil'
  },
  'profile.editProfile': {
    en: 'Edit Profile',
    ru: 'Редактировать профиль',
    uz: 'Profilni tahrirlash'
  },
  'profile.saveChanges': {
    en: 'Save Changes',
    ru: 'Сохранить изменения',
    uz: 'Oʻzgarishlarni saqlash'
  },
  'profile.cancel': {
    en: 'Cancel',
    ru: 'Отмена',
    uz: 'Bekor qilish'
  },
  'profile.personalInfo': {
    en: 'Personal Information',
    ru: 'Личная информация',
    uz: 'Shaxsiy maʼlumotlar'
  },
  'profile.fullName': {
    en: 'Full Name',
    ru: 'Полное имя',
    uz: 'Toʻliq ism'
  },
  'profile.email': {
    en: 'Email',
    ru: 'Электронная почта',
    uz: 'Elektron pochta'
  },
  'profile.phoneNumber': {
    en: 'Phone Number',
    ru: 'Номер телефона',
    uz: 'Telefon raqami'
  },
  'profile.showPhoneNumber': {
    en: 'Display phone number on listings',
    ru: 'Показывать номер телефона в объявлениях',
    uz: 'Eʼlonlarda telefon raqamini koʻrsatish'
  },
  'profile.showPhoneDescription': {
    en: 'When enabled, your phone number will be visible to potential buyers on all your property listings',
    ru: 'При включении ваш номер телефона будет виден потенциальным покупателям во всех ваших объявлениях',
    uz: 'Yoqilganda, telefon raqamingiz barcha mulk eʼlonlaringizda potentsial xaridorlarga koʻrinadi'
  },
  'auth.showPhoneOnListings': {
    en: 'Display my phone number on property listings',
    ru: 'Показывать мой номер телефона в объявлениях',
    uz: 'Mulk eʼlonlarida telefon raqamimni koʻrsatish'
  },
  'profile.accountType': {
    en: 'Account Type',
    ru: 'Тип аккаунта',
    uz: 'Akkaunt turi'
  },
  'profile.verificationStatus': {
    en: 'Verification Status',
    ru: 'Статус проверки',
    uz: 'Tekshiruv holati'
  },
  'profile.companyDetails': {
    en: 'Company Details',
    ru: 'Детали компании',
    uz: 'Kompaniya tafsilotlari'
  },
  'auth.registerAsCompany': {
    en: 'Are you registering as a company?',
    ru: 'Регистрируетесь как компания?',
    uz: 'Kompaniya sifatida ro\'yxatdan o\'tyapsizmi?'
  },
  'auth.signUpAsLegalEntity': {
    en: 'Sign up as a Legal Entity',
    ru: 'Зарегистрироваться как юридическое лицо',
    uz: 'Yuridik shaxs sifatida ro\'yxatdan o\'ting'
  },
  'auth.accountTypeIndividual': {
    en: 'Individual',
    ru: 'Физическое лицо',
    uz: 'Jismoniy shaxs'
  },
  'auth.accountTypeLegalEntity': {
    en: 'Legal Entity',
    ru: 'Юридическое лицо',
    uz: 'Yuridik shaxs'
  },
  'auth.companyName': {
    en: 'Company Name',
    ru: 'Название компании',
    uz: 'Kompaniya nomi'
  },
  'auth.registrationNumber': {
    en: 'Registration Number',
    ru: 'Регистрационный номер',
    uz: 'Ro\'yxatga olish raqami'
  },
  'auth.companyLicense': {
    en: 'Company License (Required)',
    ru: 'Лицензия компании (обязательно)',
    uz: 'Kompaniya litsenziyasi (majburiy)'
  },
  'auth.companyLogo': {
    en: 'Company Logo (Optional)',
    ru: 'Логотип компании (необязательно)',
    uz: 'Kompaniya logotipi (ixtiyoriy)'
  },
  'auth.contactPersonName': {
    en: 'Contact Person Name',
    ru: 'Имя контактного лица',
    uz: 'Aloqa shaxsining ismi'
  },
  'auth.companyDescription': {
    en: 'Company Description',
    ru: 'Описание компании',
    uz: 'Kompaniya tavsifi'
  },
  'auth.numberOfProperties': {
    en: 'Number of Properties (Optional)',
    ru: 'Количество объектов (необязательно)',
    uz: 'Mulklar soni (ixtiyoriy)'
  },
  'auth.pendingVerification': {
    en: 'Pending Verification',
    ru: 'Ожидает проверки',
    uz: 'Tekshiruv kutilmoqda'
  },
  'auth.verified': {
    en: 'Verified',
    ru: 'Проверено',
    uz: 'Tasdiqlangan'
  },
  'auth.verificationRejected': {
    en: 'Verification Rejected - Please resubmit',
    ru: 'Проверка отклонена - Пожалуйста, отправьте повторно',
    uz: 'Tekshiruv rad etildi - Iltimos, qayta yuboring'
  },
  'profile.identityVerification': {
    en: 'Identity Verification',
    ru: 'Подтверждение личности',
    uz: 'Shaxsni tasdiqlash'
  },
  'profile.uploadGovId': {
    en: 'Upload Government ID',
    ru: 'Загрузить удостоверение',
    uz: 'Davlat guvohnomasini yuklash'
  },
  'profile.takeSelfie': {
    en: 'Take Selfie',
    ru: 'Сделать селфи',
    uz: 'Selfi olish'
  },
  'profile.notVerified': {
    en: 'Not Verified',
    ru: 'Не подтверждено',
    uz: 'Tasdiqlanmagan'
  },
  'profile.visitLimitsPlan': {
    en: 'Visit Limits & Plan',
    ru: 'Лимиты посещений и план',
    uz: 'Tashrif chegaralari va reja'
  },
  'profile.currentUsage': {
    en: 'Current Usage',
    ru: 'Текущее использование',
    uz: 'Joriy foydalanish'
  },
  'profile.planDetails': {
    en: 'Plan Details',
    ru: 'Детали плана',
    uz: 'Reja tafsilotlari'
  },
  'profile.upgradePlan': {
    en: 'Upgrade Plan',
    ru: 'Обновить план',
    uz: 'Rejani yangilash'
  },
  'profile.accountSettings': {
    en: 'Account Settings',
    ru: 'Настройки аккаунта',
    uz: 'Akkaunt sozlamalari'
  },
  'profile.emailNotifications': {
    en: 'Email Notifications',
    ru: 'Email уведомления',
    uz: 'Email bildirishnomalar'
  },
  'profile.privacySettings': {
    en: 'Privacy Settings',
    ru: 'Настройки приватности',
    uz: 'Maxfiylik sozlamalari'
  },
  'profile.deleteAccount': {
    en: 'Delete Account',
    ru: 'Удалить аккаунт',
    uz: 'Akkautni oʻchirish'
  },
  'profile.saveSuccess': {
    en: 'Profile updated successfully',
    ru: 'Профиль успешно обновлен',
    uz: 'Profil muvaffaqiyatli yangilandi'
  },
  'profile.saveError': {
    en: 'Error updating profile',
    ru: 'Ошибка обновления профиля',
    uz: 'Profilni yangilashda xatolik'
  },
  'profile.verificationPrompt': {
    en: 'Complete identity verification to unlock all features and build trust with other users.',
    ru: 'Завершите верификацию личности, чтобы разблокировать все функции и заслужить доверие других пользователей.',
    uz: 'Barcha imkoniyatlarni ochish va boshqa foydalanuvchilar ishonchini qozonish uchun shaxsni tasdiqlovni tugallang.'
  },
  'profile.companyInfo': {
    en: 'Company Information',
    ru: 'Информация о компании',
    uz: 'Kompaniya haqida maʼlumot'
  },
  'profile.verificationPending': {
    en: 'Pending Verification',
    ru: 'Ожидает проверки',
    uz: 'Tekshiruv kutilmoqda'
  },
  'profile.verified': {
    en: 'Verified',
    ru: 'Проверено',
    uz: 'Tasdiqlangan'
  },
  'profile.verificationRejected': {
    en: 'Verification Rejected',
    ru: 'Проверка отклонена',
    uz: 'Tekshirish rad etildi'
  },
  'profile.entityVerification': {
    en: 'Entity Verification',
    ru: 'Верификация компании',
    uz: 'Kompaniya tekshiruvi'
  },
  'profile.entityVerificationDesc': {
    en: 'Upload documents to verify your company',
    ru: 'Загрузите документы для верификации вашей компании',
    uz: 'Kompaniyangizni tekshirish uchun hujjatlarni yuklang'
  },
  'profile.companyLicense': {
    en: 'Company License',
    ru: 'Лицензия компании',
    uz: 'Kompaniya litsenziyasi'
  },
  'profile.uploadLicense': {
    en: 'Upload License',
    ru: 'Загрузить лицензию',
    uz: 'Litsenziya yuklash'
  },
  'profile.uploadAdditional': {
    en: 'Upload Additional Documents',
    ru: 'Загрузить дополнительные документы',
    uz: 'Qo\'shimcha hujjatlar yuklash'
  },
  'profile.licenseUploaded': {
    en: 'License Uploaded',
    ru: 'Лицензия загружена',
    uz: 'Litsenziya yuklandi'
  },
  'profile.licenseDeleted': {
    en: 'License Deleted',
    ru: 'Лицензия удалена',
    uz: 'Litsenziya o\'chirildi'
  },
  'profile.companyLogo': {
    en: 'Company Logo',
    ru: 'Логотип компании',
    uz: 'Kompaniya logotipi'
  },
  'profile.uploadLogo': {
    en: 'Upload Logo',
    ru: 'Загрузить логотип',
    uz: 'Logotip yuklash'
  },
  'profile.changeLogo': {
    en: 'Change Logo',
    ru: 'Изменить логотип',
    uz: 'Logotipni o\'zgartirish'
  },
  'profile.logoUploaded': {
    en: 'Logo Uploaded',
    ru: 'Логотип загружен',
    uz: 'Logotip yuklandi'
  },
  'profile.logoDeleted': {
    en: 'Logo Deleted',
    ru: 'Логотип удален',
    uz: 'Logotip o\'chirildi'
  },
  'profile.verificationNotes': {
    en: 'Moderator Comments',
    ru: 'Комментарии модератора',
    uz: 'Moderator izohlari'
  },
  'profile.cannotDeleteAfterVerification': {
    en: 'Cannot delete document after verification',
    ru: 'Нельзя удалить документ после верификации',
    uz: 'Tekshiruvdan keyin hujjatni o\'chirish mumkin emas'
  },
  'profile.canAddAfterVerification': {
    en: 'Additional documents can be added after verification',
    ru: 'После верификации можно добавить дополнительные документы',
    uz: 'Tekshiruvdan keyin qo\'shimcha hujjatlar qo\'shish mumkin'
  },
  'profile.approved': {
    en: 'Approved',
    ru: 'Одобрено',
    uz: 'Tasdiqlandi'
  },
  'profile.rejected': {
    en: 'Rejected',
    ru: 'Отклонено',
    uz: 'Rad etildi'
  },
  'profile.pending': {
    en: 'Pending',
    ru: 'В ожидании',
    uz: 'Kutilmoqda'
  },
  'profile.notSubmitted': {
    en: 'Not Submitted',
    ru: 'Не отправлено',
    uz: 'Yuborilmagan'
  },
  'profile.thisWeekVisits': {
    en: "This Week's Visits",
    ru: 'Визиты на этой неделе',
    uz: 'Bu hafta tashrif'
  },
  'profile.visitsUsed': {
    en: 'used',
    ru: 'использовано',
    uz: 'ishlatilgan'
  },
  'profile.freeVisitsLeft': {
    en: 'Free Visits Left',
    ru: 'Осталось бесплатных визитов',
    uz: 'Bepul tashriflar qoldi'
  },
  'profile.oneFreeVisit': {
    en: '1 free visit',
    ru: '1 бесплатный визит',
    uz: '1 bepul tashrif'
  },
  'profile.noFreeVisits': {
    en: '0 free visits',
    ru: '0 бесплатных визитов',
    uz: '0 bepul tashrif'
  },
  'profile.visitRestricted': {
    en: 'Your visit requests are currently restricted. Contact support for assistance.',
    ru: 'Ваши запросы на посещение в настоящее время ограничены. Обратитесь в службу поддержки за помощью.',
    uz: 'Sizning tashrif soʻrovlaringiz hozirda cheklangan. Yordam uchun qoʻllab-quvvatlash xizmatiga murojaat qiling.'
  },
  'profile.currentPlan': {
    en: 'Current Plan: Free',
    ru: 'Текущий план: Бесплатный',
    uz: 'Joriy reja: Bepul'
  },
  'profile.planFeature1': {
    en: '1 free visit request per week',
    ru: '1 бесплатный запрос на визит в неделю',
    uz: 'Haftada 1 bepul tashrif soʻrovi'
  },
  'profile.planFeature2': {
    en: 'Up to 5 paid visits per week',
    ru: 'До 5 платных визитов в неделю',
    uz: 'Haftada 5 tagacha pullik tashrif'
  },
  'profile.planFeature3': {
    en: 'Basic property search',
    ru: 'Базовый поиск недвижимости',
    uz: 'Asosiy uy qidiruvi'
  },
  'profile.premiumFeatures': {
    en: 'Premium: Unlimited visits • Priority support • Advanced filters',
    ru: 'Премиум: Неограниченные визиты • Приоритетная поддержка • Расширенные фильтры',
    uz: 'Premium: Cheksiz tashriflar • Ustuvor qoʻllab-quvvatlash • Kengaytirilgan filtrlar'
  },
  'profile.emailNotificationsDesc': {
    en: 'Receive updates about your listings and messages',
    ru: 'Получайте обновления о ваших объявлениях и сообщениях',
    uz: 'Eʼlonlaringiz va xabarlaringiz haqida yangilanishlarni oling'
  },
  'profile.privacySettingsDesc': {
    en: 'Control who can see your profile information',
    ru: 'Контролируйте, кто может видеть информацию вашего профиля',
    uz: 'Profil maʼlumotlaringizni kim koʻra olishini nazorat qiling'
  },
  'profile.manage': {
    en: 'Manage',
    ru: 'Управлять',
    uz: 'Boshqarish'
  },

  // Terms & Conditions Page
  'terms.title': {
    en: 'Terms & Conditions',
    ru: 'Условия использования',
    uz: 'Foydalanish shartlari'
  },
  'terms.subtitle': {
    en: 'Welcome to Magit! These Terms & Conditions ("Terms") govern your use of the Magit website, mobile application, and services ("Platform").',
    ru: 'Добро пожаловать в Magit! Эти Условия использования ("Условия") регулируют ваше использование веб-сайта, мобильного приложения и услуг Magit ("Платформа").',
    uz: 'Magit-ga xush kelibsiz! Ushbu Foydalanish shartlari ("Shartlar") Magit veb-sayti, mobil ilovasi va xizmatlaridan ("Platforma") foydalanishingizni tartibga soladi.'
  },
  'terms.lastUpdated': {
    en: 'Last updated: 1 Sept 2025',
    ru: 'Последнее обновление: 1 сентября 2025',
    uz: 'Oxirgi yangilanish: 1 sentyabr 2025'
  },
  'terms.intro': {
    en: 'By accessing or using Magit, you agree to these Terms. If you do not agree, please do not use our Platform.',
    ru: 'Получив доступ к Magit или используя его, вы соглашаетесь с этими Условиями. Если вы не согласны, пожалуйста, не используйте нашу Платформу.',
    uz: 'Magit-ga kirishda yoki undan foydalanishda siz ushbu Shartlarga rozilik bildirasiz. Agar rozi bo\'lmasangiz, iltimos, bizning Platformamizdan foydalanmang.'
  },

  // Section 1: Definitions
  'terms.section1.title': {
    en: '1. Definitions',
    ru: '1. Определения',
    uz: '1. Ta\'riflar'
  },
  'terms.section1.content': {
    en: '"Magit" – refers to [Your Company Name LLC], operator of the Platform. "User" – any individual or entity using the Platform (buyers, sellers, applicants). "Property" – real estate listed on the Platform. "Halal Financing" – Shariah-compliant financing option offered through Magit.',
    ru: '"Magit" – относится к [Ваша компания ООО], оператору Платформы. "Пользователь" – любое физическое или юридическое лицо, использующее Платформу (покупатели, продавцы, заявители). "Недвижимость" – недвижимость, размещенная на Платформе. "Халяль финансирование" – финансирование, соответствующее Шариату, предлагаемое через Magit.',
    uz: '"Magit" – Platformani boshqaruvchi [Kompaniya nomi MChJ]ga tegishli. "Foydalanuvchi" – Platformadan foydalanuvchi har qanday jismoniy yoki yuridik shaxs (xaridorlar, sotuvchilar, arizachilar). "Mulk" – Platformada joylashtirilgan ko\'chmas mulk. "Halol moliyalashtirish" – Magit orqali taklif qilinadigan Shariatga mos moliyalashtirish varianti.'
  },

  // Section 2: Services Provided
  'terms.section2.title': {
    en: '2. Services Provided',
    ru: '2. Предоставляемые услуги',
    uz: '2. Taqdim etiladigan xizmatlar'
  },
  'terms.section2.content': {
    en: 'Verified property listings uploaded by Magit staff. Property search, visit scheduling, and buyer-seller coordination. Optional Halal financing services. Payment processing through supported channels (e.g., Uzum, Click, Payme, bank transfer, office cash).',
    ru: 'Проверенные объявления о недвижимости, загруженные сотрудниками Magit. Поиск недвижимости, планирование посещений и координация между покупателями и продавцами. Дополнительные услуги халяль финансирования. Обработка платежей через поддерживаемые каналы (например, Uzum, Click, Payme, банковский перевод, наличные в офисе).',
    uz: 'Magit xodimlari tomonidan yuklangan tekshirilgan mulk e\'lonlari. Mulk qidirish, tashrif rejalashtirish va xaridor-sotuvchi muvofiqlashuvi. Ixtiyoriy halol moliyalashtirish xizmatlari. Qo\'llab-quvvatlanadigan kanallar orqali to\'lovlarni qayta ishlash (masalan, Uzum, Click, Payme, bank o\'tkazmasi, ofis naqd puli).'
  },

  // Section 3: User Responsibilities
  'terms.section3.title': {
    en: '3. User Responsibilities',
    ru: '3. Обязанности пользователя',
    uz: '3. Foydalanuvchi majburiyatlari'
  },
  'terms.section3.content': {
    en: 'Provide accurate and truthful information when registering or applying. Not use the Platform for fraudulent, misleading, or illegal activities. Respect property owners, Magit staff, and other users during visits and transactions.',
    ru: 'Предоставлять точную и правдивую информацию при регистрации или подаче заявления. Не использовать Платформу для мошеннических, вводящих в заблуждение или незаконных действий. Уважать владельцев недвижимости, сотрудников Magit и других пользователей во время посещений и сделок.',
    uz: 'Ro\'yxatdan o\'tishda yoki ariza berishda aniq va haqiqiy ma\'lumot berish. Platformani firibgar, aldamchi yoki noqonuniy faoliyat uchun ishlatmaslik. Tashrif va bitimlar davomida mulk egalarini, Magit xodimlarini va boshqa foydalanuvchilarni hurmat qilish.'
  },

  // Section 4: Financing Terms
  'terms.section4.title': {
    en: '4. Financing Terms',
    ru: '4. Условия финансирования',
    uz: '4. Moliyalashtirish shartlari'
  },
  'terms.section4.content': {
    en: 'Financing offers are subject to eligibility checks. Down payment required: typically between 30%–90% (depending on agreement). Payments are made in fixed installments as agreed in the financing contract. Missed payments may result in penalties, repossession of the property, or termination of financing. Financing is strictly interest-free (riba-free) and based on Shariah principles.',
    ru: 'Предложения по финансированию зависят от проверки соответствия критериям. Требуется первоначальный взнос: обычно от 30% до 90% (в зависимости от соглашения). Платежи производятся фиксированными взносами согласно договору финансирования. Пропущенные платежи могут привести к штрафам, изъятию имущества или прекращению финансирования. Финансирование строго беспроцентное (без рибы) и основано на принципах Шариата.',
    uz: 'Moliyalashtirish takliflari muvofiqlik tekshiruviga bog\'liq. Dastlabki to\'lov talab qilinadi: odatda 30% dan 90% gacha (kelishuvga qarab). To\'lovlar moliyalashtirish shartnomasida kelishilganidek qat\'iy to\'lovlarda amalga oshiriladi. To\'lovlarni o\'tkazib yuborish jarimalar, mulkni qaytarib olish yoki moliyalashtirishni tugatishga olib kelishi mumkin. Moliyalashtirish qat\'iyan foizsiz (ribosiz) va Shariat tamoyillariga asoslangan.'
  },

  // Section 5: Platform Limitations
  'terms.section5.title': {
    en: '5. Platform Limitations',
    ru: '5. Ограничения платформы',
    uz: '5. Platforma cheklovlari'
  },
  'terms.section5.content': {
    en: 'Magit does not guarantee property appreciation, resale value, or profitability. Magit is not responsible for disputes between buyers and sellers outside of verified processes. Listings are verified to the best of our ability, but Magit does not provide absolute guarantees against legal or ownership risks.',
    ru: 'Magit не гарантирует рост стоимости недвижимости, стоимость перепродажи или прибыльность. Magit не несет ответственности за споры между покупателями и продавцами вне проверенных процессов. Объявления проверяются в меру наших возможностей, но Magit не предоставляет абсолютных гарантий против правовых рисков или рисков собственности.',
    uz: 'Magit mulkning qadriga ko\'tarilishini, qayta sotish qiymatini yoki foydaliligini kafolatlamaydi. Magit tekshirilgan jarayonlardan tashqari xaridor va sotuvchilar o\'rtasidagi nizolar uchun javobgar emas. E\'lonlar imkonyatlarimiz doirasida tekshiriladi, lekin Magit huquqiy yoki mulkchilik xatarlariga qarshi mutlaq kafolat bermaydi.'
  },

  // Section 6: Fees
  'terms.section6.title': {
    en: '6. Fees',
    ru: '6. Сборы',
    uz: '6. To\'lovlar'
  },
  'terms.section6.content': {
    en: 'Property viewing, browsing, and listing are free for users. Financing agreements may involve administrative or service charges, disclosed at the time of contract. No verification fee is charged to buyers or sellers.',
    ru: 'Просмотр, поиск и размещение недвижимости бесплатны для пользователей. Соглашения о финансировании могут включать административные или сервисные сборы, раскрываемые во время заключения контракта. С покупателей или продавцов не взимается плата за верификацию.',
    uz: 'Mulkni ko\'rish, qidirish va e\'lon berish foydalanuvchilar uchun bepul. Moliyalashtirish shartnomalari shartnoma tuzish vaqtida e\'lon qilinadigan ma\'muriy yoki xizmat to\'lovlarini o\'z ichiga olishi mumkin. Xaridor yoki sotuvchilardan tekshirish to\'lovi olinmaydi.'
  },

  // Section 7: Intellectual Property
  'terms.section7.title': {
    en: '7. Intellectual Property',
    ru: '7. Интеллектуальная собственность',
    uz: '7. Intellektual mulk'
  },
  'terms.section7.content': {
    en: 'All content on Magit (logos, text, photos, software) belongs to Magit unless otherwise stated. Users may not copy, modify, or distribute Platform content without permission.',
    ru: 'Весь контент на Magit (логотипы, текст, фотографии, программное обеспечение) принадлежит Magit, если не указано иное. Пользователи не могут копировать, изменять или распространять контент Платформы без разрешения.',
    uz: 'Magit-dagi barcha kontent (logotiplar, matn, fotosuratlar, dasturiy ta\'minot) agar boshqacha ko\'rsatilmagan bo\'lsa, Magit-ga tegishli. Foydalanuvchilar ruxsatsiz Platforma kontentini nusxalay, o\'zgartira yoki tarqata olmaydi.'
  },

  // Section 8: Privacy
  'terms.section8.title': {
    en: '8. Privacy',
    ru: '8. Конфиденциальность',
    uz: '8. Maxfiylik'
  },
  'terms.section8.content': {
    en: 'User data (including financial details, documents, and payments) will be handled according to our Privacy Policy. By using the Platform, you consent to data collection and processing as described in that policy.',
    ru: 'Данные пользователей (включая финансовые детали, документы и платежи) будут обрабатываться в соответствии с нашей Политикой конфиденциальности. Используя Платформу, вы соглашаетесь на сбор и обработку данных, как описано в этой политике.',
    uz: 'Foydalanuvchi ma\'lumotlari (moliyaviy tafsilotlar, hujjatlar va to\'lovlarni o\'z ichiga olgan holda) bizning Maxfiylik siyosatimizga muvofiq ko\'rib chiqiladi. Platformadan foydalanish orqali siz ushbu siyosatda tasvirlangan ma\'lumotlarni yig\'ish va qayta ishlashga rozilik bildirasiz.'
  },

  // Section 9: Liability
  'terms.section9.title': {
    en: '9. Liability',
    ru: '9. Ответственность',
    uz: '9. Javobgarlik'
  },
  'terms.section9.content': {
    en: 'Magit is not liable for losses resulting from user negligence, incorrect information, or third-party actions. Magit is not liable for payment failures due to banks, apps, or other payment providers.',
    ru: 'Magit не несет ответственности за убытки, возникшие в результате небрежности пользователя, неверной информации или действий третьих лиц. Magit не несет ответственности за сбои в платежах из-за банков, приложений или других поставщиков платежных услуг.',
    uz: 'Magit foydalanuvchi ehtiyotsizligi, noto\'g\'ri ma\'lumot yoki uchinchi shaxslar harakatlari natijasida yuzaga kelgan zararlar uchun javobgar emas. Magit banklar, ilovalar yoki boshqa to\'lov provayderlari sabab bo\'lgan to\'lov muvaffaqiyatsizliklari uchun javobgar emas.'
  },

  // Section 10: Termination
  'terms.section10.title': {
    en: '10. Termination',
    ru: '10. Прекращение действия',
    uz: '10. Tugatish'
  },
  'terms.section10.content': {
    en: 'Magit reserves the right to suspend or terminate accounts if users violate these Terms.',
    ru: 'Magit оставляет за собой право приостановить или прекратить учетные записи, если пользователи нарушают эти Условия.',
    uz: 'Magit foydalanuvchilar ushbu Shartlarni buzgan taqdirda hisoblarni to\'xtatish yoki tugatish huquqini o\'zida saqlab qoladi.'
  },

  // Section 11: Governing Law
  'terms.section11.title': {
    en: '11. Governing Law',
    ru: '11. Применимое право',
    uz: '11. Amaldagi qonun'
  },
  'terms.section11.content': {
    en: 'These Terms are governed by the laws of the Republic of Uzbekistan. Any disputes will be resolved in accordance with Uzbek legislation.',
    ru: 'Эти Условия регулируются законами Республики Узбекистан. Любые споры будут разрешаться в соответствии с узбекским законодательством.',
    uz: 'Ushbu Shartlar O\'zbekiston Respublikasi qonunlari bilan tartibga solinadi. Har qanday nizolar o\'zbek qonunchiligiga muvofiq hal qilinadi.'
  },

  // Section 12: Contact
  'terms.section12.title': {
    en: '12. Contact',
    ru: '12. Контакты',
    uz: '12. Aloqa'
  },
  'terms.section12.content': {
    en: 'For questions, complaints, or support, please contact:',
    ru: 'По вопросам, жалобам или поддержке обращайтесь:',
    uz: 'Savollar, shikoyatlar yoki yordam uchun murojaat qiling:'
  },
  'terms.contact.email': {
    en: '📧 magit.startup@gmail.com',
    ru: '📧 magit.startup@gmail.com',
    uz: '📧 magit.startup@gmail.com'
  },
  'terms.contact.phone': {
    en: '📞 +998975586669',
    ru: '📞 +998975586669',
    uz: '📞 +998975586669'
  },

  // Dashboard Page
  'dashboard.welcome': {
    en: 'Welcome',
    ru: 'Добро пожаловать',
    uz: 'Xush kelibsiz'
  },
  'dashboard.choosePath': {
    en: 'Choose your path to finding the perfect home',
    ru: 'Выберите свой путь к идеальному дому',
    uz: 'Mukammal uy topish yoʻlini tanlang'
  },
  'dashboard.listProperty.title': {
    en: 'List Your Property',
    ru: 'Разместить объявление',
    uz: 'Uyni eʼlon qilish'
  },
  'dashboard.listProperty.description': {
    en: 'Reach verified buyers and sell your property with confidence',
    ru: 'Найдите проверенных покупателей и продайте недвижимость с уверенностью',
    uz: 'Tekshirilgan xaridorlar bilan ishonch bilan uy sotish'
  },
  'dashboard.listProperty.features.professional': {
    en: 'Professional photos & virtual tours',
    ru: 'Профессиональные фото и виртуальные туры',
    uz: 'Professional foto va virtual turlar'
  },
  'dashboard.listProperty.features.photos': {
    en: 'High-quality listing photos',
    ru: 'Качественные фото объявления',
    uz: 'Yuqori sifatli eʼlon fotolari'
  },
  'dashboard.listProperty.features.analytics': {
    en: 'Detailed analytics & insights',
    ru: 'Подробная аналитика и статистика',
    uz: 'Batafsil tahlil va statistika'
  },
  'dashboard.listProperty.getStarted': {
    en: 'Get Started',
    ru: 'Начать',
    uz: 'Boshlash'
  },
  'dashboard.findProperty.title': {
    en: 'Find Your Home',
    ru: 'Найти дом',
    uz: 'Uy topish'
  },
  'dashboard.findProperty.description': {
    en: 'Discover verified properties with smart matching and financing options',
    ru: 'Откройте для себя проверенные объекты с умным подбором и финансированием',
    uz: 'Aqlli tanlov va moliyalashtirish bilan tekshirilgan uylarni kashf eting'
  },
  'dashboard.findProperty.features.verified': {
    en: 'ID-verified sellers only',
    ru: 'Только проверенные продавцы',
    uz: 'Faqat tekshirilgan sotuvchilar'
  },
  'dashboard.findProperty.features.financing': {
    en: 'Halal financing available',
    ru: 'Халяль финансирование доступно',
    uz: 'Halol moliyalashtirish mavjud'
  },
  'dashboard.findProperty.features.map': {
    en: 'Interactive neighborhood maps',
    ru: 'Интерактивные карты районов',
    uz: 'Interaktiv mahalla xaritalari'
  },
  'dashboard.findProperty.startBrowsing': {
    en: 'Start Browsing',
    ru: 'Начать просмотр',
    uz: 'Koʻrishni boshlash'
  },
  'dashboard.contactSupport': {
    en: 'Need help? Contact our support team',
    ru: 'Нужна помощь? Свяжитесь с нашей службой поддержки',
    uz: 'Yordam kerakmi? Qoʻllab-quvvatlash xizmatiga murojaat qiling'
  },

  // MyProperties Page
  'myProperties.title': {
    en: 'My Listed Properties',
    ru: 'Мои объявления',
    uz: 'Mening eʼlonlarim'
  },
  'myProperties.addProperty': {
    en: 'Add Property',
    ru: 'Добавить объект',
    uz: 'Uy qoʻshish'
  },
  'myProperties.noProperties': {
    en: "You haven't listed any properties yet.",
    ru: 'Вы еще не разместили ни одного объявления.',
    uz: 'Siz hali hech qanday uy eʼlon qilmagansiz.'
  },
  'myProperties.listFirst': {
    en: 'List Your First Property',
    ru: 'Разместить первое объявление',
    uz: 'Birinchi uyni eʼlon qilish'
  },
  'myProperties.status.approved': {
    en: 'Approved',
    ru: 'Одобрено',
    uz: 'Tasdiqlangan'
  },
  'myProperties.status.notApproved': {
    en: 'Pending Approval',
    ru: 'Ожидает одобрения',
    uz: 'Tasdiq kutilmoqda'
  },
  'myProperties.status.verified': {
    en: 'Verified',
    ru: 'Проверено',
    uz: 'Tekshirilgan'
  },
  'myProperties.analytics': {
    en: 'Analytics',
    ru: 'Аналитика',
    uz: 'Tahlil'
  },
  'myProperties.visits': {
    en: 'Visits',
    ru: 'Визиты',
    uz: 'Tashriflar'
  },
  'myProperties.views': {
    en: 'views',
    ru: 'просмотров',
    uz: 'koʻrishlar'
  },
  'myProperties.visitRequests': {
    en: 'visit requests',
    ru: 'запросов на визит',
    uz: 'tashrif soʻrovlari'
  },
  'myProperties.upcomingVisits': {
    en: 'Upcoming visits',
    ru: 'Предстоящие визиты',
    uz: 'Kelgusi tashriflar'
  },
  'myProperties.manage': {
    en: 'Manage',
    ru: 'Управлять',
    uz: 'Boshqarish'
  },
  'myProperties.visitorInfo': {
    en: 'Visitor',
    ru: 'Посетитель',
    uz: 'Tashrif buyuruvchi'
  },
  'myProperties.visitTime': {
    en: 'Time',
    ru: 'Время',
    uz: 'Vaqt'
  },

  // Common Elements (additional keys)
  'common.startListingFirst': {
    en: 'Start by listing your first property to connect with potential buyers.',
    ru: 'Начните с размещения вашего первого объявления для связи с потенциальными покупателями.',
    uz: 'Potentsial xaridorlar bilan bogʻlanish uchun birinchi uyingizni eʼlon qilishdan boshlang.'
  },

  // Admin Dashboard
  'admin.dashboard.title': {
    en: 'Admin Dashboard',
    ru: 'Панель Админа',
    uz: 'Admin Paneli'
  },
  'admin.dashboard.loading': {
    en: 'Loading...',
    ru: 'Загрузка...',
    uz: 'Yuklanmoqda...'
  },
  'admin.dashboard.signOut': {
    en: 'Sign Out',
    ru: 'Выйти',
    uz: 'Chiqish'
  },
  'admin.dashboard.tabs.users': {
    en: 'Users & Roles',
    ru: 'Пользователи и Роли',
    uz: 'Foydalanuvchilar va Rollar'
  },
  'admin.dashboard.tabs.properties': {
    en: 'Properties',
    ru: 'Недвижимость',
    uz: 'Mulklar'
  },
  'admin.dashboard.tabs.applications': {
    en: 'Property Requests',
    ru: 'Заявки на Недвижимость',
    uz: 'Mulk So\'rovlari'
  },
  'admin.dashboard.tabs.financing': {
    en: 'Financing',
    ru: 'Финансирование',
    uz: 'Moliyalashtirish'
  },
  'admin.dashboard.tabs.security': {
    en: 'Security Audit',
    ru: 'Аудит Безопасности',
    uz: 'Xavfsizlik Auditi'
  },
  'admin.dashboard.users.title': {
    en: 'User Management',
    ru: 'Управление Пользователями',
    uz: 'Foydalanuvchilarni Boshqarish'
  },
  'admin.dashboard.users.name': {
    en: 'Name',
    ru: 'Имя',
    uz: 'Ism'
  },
  'admin.dashboard.users.email': {
    en: 'Email',
    ru: 'Email',
    uz: 'Email'
  },
  'admin.dashboard.users.role': {
    en: 'Role',
    ru: 'Роль',
    uz: 'Rol'
  },
  'admin.dashboard.users.joinedDate': {
    en: 'Joined Date',
    ru: 'Дата Регистрации',
    uz: 'Qo\'shilgan Sana'
  },
  'admin.dashboard.users.actions': {
    en: 'Actions',
    ru: 'Действия',
    uz: 'Amallar'
  },
  'admin.dashboard.users.changeRole': {
    en: 'Change Role',
    ru: 'Изменить Роль',
    uz: 'Rolni O\'zgartirish'
  },
  'admin.dashboard.users.deleteUser': {
    en: 'Delete User',
    ru: 'Удалить Пользователя',
    uz: 'Foydalanuvchini O\'chirish'
  },
  'admin.dashboard.users.roleUser': {
    en: 'User',
    ru: 'Пользователь',
    uz: 'Foydalanuvchi'
  },
  'admin.dashboard.users.roleModerator': {
    en: 'Moderator',
    ru: 'Модератор',
    uz: 'Moderator'
  },
  'admin.dashboard.users.roleAdmin': {
    en: 'Admin',
    ru: 'Админ',
    uz: 'Admin'
  },
  'admin.dashboard.users.confirmDelete': {
    en: 'Are you sure you want to delete this user account? This action cannot be undone.',
    ru: 'Вы уверены, что хотите удалить этот аккаунт пользователя? Это действие нельзя отменить.',
    uz: 'Ushbu foydalanuvchi hisobini o\'chirishni xohlaysizmi? Bu amalni bekor qilib bo\'lmaydi.'
  },
  'admin.dashboard.properties.title': {
    en: 'Property Management',
    ru: 'Управление Недвижимостью',
    uz: 'Mulklarni Boshqarish'
  },
  'admin.dashboard.properties.propertyTitle': {
    en: 'Title',
    ru: 'Название',
    uz: 'Sarlavha'
  },
  'admin.dashboard.properties.location': {
    en: 'Location',
    ru: 'Местоположение',
    uz: 'Joylashuv'
  },
  'admin.dashboard.properties.price': {
    en: 'Price',
    ru: 'Цена',
    uz: 'Narx'
  },
  'admin.dashboard.properties.owner': {
    en: 'Owner',
    ru: 'Владелец',
    uz: 'Egasi'
  },
  'admin.dashboard.properties.status': {
    en: 'Status',
    ru: 'Статус',
    uz: 'Holat'
  },
  'admin.dashboard.properties.halalStatus': {
    en: 'Halal Status',
    ru: 'Халал Статус',
    uz: 'Halol Holati'
  },
  'admin.dashboard.properties.statusActive': {
    en: 'Active',
    ru: 'Активная',
    uz: 'Faol'
  },
  'admin.dashboard.properties.statusSuspended': {
    en: 'Suspended',
    ru: 'Приостановлена',
    uz: 'To\'xtatilgan'
  },
  'admin.dashboard.properties.statusPending': {
    en: 'Pending',
    ru: 'Ожидает',
    uz: 'Kutilmoqda'
  },
  'admin.dashboard.properties.halalApproved': {
    en: 'Halal Approved',
    ru: 'Халал Одобрено',
    uz: 'Halol Tasdiqlangan'
  },
  'admin.dashboard.properties.halalNotApproved': {
    en: 'Halal Not Approved',
    ru: 'Халал Не Одобрено',
    uz: 'Halol Tasdiqlanmagan'
  },
  'admin.dashboard.applications.title': {
    en: 'Property Applications',
    ru: 'Заявки на Недвижимость',
    uz: 'Mulk Arizalari'
  },
  'admin.dashboard.applications.subtitle': {
    en: 'Review and manage property listings awaiting approval',
    ru: 'Рассмотрение и управление объявлениями, ожидающими одобрения',
    uz: 'Tasdiqlashni kutayotgan mulk e\'lonlarini ko\'rib chiqish va boshqarish'
  },
  'admin.dashboard.applications.applicant': {
    en: 'Applicant',
    ru: 'Заявитель',
    uz: 'Ariza beruvchi'
  },
  'admin.dashboard.applications.submittedDate': {
    en: 'Submitted Date',
    ru: 'Дата Подачи',
    uz: 'Taqdim etilgan Sana'
  },
  'admin.dashboard.applications.approve': {
    en: 'Approve',
    ru: 'Одобрить',
    uz: 'Tasdiqlash'
  },
  'admin.dashboard.applications.reject': {
    en: 'Reject',
    ru: 'Отклонить',
    uz: 'Rad etish'
  },
  'admin.dashboard.applications.delete': {
    en: 'Delete',
    ru: 'Удалить',
    uz: 'O\'chirish'
  },
  'admin.dashboard.applications.viewDetails': {
    en: 'View Details',
    ru: 'Просмотр Деталей',
    uz: 'Tafsilotlarni Ko\'rish'
  },
  'admin.dashboard.applications.pendingApplications': {
    en: 'Pending Applications',
    ru: 'Ожидающие Заявки',
    uz: 'Kutilayotgan Arizalar'
  },
  'admin.dashboard.applications.approvedApplications': {
    en: 'Approved Applications',
    ru: 'Одобренные Заявки',
    uz: 'Tasdiqlangan Arizalar'
  },
  'admin.dashboard.applications.rejectedApplications': {
    en: 'Rejected Applications',
    ru: 'Отклоненные Заявки',
    uz: 'Rad etilgan Arizalar'
  },
  'admin.dashboard.financing.title': {
    en: 'Financing Management',
    ru: 'Управление Финансированием',
    uz: 'Moliyalashtirishni Boshqarish'
  },
  'admin.dashboard.financing.subtitle': {
    en: 'Comprehensive financing workflow management',
    ru: 'Комплексное управление рабочим процессом финансирования',
    uz: 'Moliyalashtirish ish jarayonini keng qamrovli boshqarish'
  },
  'admin.dashboard.financing.description': {
    en: 'This section provides an overview of the financing workflow. Requests move through multiple stages from initial submission to final approval.',
    ru: 'Этот раздел предоставляет обзор рабочего процесса финансирования. Заявки проходят через несколько этапов от первоначальной подачи до окончательного одобрения.',
    uz: 'Ushbu bo\'lim moliyalashtirish ish jarayonining umumiy ko\'rinishini taqdim etadi. So\'rovlar dastlabki taqdim etishdan yakuniy tasdiqlashgacha bir necha bosqichlardan o\'tadi.'
  },
  'admin.dashboard.financing.viewDashboard': {
    en: 'View Financing Dashboard',
    ru: 'Просмотреть Панель Финансирования',
    uz: 'Moliyalashtirish Panelini Ko\'rish'
  },
  'admin.dashboard.security.title': {
    en: 'Security Audit',
    ru: 'Аудит Безопасности',
    uz: 'Xavfsizlik Auditi'
  },
  'admin.dashboard.security.subtitle': {
    en: 'Review database security and access controls',
    ru: 'Проверка безопасности базы данных и контроля доступа',
    uz: 'Ma\'lumotlar bazasi xavfsizligi va kirish nazoratini ko\'rib chiqish'
  },

  // Admin Financing
  'admin.financing.title': {
    en: 'Financing Requests',
    ru: 'Заявки на Финансирование',
    uz: 'Moliyalashtirish So\'rovlari'
  },
  'admin.financing.subtitle': {
    en: 'Financing Requests Management',
    ru: 'Управление Заявками на Финансирование',
    uz: 'Moliyalashtirish So\'rovlarini Boshqarish'
  },
  'admin.financing.backToDashboard': {
    en: 'Admin Dashboard',
    ru: 'Панель Админа',
    uz: 'Admin Paneli'
  },
  'admin.financing.backToList': {
    en: 'Back to List',
    ru: 'Назад к Списку',
    uz: 'Ro\'yxatga Qaytish'
  },
  'admin.financing.loading': {
    en: 'Loading financing requests...',
    ru: 'Загрузка заявок на финансирование...',
    uz: 'Moliyalashtirish so\'rovlari yuklanmoqda...'
  },
  'admin.financing.details': {
    en: 'Financing Request Details',
    ru: 'Детали Заявки на Финансирование',
    uz: 'Moliyalashtirish So\'rovi Tafsilotlari'
  },
  'admin.financing.empty': {
    en: 'No Financing Requests',
    ru: 'Нет Заявок на Финансирование',
    uz: 'Moliyalashtirish So\'rovlari Yo\'q'
  },
  'admin.financing.emptyFiltered': {
    en: 'No Matching Requests',
    ru: 'Нет Подходящих Заявок',
    uz: 'Mos So\'rovlar Yo\'q'
  },
  'admin.financing.emptyDescription': {
    en: 'Financing requests will appear here when users apply.',
    ru: 'Заявки на финансирование будут отображаться здесь, когда пользователи подадут заявки.',
    uz: 'Foydalanuvchilar ariza berganlarida moliyalashtirish so\'rovlari bu yerda ko\'rinadi.'
  },
  'admin.financing.emptyFilteredDescription': {
    en: 'Try adjusting your search or filter criteria.',
    ru: 'Попробуйте скорректировать критерии поиска или фильтра.',
    uz: 'Qidiruv yoki filtr mezonlarini sozlashga harakat qiling.'
  },
  'admin.financing.search': {
    en: 'Search by property, location, or applicant...',
    ru: 'Поиск по недвижимости, местоположению или заявителю...',
    uz: 'Mulk, joylashuv yoki ariza beruvchi bo\'yicha qidirish...'
  },
  'admin.financing.filterByStage': {
    en: 'Filter by stage',
    ru: 'Фильтр по этапу',
    uz: 'Bosqich bo\'yicha filtr'
  },
  'admin.financing.allStages': {
    en: 'All Stages',
    ru: 'Все Этапы',
    uz: 'Barcha Bosqichlar'
  },
  'admin.financing.property': {
    en: 'Property',
    ru: 'Недвижимость',
    uz: 'Mulk'
  },
  'admin.financing.applicant': {
    en: 'Applicant',
    ru: 'Заявитель',
    uz: 'Ariza beruvchi'
  },
  'admin.financing.amount': {
    en: 'Amount',
    ru: 'Сумма',
    uz: 'Miqdor'
  },
  'admin.financing.workflowProgress': {
    en: 'Workflow Progress',
    ru: 'Прогресс Рабочего Процесса',
    uz: 'Ish Jarayoni Taraqqiyoti'
  },
  'admin.financing.updated': {
    en: 'Updated',
    ru: 'Обновлено',
    uz: 'Yangilangan'
  },
  'admin.financing.stageSubmitted': {
    en: 'Submitted',
    ru: 'Подано',
    uz: 'Taqdim etilgan'
  },
  'admin.financing.stageAssigned': {
    en: 'Assigned',
    ru: 'Назначено',
    uz: 'Tayinlangan'
  },
  'admin.financing.stageDocuments': {
    en: 'Documents',
    ru: 'Документы',
    uz: 'Hujjatlar'
  },
  'admin.financing.stageFinalApproval': {
    en: 'Final Approval',
    ru: 'Финальное Одобрение',
    uz: 'Yakuniy Tasdiqlash'
  },
  // My Financing page
  'myFinancing.title': {
    en: 'My Financing Requests',
    ru: 'Мои Заявки на Финансирование',
    uz: 'Mening Moliyalashtirish So\'rovlarim'
  },
  'myFinancing.detailsTitle': {
    en: 'Financing Request Details',
    ru: 'Детали Заявки на Финансирование',
    uz: 'Moliyalashtirish So\'rovi Tafsilotlari'
  },
  'myFinancing.backToRequests': {
    en: 'Back to My Requests',
    ru: 'Назад к Моим Заявкам',
    uz: 'Mening So\'rovlarimga Qaytish'
  },
  'myFinancing.backToDashboard': {
    en: 'Back to Dashboard',
    ru: 'Назад к Панели',
    uz: 'Panelga Qaytish'
  },
  'myFinancing.loading': {
    en: 'Loading your financing requests...',
    ru: 'Загрузка ваших заявок на финансирование...',
    uz: 'Moliyalashtirish so\'rovlaringiz yuklanmoqda...'
  },
  'myFinancing.applicationsTitle': {
    en: 'Your Financing Applications',
    ru: 'Ваши Заявки на Финансирование',
    uz: 'Sizning Moliyalashtirish Arizalaringiz'
  },
  'myFinancing.searchPlaceholder': {
    en: 'Search by property or location...',
    ru: 'Поиск по недвижимости или местоположению...',
    uz: 'Mulk yoki joylashuv bo\'yicha qidirish...'
  },
  'myFinancing.filterByStatus': {
    en: 'Filter by status',
    ru: 'Фильтр по статусу',
    uz: 'Holat bo\'yicha filtr'
  },
  'myFinancing.allStatuses': {
    en: 'All Statuses',
    ru: 'Все Статусы',
    uz: 'Barcha Holatlar'
  },
  'myFinancing.empty': {
    en: 'No Financing Requests',
    ru: 'Нет Заявок на Финансирование',
    uz: 'Moliyalashtirish So\'rovlari Yo\'q'
  },
  'myFinancing.emptyFiltered': {
    en: 'No Matching Requests',
    ru: 'Нет Подходящих Заявок',
    uz: 'Mos So\'rovlar Yo\'q'
  },
  'myFinancing.emptyDescription': {
    en: 'You haven\'t submitted any financing requests yet.',
    ru: 'Вы еще не подали заявки на финансирование.',
    uz: 'Siz hali moliyalashtirish so\'rovi yubormadingiz.'
  },
  'myFinancing.emptyFilteredDescription': {
    en: 'Try adjusting your search or filter criteria.',
    ru: 'Попробуйте скорректировать критерии поиска или фильтра.',
    uz: 'Qidiruv yoki filtr mezonlarini sozlashga harakat qiling.'
  },
  'myFinancing.browseProperties': {
    en: 'Browse Properties',
    ru: 'Просмотреть Недвижимость',
    uz: 'Mulklarni Ko\'rish'
  },
  'myFinancing.totalCost': {
    en: 'Total Cost:',
    ru: 'Общая Стоимость:',
    uz: 'Umumiy Narx:'
  },
  'myFinancing.period': {
    en: 'Period:',
    ru: 'Период:',
    uz: 'Muddat:'
  },
  'myFinancing.notSpecified': {
    en: 'Not specified',
    ru: 'Не указано',
    uz: 'Ko\'rsatilmagan'
  },
  'myFinancing.view': {
    en: 'View',
    ru: 'Просмотр',
    uz: 'Ko\'rish'
  },
  'myFinancing.edit': {
    en: 'Edit',
    ru: 'Редактировать',
    uz: 'Tahrirlash'
  },
  'myFinancing.property': {
    en: 'Property',
    ru: 'Недвижимость',
    uz: 'Mulk'
  },
  'myFinancing.amountRequested': {
    en: 'Amount Requested',
    ru: 'Запрошенная Сумма',
    uz: 'So\'ralgan Miqdor'
  },
  'myFinancing.periodHeader': {
    en: 'Period',
    ru: 'Период',
    uz: 'Muddat'
  },
  'myFinancing.status': {
    en: 'Status',
    ru: 'Статус',
    uz: 'Holat'
  },
  'myFinancing.lastUpdated': {
    en: 'Last Updated',
    ru: 'Последнее Обновление',
    uz: 'Oxirgi Yangilanish'
  },
  'myFinancing.actions': {
    en: 'Actions',
    ru: 'Действия',
    uz: 'Amallar'
  },
  'myFinancing.viewDetails': {
    en: 'View Details',
    ru: 'Просмотр Деталей',
    uz: 'Tafsilotlarni Ko\'rish'
  },
  'myFinancing.editRequest': {
    en: 'Edit Request',
    ru: 'Редактировать Заявку',
    uz: 'So\'rovni Tahrirlash'
  },
  'myFinancing.deleteRequest': {
    en: 'Delete Request',
    ru: 'Удалить Заявку',
    uz: 'So\'rovni O\'chirish'
  },
  'myFinancing.confirmDelete': {
    en: 'Are you sure you want to delete this financing request? This action cannot be undone.',
    ru: 'Вы уверены, что хотите удалить эту заявку на финансирование? Это действие нельзя отменить.',
    uz: 'Ushbu moliyalashtirish so\'rovini o\'chirishni xohlaysizmi? Bu amalni bekor qilib bo\'lmaydi.'
  },
  'myFinancing.deleteSuccess': {
    en: 'Request deleted',
    ru: 'Заявка удалена',
    uz: 'So\'rov o\'chirildi'
  },
  'myFinancing.deleteSuccessDesc': {
    en: 'Your financing request has been deleted successfully.',
    ru: 'Ваша заявка на финансирование успешно удалена.',
    uz: 'Moliyalashtirish so\'rovingiz muvaffaqiyatli o\'chirildi.'
  },
  'myFinancing.loadError': {
    en: 'Failed to load your financing requests',
    ru: 'Не удалось загрузить ваши заявки на финансирование',
    uz: 'Moliyalashtirish so\'rovlaringizni yuklash muvaffaqiyatsiz'
  },

  // Financing status translations
  'financingStatus.submitted': {
    en: 'Submitted',
    ru: 'Подано',
    uz: 'Taqdim etilgan'
  },
  'financingStatus.assigned': {
    en: 'Under Review',
    ru: 'На Рассмотрении',
    uz: 'Ko\'rib chiqilmoqda'
  },
  'financingStatus.document_collection': {
    en: 'Documents Required',
    ru: 'Требуются Документы',
    uz: 'Hujjatlar Talab qilinadi'
  },
  'financingStatus.under_review': {
    en: 'Under Review',
    ru: 'На Рассмотрении',
    uz: 'Ko\'rib chiqilmoqda'
  },
  'financingStatus.final_approval': {
    en: 'Final Approval',
    ru: 'Финальное Одобрение',
    uz: 'Yakuniy Tasdiqlash'
  },
  'financingStatus.approved': {
    en: 'Approved',
    ru: 'Одобрено',
    uz: 'Tasdiqlangan'
  },
  'financingStatus.denied': {
    en: 'Denied',
    ru: 'Отклонено',
    uz: 'Rad etilgan'
  },
  'financingStatus.pending': {
    en: 'Pending',
    ru: 'Ожидает',
    uz: 'Kutilmoqda'
  },
  'financingStatus.pendingLegacy': {
    en: 'Pending (Legacy)',
    ru: 'Ожидает (Старая)',
    uz: 'Kutilmoqda (Eski)'
  },

  // Property type translations for components
  'propertyType.apartment': {
    en: 'Apartment',
    ru: 'Квартира',
    uz: 'Kvartira'
  },
  'propertyType.house': {
    en: 'House',
    ru: 'Дом',
    uz: 'Uy'
  },
  'propertyType.studio': {
    en: 'Studio',
    ru: 'Студия',
    uz: 'Studiya'
  },
  'propertyType.commercial': {
    en: 'Commercial',
    ru: 'Коммерческая',
    uz: 'Tijorat'
  },
  'propertyType.land': {
    en: 'Land',
    ru: 'Участок',
    uz: 'Yer'
  },

  // Privacy Policy
  'privacy.title': {
    en: 'Privacy Policy',
    ru: 'Политика конфиденциальности',
    uz: 'Maxfiylik siyosati'
  },
  'privacy.subtitle': {
    en: 'Your privacy matters to us',
    ru: 'Ваша конфиденциальность важна для нас',
    uz: 'Sizning maxfiyligingiz biz uchun muhim'
  },
  'privacy.lastUpdated': {
    en: 'Last updated: 1 Sept 2025',
    ru: 'Последнее обновление: 1 сентября 2025',
    uz: 'Oxirgi yangilanish: 1 sentyabr 2025'
  },
  'privacy.intro': {
    en: 'Magit ("we", "our", "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our website, mobile app, and services ("Platform").',
    ru: 'Magit ("мы", "наш", "нас") уважает вашу конфиденциальность и обязуется защищать вашу личную информацию. Данная Политика конфиденциальности объясняет, как мы собираем, используем и защищаем ваши данные при использовании нашего веб-сайта, мобильного приложения и услуг ("Платформа").',
    uz: 'Magit ("biz", "bizning") sizning maxfiyligingizni hurmat qiladi va shaxsiy ma\'lumotlaringizni himoya qilishga majburdir. Ushbu Maxfiylik siyosati bizning veb-saytimiz, mobil ilovamiz va xizmatlarimizdan ("Platforma") foydalanganda ma\'lumotlaringizni qanday yig\'ishimiz, ishlatishimiz va himoya qilishimizni tushuntiradi.'
  },
  'privacy.section1.title': {
    en: '1. Information We Collect',
    ru: '1. Информация, которую мы собираем',
    uz: '1. Biz yig\'gan ma\'lumotlar'
  },
  'privacy.section1.content': {
    en: 'We may collect the following types of data:',
    ru: 'Мы можем собирать следующие типы данных:',
    uz: 'Biz quyidagi turdagi ma\'lumotlarni yig\'ishimiz mumkin:'
  },
  'privacy.section1.personal': {
    en: 'Personal details – full name, phone number, email address, date of birth.',
    ru: 'Личные данные – полное имя, номер телефона, адрес электронной почты, дата рождения.',
    uz: 'Shaxsiy ma\'lumotlar – to\'liq ism, telefon raqami, elektron pochta manzili, tug\'ilgan sana.'
  },
  'privacy.section1.identity': {
    en: 'Identity verification data – information retrieved through OneID (Uzbekistan\'s national digital identification system) for user registration and verification.',
    ru: 'Данные верификации личности – информация, полученная через OneID (национальная система цифровой идентификации Узбекистана) для регистрации и верификации пользователей.',
    uz: 'Shaxsni tasdiqlash ma\'lumotlari – foydalanuvchilarni ro\'yxatdan o\'tkazish va tasdiqlash uchun OneID (O\'zbekistonning milliy raqamli identifikatsiya tizimi) orqali olingan ma\'lumotlar.'
  },
  'privacy.section1.property': {
    en: 'Property-related data – preferences, saved listings, visit requests.',
    ru: 'Данные, связанные с недвижимостью – предпочтения, сохранённые объявления, запросы на просмотр.',
    uz: 'Ko\'chmas mulk bilan bog\'liq ma\'lumotlar – afzalliklar, saqlangan e\'lonlar, ko\'rish so\'rovlari.'
  },
  'privacy.section1.financial': {
    en: 'Financial information – income details, documents, and payment history (for financing applications).',
    ru: 'Финансовая информация – данные о доходах, документы и история платежей (для заявок на финансирование).',
    uz: 'Moliyaviy ma\'lumotlar – daromad ma\'lumotlari, hujjatlar va to\'lov tarixi (moliyalashtirish uchun arizalar).'
  },
  'privacy.section1.payment': {
    en: 'Payment information – bank card details, payment confirmations, receipts.',
    ru: 'Платёжная информация – данные банковских карт, подтверждения платежей, квитанции.',
    uz: 'To\'lov ma\'lumotlari – bank kartasi ma\'lumotlari, to\'lov tasdiqlamalari, kvitansiyalar.'
  },
  'privacy.section1.technical': {
    en: 'Technical data – IP address, device type, browser, app usage patterns.',
    ru: 'Технические данные – IP-адрес, тип устройства, браузер, шаблоны использования приложения.',
    uz: 'Texnik ma\'lumotlar – IP manzil, qurilma turi, brauzer, ilova foydalanish namunalari.'
  },
  'privacy.section2.title': {
    en: '2. How We Use Your Data',
    ru: '2. Как мы используем ваши данные',
    uz: '2. Ma\'lumotlaringizni qanday ishlatamiz'
  },
  'privacy.section2.content': {
    en: 'We use your data to:',
    ru: 'Мы используем ваши данные для:',
    uz: 'Biz sizning ma\'lumotlaringizni quyidagilar uchun ishlatamiz:'
  },
  'privacy.section2.verify': {
    en: 'Verify user identity through OneID during registration.',
    ru: 'Верификации личности пользователя через OneID при регистрации.',
    uz: 'Ro\'yxatdan o\'tish paytida OneID orqali foydalanuvchi shaxsini tasdiqlash.'
  },
  'privacy.section2.provide': {
    en: 'Provide access to verified property listings.',
    ru: 'Предоставления доступа к проверенным объявлениям недвижимости.',
    uz: 'Tasdiqlangan ko\'chmas mulk e\'lonlariga kirish imkonini berish.'
  },
  'privacy.section2.process': {
    en: 'Process visit requests and coordinate with sellers.',
    ru: 'Обработки запросов на просмотр и координации с продавцами.',
    uz: 'Ko\'rish so\'rovlarini qayta ishlash va sotuvchilar bilan muvofiqlashtirish.'
  },
  'privacy.section2.review': {
    en: 'Review financing applications and determine eligibility.',
    ru: 'Рассмотрения заявок на финансирование и определения соответствия критериям.',
    uz: 'Moliyalashtirish arizalarini ko\'rib chiqish va muvofiqligini aniqlash.'
  },
  'privacy.section2.payments': {
    en: 'Process payments securely through approved providers (e.g., Uzum, Payme, Click).',
    ru: 'Безопасной обработки платежей через одобренных провайдеров (например, Uzum, Payme, Click).',
    uz: 'Tasdiqlangan provaiderlar (masalan, Uzum, Payme, Click) orqali to\'lovlarni xavfsiz qayta ishlash.'
  },
  'privacy.section2.improve': {
    en: 'Improve our services, user experience, and platform security.',
    ru: 'Улучшения наших услуг, пользовательского опыта и безопасности платформы.',
    uz: 'Xizmatlarimiz, foydalanuvchi tajribasi va platforma xavfsizligini yaxshilash.'
  },
  'privacy.section2.comply': {
    en: 'Comply with legal obligations under Uzbek law.',
    ru: 'Соблюдения правовых обязательств согласно законодательству Узбекистана.',
    uz: 'O\'zbekiston qonunchiligiga muvofiq huquqiy majburiyatlarni bajarish.'
  },
  'privacy.section3.title': {
    en: '3. Data Sharing',
    ru: '3. Обмен данными',
    uz: '3. Ma\'lumotlar almashish'
  },
  'privacy.section3.content': {
    en: 'We do not sell or rent your personal data. We may share it only with:',
    ru: 'Мы не продаём и не сдаём в аренду ваши личные данные. Мы можем делиться ими только с:',
    uz: 'Biz sizning shaxsiy ma\'lumotlaringizni sotmaymiz yoki ijaraga bermaymiz. Biz ularni faqat quyidagilar bilan baham ko\'rishimiz mumkin:'
  },
  'privacy.section3.oneId': {
    en: 'OneID system – for secure identity verification.',
    ru: 'Системой OneID – для безопасной верификации личности.',
    uz: 'OneID tizimi – xavfsiz shaxsni tasdiqlash uchun.'
  },
  'privacy.section3.payment': {
    en: 'Payment providers and banks – for processing payments.',
    ru: 'Платёжными провайдерами и банками – для обработки платежей.',
    uz: 'To\'lov provayderlari va banklar – to\'lovlarni qayta ishlash uchun.'
  },
  'privacy.section3.legal': {
    en: 'Legal partners – for property verification and contracts.',
    ru: 'Юридическими партнёрами – для верификации недвижимости и контрактов.',
    uz: 'Huquqiy sheriklar – ko\'chmas mulkni tasdiqlash va shartnomalar uchun.'
  },
  'privacy.section3.government': {
    en: 'Government authorities – if required by law.',
    ru: 'Государственными органами – если требуется по закону.',
    uz: 'Davlat organlari – qonun talabi bo\'yicha.'
  },
  'privacy.section3.service': {
    en: 'Service providers – IT, hosting, or security services bound by confidentiality.',
    ru: 'Поставщиками услуг – IT, хостинг или охранные услуги, связанные обязательствами конфиденциальности.',
    uz: 'Xizmat ko\'rsatuvchilar – maxfiylik majburiyatlari bilan bog\'langan IT, hosting yoki xavfsizlik xizmatlari.'
  },
  'privacy.section4.title': {
    en: '4. Data Protection',
    ru: '4. Защита данных',
    uz: '4. Ma\'lumotlarni himoya qilish'
  },
  'privacy.section4.storage': {
    en: 'All data is stored securely on servers located in Uzbekistan or trusted partners abroad.',
    ru: 'Все данные надёжно хранятся на серверах, расположенных в Узбекистане или у доверенных партнёров за рубежом.',
    uz: 'Barcha ma\'lumotlar O\'zbekistonda yoki chet eldagi ishonchli sheriklarda joylashgan serverlarda xavfsiz saqlanadi.'
  },
  'privacy.section4.encryption': {
    en: 'Sensitive data (payments, financial details, and OneID verification results) is encrypted.',
    ru: 'Чувствительные данные (платежи, финансовые детали и результаты верификации OneID) зашифрованы.',
    uz: 'Nozik ma\'lumotlar (to\'lovlar, moliyaviy tafsilotlar va OneID tasdiqlash natijalari) shifrlangan.'
  },
  'privacy.section4.access': {
    en: 'Access to user data is limited to authorized Magit staff only.',
    ru: 'Доступ к пользовательским данным ограничен только авторизованными сотрудниками Magit.',
    uz: 'Foydalanuvchi ma\'lumotlariga kirish faqat vakolatli Magit xodimlari bilan cheklangan.'
  },
  'privacy.section5.title': {
    en: '5. User Rights',
    ru: '5. Права пользователей',
    uz: '5. Foydalanuvchi huquqlari'
  },
  'privacy.section5.content': {
    en: 'You have the right to:',
    ru: 'У вас есть право:',
    uz: 'Sizning quyidagi huquqlaringiz bor:'
  },
  'privacy.section5.request': {
    en: 'Request a copy of your personal data.',
    ru: 'Запросить копию ваших личных данных.',
    uz: 'Shaxsiy ma\'lumotlaringiz nusxasini so\'rash.'
  },
  'privacy.section5.correct': {
    en: 'Ask us to correct inaccurate or incomplete information.',
    ru: 'Попросить нас исправить неточную или неполную информацию.',
    uz: 'Noto\'g\'ri yoki to\'liq bo\'lmagan ma\'lumotlarni tuzatishni so\'rash.'
  },
  'privacy.section5.delete': {
    en: 'Request deletion of your data, unless retention is required by law.',
    ru: 'Запросить удаление ваших данных, если их сохранение не требуется по закону.',
    uz: 'Qonun tomonidan saqlash talab qilinmasa, ma\'lumotlaringizni o\'chirishni so\'rash.'
  },
  'privacy.section5.withdraw': {
    en: 'Withdraw consent for marketing communications.',
    ru: 'Отозвать согласие на маркетинговые коммуникации.',
    uz: 'Marketing aloqalari uchun rozilikni qaytarib olish.'
  },
  'privacy.section6.title': {
    en: '6. Cookies & Tracking',
    ru: '6. Куки и отслеживание',
    uz: '6. Cookie va kuzatuv'
  },
  'privacy.section6.content': {
    en: 'Magit may use cookies and analytics tools to improve your experience. You can disable cookies in your browser, but some features may stop working properly.',
    ru: 'Magit может использовать куки и аналитические инструменты для улучшения вашего опыта. Вы можете отключить куки в своём браузере, но некоторые функции могут перестать работать правильно.',
    uz: 'Magit tajribangizni yaxshilash uchun cookie va tahlil vositalaridan foydalanishi mumkin. Brauzerdagi cookie-larni o\'chirib qo\'yishingiz mumkin, lekin ba\'zi xususiyatlar to\'g\'ri ishlamasligi mumkin.'
  },
  'privacy.section7.title': {
    en: '7. Data Retention',
    ru: '7. Сохранение данных',
    uz: '7. Ma\'lumotlarni saqlash'
  },
  'privacy.section7.content': {
    en: 'We keep your data only as long as necessary to provide services or comply with legal obligations. After this, it will be securely deleted.',
    ru: 'Мы храним ваши данные только до тех пор, пока это необходимо для предоставления услуг или соблюдения правовых обязательств. После этого они будут надёжно удалены.',
    uz: 'Biz sizning ma\'lumotlaringizni faqat xizmatlar ko\'rsatish yoki qonuniy majburiyatlarni bajarish uchun zarur bo\'lgan vaqt davomida saqlaymiz. Shundan so\'ng ular xavfsiz tarzda o\'chiriladi.'
  },
  'privacy.section8.title': {
    en: '8. Contact Information',
    ru: '8. Контактная информация',
    uz: '8. Aloqa ma\'lumotlari'
  },
  'privacy.section8.content': {
    en: 'If you have questions or concerns, please contact us:',
    ru: 'Если у вас есть вопросы или сомнения, пожалуйста, свяжитесь с нами:',
    uz: 'Savollaringiz yoki xavotiringiz bo\'lsa, biz bilan bog\'laning:'
  },
  'privacy.contact.email': {
    en: '📧 magit.startup@gmail.com',
    ru: '📧 magit.startup@gmail.com',
    uz: '📧 magit.startup@gmail.com'
  },
  'privacy.contact.phone': {
    en: '📞 +998 97 558 66 69',
    ru: '📞 +998 97 558 66 69',
    uz: '📞 +998 97 558 66 69'
  },

  // About Us
  'about.title': {
    en: 'About Us',
    ru: 'О нас',
    uz: 'Biz haqimizda'
  },
  'about.subtitle': {
    en: 'Learn about our mission to revolutionize real estate in Uzbekistan',
    ru: 'Узнайте о нашей миссии по революционизации недвижимости в Узбекистане',
    uz: 'O\'zbekistonda ko\'chmas mulk sohasini inqilob qilish bo\'yicha missiyamiz haqida bilib oling'
  },
  'about.story.title': {
    en: 'Our Story',
    ru: 'Наша история',
    uz: 'Bizning hikoyamiz'
  },
  'about.story.intro': {
    en: 'For years, real estate in Uzbekistan has been controlled by intermediaries who add no value — only extra cost and stress. Sellers lose money through 3–5% commissions, while buyers face endless headaches with fake listings, hidden prices, and late-night calls.',
    ru: 'Годами недвижимость в Узбекистане контролировалась посредниками, которые не добавляют никакой ценности — только дополнительные расходы и стресс. Продавцы теряют деньги через комиссии в 3–5%, а покупатели сталкиваются с бесконечными головными болями от поддельных объявлений, скрытых цен и звонков поздно ночью.',
    uz: 'Yillar davomida O\'zbekistondagi ko\'chmas mulk hech qanday qiymat qo\'shmaydigan vositachilar tomonidan nazorat qilingan — faqat qo\'shimcha xarajatlar va stress. Sotuvchilar 3-5% komissiya orqali pul yo\'qotadilar, xaridorlar esa soxta e\'lonlar, yashirin narxlar va kechki qo\'ng\'iroqlar bilan cheksiz muammolarga duch kelishadi.'
  },
  'about.story.experience': {
    en: 'I personally experienced this frustration — both as a seller and as a buyer. On both sides of the deal, I met the same wall: a broken system that benefits middlemen but never helps real people.',
    ru: 'Я лично испытал это разочарование — как продавец и как покупатель. С обеих сторон сделки я встретил одну и ту же стену: сломанную систему, которая приносит пользу посредникам, но никогда не помогает реальным людям.',
    uz: 'Men shaxsan bu xafagarchilikni boshdan kechirdim — ham sotuvchi, ham xaridor sifatida. Bitimning har ikki tomonida men bir xil devorga duch keldim: vositachilarga foyda keltiradigan, lekin haqiqiy odamlarga hech qachon yordam bermaydigan buzilgan tizim.'
  },
  'about.story.why': {
    en: "That's why Magit was born.",
    ru: 'Именно поэтому родился Magit.',
    uz: 'Shuning uchun Magit tug\'ildi.'
  },
  'about.story.solution': {
    en: 'Magit removes unnecessary intermediaries, verifies every property, and protects sellers from commission fees. For buyers, it offers a simple, transparent marketplace combined with Islamic, interest-free financing.',
    ru: 'Magit устраняет ненужных посредников, проверяет каждую недвижимость и защищает продавцов от комиссионных сборов. Для покупателей он предлагает простую, прозрачную площадку в сочетании с исламским, беспроцентным финансированием.',
    uz: 'Magit keraksiz vositachilarni olib tashlaydi, har bir mulkni tekshiradi va sotuvchilarni komissiya to\'lovlaridan himoya qiladi. Xaridorlar uchun islomiy, foizsiz moliyalashtirish bilan birgalikda oddiy, shaffof bozor taklif etadi.'
  },
  'about.story.timing': {
    en: "In a country where the majority are Muslim, Halal financing isn't just an option — it's essential. And with recent government support for Islamic financial instruments, the timing is right to finally bring fairness and comfort into the housing market.",
    ru: 'В стране, где большинство мусульман, халяльное финансирование — это не просто вариант, это необходимость. И при недавней государственной поддержке исламских финансовых инструментов время подходящее, чтобы наконец привнести справедливость и комфорт на рынок жилья.',
    uz: "Ko'pchilik musulmon bo'lgan mamlakatda halol moliyalashtirish shunchaki variant emas — bu muhim. Va islomiy moliya vositalariga so'nggi davlat yordami bilan uy-joy bozoriga adolat va qulaylikni olib kelish uchun vaqt mos keldi."
  },
  'about.mission.title': {
    en: 'Our Mission',
    ru: 'Наша миссия',
    uz: 'Bizning missiyamiz'
  },
  'about.mission.content': {
    en: 'To make buying and selling homes in Uzbekistan transparent, safe, and accessible by removing unnecessary intermediaries, verifying every property, and offering Halal, interest-free financing — so families can achieve homeownership with comfort and dignity.',
    ru: 'Сделать покупку и продажу домов в Узбекистане прозрачными, безопасными и доступными, устранив ненужных посредников, проверив каждую недвижимость и предложив халяльное, беспроцентное финансирование — чтобы семьи могли достичь домовладения с комфортом и достоинством.',
    uz: 'O\'zbekistonda uy sotib olish va sotishni shaffof, xavfsiz va qulay qilish, keraksiz vositachilarni olib tashlash, har bir mulkni tekshirish va halol, foizsiz moliyalashtirish taklif etish orqali — oilalar qulaylik va qadr-qimmat bilan uy egasi bo\'lishga erishishlari uchun.'
  },
  'about.vision.title': {
    en: 'Our Vision',
    ru: 'Наше видение',
    uz: 'Bizning ko\'zlagan maqsadimiz'
  },
  'about.vision.content': {
    en: 'To become the most trusted real estate platform in Central Asia, where every family can find and finance their home without fear of scams, hidden costs, or unethical practices — setting a new standard for fairness and innovation in housing.',
    ru: 'Стать самой надёжной платформой недвижимости в Центральной Азии, где каждая семья может найти и финансировать свой дом без страха мошенничества, скрытых расходов или неэтичных практик — устанавливая новый стандарт справедливости и инноваций в жилье.',
    uz: 'Markaziy Osiyodagi eng ishonchli ko\'chmas mulk platformasiga aylanish, bu yerda har bir oila firibgarlik, yashirin xarajatlar yoki noaxloqiy amaliyotlardan qo\'rqmasdan o\'z uyini topishi va moliyalashtirishishi mumkin — uy-joy sohasida adolat va innovatsiyalar uchun yangi standart o\'rnatish.'
  },
  'about.future.title': {
    en: 'Future Expansion – Magit Invest',
    ru: 'Будущее расширение — Magit Invest',
    uz: 'Kelajak kengayishi — Magit Invest'
  },
  'about.future.intro': {
    en: 'After building trust with property buyers and sellers, Magit will introduce Magit Invest — a platform where individuals can invest their savings directly into Halal home financing projects. This creates a win–win model:',
    ru: 'После создания доверия с покупателями и продавцами недвижимости, Magit представит Magit Invest — платформу, где частные лица могут инвестировать свои сбережения напрямую в халяльные проекты финансирования жилья. Это создаёт взаимовыгодную модель:',
    uz: 'Ko\'chmas mulk xaridorlari va sotuvchilar bilan ishonch o\'rnatgandan so\'ng, Magit Magit Invest-ni taqdim etadi — shaxslar o\'z jamg\'armalarini to\'g\'ridan-to\'g\'ri halol uy moliyalashtiruvi loyihalariga sarmoya kiritishlari mumkin bo\'lgan platforma. Bu g\'alaba-g\'alaba modelini yaratadi:'
  },
  'about.future.families': {
    en: 'Families get fair, interest-free financing to buy homes.',
    ru: 'Семьи получают справедливое, беспроцентное финансирование для покупки домов.',
    uz: 'Oilalar uy sotib olish uchun adolatli, foizsiz moliyalashtirish oladilar.'
  },
  'about.future.investors': {
    en: 'Everyday investors get a chance to earn stable, Halal passive income from real assets.',
    ru: 'Обычные инвесторы получают возможность зарабатывать стабильный, халяльный пассивный доход от реальных активов.',
    uz: 'Oddiy investorlar haqiqiy aktivlardan barqaror, halol passiv daromad olish imkoniyatiga ega bo\'ladilar.'
  },
  'about.future.community': {
    en: 'The community as a whole reduces dependence on banks and high-risk credit.',
    ru: 'Сообщество в целом снижает зависимость от банков и высокорискованных кредитов.',
    uz: 'Jamoa umuman banklar va yuqori xavfli kreditlarga bog\'liqlikni kamaytiradi.'
  },

  // How It Works page
  'howItWorks.title': {
    en: 'How Magit Works',
    ru: 'Как работает Magit',
    uz: 'Magit qanday ishlaydi'
  },
  'howItWorks.subtitle': {
    en: 'Choose your path and discover how to buy property the smart way',
    ru: 'Выберите свой путь и узнайте, как умно покупать недвижимость',
    uz: 'O\'z yo\'lingizni tanlang va mulkni aqlli usulda sotib olishni o\'rganing'
  },
  
  // Coin Flip Section
  'howItWorks.coinQuestion': {
    en: 'How do you want to purchase your property?',
    ru: 'Как вы хотите купить свою недвижимость?',
    uz: 'Mulkingizni qanday sotib olmoqchisiz?'
  },
  'howItWorks.pleaseChoose': {
    en: 'please choose...',
    ru: 'пожалуйста, выберите...',
    uz: 'iltimos tanlang...'
  },
  'howItWorks.cashOption': {
    en: 'Cash Purchase',
    ru: 'Наличными',
    uz: 'Naqd to\'lov'
  },
  'howItWorks.financingOption': {
    en: 'Halal Financing',
    ru: 'Халяль финансирование',
    uz: 'Halol moliyalashtirish'
  },

  // Coin Sides Information
  'howItWorks.cashSide.title': {
    en: 'Cash Purchase',
    ru: 'Наличная покупка',
    uz: 'Naqd xarid'
  },
  'howItWorks.cashSide.subtitle': {
    en: 'Direct marketplace buying',
    ru: 'Прямая покупка на площадке',
    uz: 'To\'g\'ridan-to\'g\'ri bozordan xarid'
  },
  'howItWorks.cashSide.feature1': {
    en: 'Instant ownership',
    ru: 'Мгновенное владение',
    uz: 'Darhol egalik'
  },
  'howItWorks.cashSide.feature2': {
    en: 'No interest fees',
    ru: 'Без процентов',
    uz: 'Foizsiz'
  },
  'howItWorks.cashSide.feature3': {
    en: 'Simple process',
    ru: 'Простой процесс',
    uz: 'Oddiy jarayon'
  },
  'howItWorks.financingSide.title': {
    en: 'Halal Financing',
    ru: 'Халяль финансирование',
    uz: 'Halol moliyalashtirish'
  },
  'howItWorks.financingSide.subtitle': {
    en: 'Interest-free installments',
    ru: 'Беспроцентная рассрочка',
    uz: 'Foizsiz bo\'lib to\'lash'
  },
  'howItWorks.financingSide.feature1': {
    en: 'Sharia compliant',
    ru: 'По шариату',
    uz: 'Shariatga mos'
  },
  'howItWorks.financingSide.feature2': {
    en: 'Flexible payments',
    ru: 'Гибкие платежи',
    uz: 'Moslashuvchan to\'lovlar'
  },
  'howItWorks.financingSide.feature3': {
    en: 'Community trusted',
    ru: 'Доверие общества',
    uz: 'Jamiyat ishonchi'
  },

  // Path-specific badges
  'howItWorks.cashBadge': {
    en: '✓ Verified Marketplace',
    ru: '✓ Проверенная площадка',
    uz: '✓ Tekshirilgan platforma'
  },
  'howItWorks.financingBadge': {
    en: '✓ Sharia-Compliant Platform',
    ru: '✓ Шариатская платформа',
    uz: '✓ Shariatga mos platforma'
  },

  // Cash Purchase Steps
  'howItWorks.cashStepsTitle': {
    en: 'Cash Purchase Process',
    ru: 'Процесс покупки наличными',
    uz: 'Naqd xarid jarayoni'
  },
  'howItWorks.cashStepsSubtitle': {
    en: 'Four simple steps to own your property',
    ru: 'Четыре простых шага к владению недвижимостью',
    uz: 'Mulk egasi bo\'lish uchun to\'rtta oddiy qadam'
  },
  'howItWorks.cash.step1.title': {
    en: 'Browse Verified Properties',
    ru: 'Просмотр проверенных объектов',
    uz: 'Tekshirilgan mulklarni ko\'rish'
  },
  'howItWorks.cash.step1.description': {
    en: 'Search through our verified marketplace with transparent pricing and no hidden fees',
    ru: 'Ищите на нашей проверенной площадке с прозрачными ценами и без скрытых комиссий',
    uz: 'Shaffof narxlar va yashirin to\'lovsiz tekshirilgan bozorimizda qidiring'
  },
  'howItWorks.cash.step1.feature1': {
    en: 'ID-verified sellers only',
    ru: 'Только проверенные продавцы',
    uz: 'Faqat tekshirilgan sotuvchilar'
  },
  'howItWorks.cash.step1.feature2': {
    en: 'No broker commissions',
    ru: 'Без комиссий брокеров',
    uz: 'Broker komissiyasisiz'
  },
  'howItWorks.cash.step1.feature3': {
    en: 'Real-time property updates',
    ru: 'Обновления в реальном времени',
    uz: 'Real vaqtda yangilanishlar'
  },
  'howItWorks.cash.step2.title': {
    en: 'Schedule & Visit',
    ru: 'Запланировать и посетить',
    uz: 'Rejalashtirish va tashrif'
  },
  'howItWorks.cash.step2.description': {
    en: 'Book verified visits with property owners through our secure platform',
    ru: 'Бронируйте проверенные посещения с владельцами через нашу безопасную платформу',
    uz: 'Xavfsiz platformamiz orqali mulk egalari bilan tekshirilgan tashriflarni bron qiling'
  },
  'howItWorks.cash.step2.feature1': {
    en: 'Direct owner contact',
    ru: 'Прямой контакт с владельцем',
    uz: 'Egasi bilan to\'g\'ridan-to\'g\'ri aloqa'
  },
  'howItWorks.cash.step2.feature2': {
    en: 'Visit confirmation system',
    ru: 'Система подтверждения визитов',
    uz: 'Tashrif tasdiqlash tizimi'
  },
  'howItWorks.cash.step2.feature3': {
    en: 'Safety guidelines provided',
    ru: 'Предоставлены правила безопасности',
    uz: 'Xavfsizlik qoidalari taqdim etilgan'
  },
  'howItWorks.cash.step3.title': {
    en: 'Secure Payment',
    ru: 'Безопасный платеж',
    uz: 'Xavfsiz to\'lov'
  },
  'howItWorks.cash.step3.description': {
    en: 'Make secure payments using verified payment methods with buyer protection',
    ru: 'Совершайте безопасные платежи проверенными способами с защитой покупателя',
    uz: 'Xaridor himoyasi bilan tekshirilgan to\'lov usullari orqali xavfsiz to\'lovlar qiling'
  },
  'howItWorks.cash.step3.feature1': {
    en: 'Escrow payment protection',
    ru: 'Защита эскроу платежей',
    uz: 'Eskrou to\'lov himoyasi'
  },
  'howItWorks.cash.step3.feature2': {
    en: 'Multiple payment options',
    ru: 'Множественные способы оплаты',
    uz: 'Ko\'p to\'lov variantlari'
  },
  'howItWorks.cash.step3.feature3': {
    en: 'Transaction verification',
    ru: 'Проверка транзакций',
    uz: 'Tranzaksiya tasdiqlanishi'
  },
  'howItWorks.cash.step4.title': {
    en: 'Property Transfer',
    ru: 'Передача собственности',
    uz: 'Mulk o\'tkazish'
  },
  'howItWorks.cash.step4.description': {
    en: 'Complete the legal transfer process with our guided documentation support',
    ru: 'Завершите процесс правовой передачи с нашей поддержкой документооборота',
    uz: 'Bizning hujjat yuritish yordamimiz bilan qonuniy o\'tkazish jarayonini yakunlang'
  },
  'howItWorks.cash.step4.feature1': {
    en: 'Legal documentation help',
    ru: 'Помощь с юридическими документами',
    uz: 'Huquqiy hujjatlar yordami'
  },
  'howItWorks.cash.step4.feature2': {
    en: 'Title transfer assistance',
    ru: 'Помощь с передачей права собственности',
    uz: 'Huquq o\'tkazish yordami'
  },
  'howItWorks.cash.step4.feature3': {
    en: 'Post-purchase support',
    ru: 'Поддержка после покупки',
    uz: 'Xariddan keyingi yordam'
  },

  // Halal Financing Steps
  'howItWorks.financingStepsTitle': {
    en: 'Halal Financing Process',
    ru: 'Процесс халяль финансирования',
    uz: 'Halol moliyalashtirish jarayoni'
  },
  'howItWorks.financingStepsSubtitle': {
    en: 'Four steps to Sharia-compliant property ownership',
    ru: 'Четыре шага к владению недвижимостью по шариату',
    uz: 'Shariatga mos mulk egachiligiga to\'rtta qadam'
  },
  'howItWorks.financing.step1.title': {
    en: 'Browse & Filter',
    ru: 'Просмотр и фильтрация',
    uz: 'Ko\'rish va filtrlash'
  },
  'howItWorks.financing.step1.description': {
    en: 'Search financing-eligible properties and calculate your halal payment plan',
    ru: 'Ищите объекты, подходящие для финансирования, и рассчитайте халяль план платежей',
    uz: 'Moliyalashtirish uchun mos mulklarni qidiring va halol to\'lov rejangizni hisoblang'
  },
  'howItWorks.financing.step1.feature1': {
    en: 'Halal-eligible properties only',
    ru: 'Только халяль объекты',
    uz: 'Faqat halol mulklar'
  },
  'howItWorks.financing.step1.feature2': {
    en: 'Payment calculator included',
    ru: 'Включен калькулятор платежей',
    uz: 'To\'lov kalkulyatori mavjud'
  },
  'howItWorks.financing.step1.feature3': {
    en: 'Flexible payment terms',
    ru: 'Гибкие условия платежей',
    uz: 'Moslashuvchan to\'lov shartlari'
  },
  'howItWorks.financing.step2.title': {
    en: 'Visit & Apply',
    ru: 'Посещение и заявка',
    uz: 'Tashrif va ariza'
  },
  'howItWorks.financing.step2.description': {
    en: 'Visit properties and submit your halal financing application with required documents',
    ru: 'Посетите объекты и подайте заявку на халяль финансирование с необходимыми документами',
    uz: 'Mulklarni ko\'ring va kerakli hujjatlar bilan halol moliyalashtirish arizangizni yuboring'
  },
  'howItWorks.financing.step2.feature1': {
    en: 'Quick application process',
    ru: 'Быстрый процесс заявки',
    uz: 'Tez ariza jarayoni'
  },
  'howItWorks.financing.step2.feature2': {
    en: 'Document verification help',
    ru: 'Помощь с проверкой документов',
    uz: 'Hujjat tekshirish yordami'
  },
  'howItWorks.financing.step2.feature3': {
    en: 'Pre-approval available',
    ru: 'Доступно предварительное одобрение',
    uz: 'Oldindan tasdiqlash mavjud'
  },
  'howItWorks.financing.step3.title': {
    en: 'Financing Approval',
    ru: 'Одобрение финансирования',
    uz: 'Moliyalashtirish tasdiqlanishi'
  },
  'howItWorks.financing.step3.description': {
    en: 'Get approved for halal financing with transparent terms and no hidden interest',
    ru: 'Получите одобрение халяль финансирования с прозрачными условиями и без скрытых процентов',
    uz: 'Shaffof shartlar va yashirin foizsiz halol moliyalashtirish uchun tasdiqlang'
  },
  'howItWorks.financing.step3.feature1': {
    en: 'No interest charges ever',
    ru: 'Никогда без процентов',
    uz: 'Hech qachon foizsiz'
  },
  'howItWorks.financing.step3.feature2': {
    en: 'Clear payment schedule',
    ru: 'Четкий график платежей',
    uz: 'Aniq to\'lov jadvali'
  },
  'howItWorks.financing.step3.feature3': {
    en: 'Sharia board certified',
    ru: 'Сертифицировано шариатским советом',
    uz: 'Shariat kengashi tomonidan sertifikatlangan'
  },
  'howItWorks.financing.step4.title': {
    en: 'Move In & Pay',
    ru: 'Заселение и оплата',
    uz: 'Ko\'chish va to\'lash'
  },
  'howItWorks.financing.step4.description': {
    en: 'Move into your new home and make convenient monthly payments until full ownership',
    ru: 'Переезжайте в новый дом и делайте удобные ежемесячные платежи до полного владения',
    uz: 'Yangi uyingizga ko\'ching va to\'liq egalik huquqi olguncha qulay oylik to\'lovlar qiling'
  },
  'howItWorks.financing.step4.feature1': {
    en: 'Immediate occupancy',
    ru: 'Немедленное заселение',
    uz: 'Darhol egallash'
  },
  'howItWorks.financing.step4.feature2': {
    en: 'Flexible payment options',
    ru: 'Гибкие варианты оплаты',
    uz: 'Moslashuvchan to\'lov variantlari'
  },
  'howItWorks.financing.step4.feature3': {
    en: 'Early payment rewards',
    ru: 'Награды за досрочную оплату',
    uz: 'Erta to\'lov mukofotlari'
  },

  'howItWorks.stepLabel': {
    en: 'Step',
    ru: 'Шаг',
    uz: 'Qadam'
  },
  'howItWorks.badge': {
    en: 'No Hidden Fees • No Intermediaries • 100% Verified',
    ru: 'Без скрытых комиссий • Без посредников • 100% проверено',
    uz: 'Yashirin to\'lovlar yo\'q • Vositachilar yo\'q • 100% tasdiqlangan'
  },
  
  'howItWorks.step1.title': {
    en: 'Browse Verified Properties',
    ru: 'Просматривайте проверенную недвижимость',
    uz: 'Tasdiqlangan mulklarni ko\'rib chiqing'
  },
  'howItWorks.step1.description': {
    en: 'Every property on Magit is personally verified by our staff. No fake listings, no hidden surprises.',
    ru: 'Каждая недвижимость на Magit лично проверяется нашими сотрудниками. Никаких фейковых объявлений, никаких скрытых сюрпризов.',
    uz: 'Magitdagi har bir mulk bizning xodimlarimiz tomonidan shaxsan tekshiriladi. Soxta e\'lonlar yo\'q, yashirin kutilmagan holatlar yo\'q.'
  },
  'howItWorks.step1.feature1': {
    en: 'All properties verified by Magit staff before listing',
    ru: 'Все объекты проверяются сотрудниками Magit перед размещением',
    uz: 'Barcha mulklar e\'lon qilishdan oldin Magit xodimlari tomonidan tekshiriladi'
  },
  'howItWorks.step1.feature2': {
    en: 'Real photos and accurate property details',
    ru: 'Настоящие фотографии и точные детали недвижимости',
    uz: 'Haqiqiy rasmlar va aniq mulk tafsilotlari'
  },
  'howItWorks.step1.feature3': {
    en: 'Transparent pricing with no hidden costs',
    ru: 'Прозрачные цены без скрытых расходов',
    uz: 'Yashirin xarajatlarsiz shaffof narxlar'
  },
  
  'howItWorks.step2.title': {
    en: 'Schedule Property Visits',
    ru: 'Запланируйте просмотр недвижимости',
    uz: 'Mulkni ko\'rishni rejalashtiring'
  },
  'howItWorks.step2.description': {
    en: 'Book visits directly through the platform. Our team coordinates everything for a smooth experience.',
    ru: 'Бронируйте просмотры прямо через платформу. Наша команда координирует все для гладкого опыта.',
    uz: 'Tashrif buyurishni to\'g\'ridan-to\'g\'ri platforma orqali bron qiling. Bizning jamoamiz silliq tajriba uchun hamma narsani muvofiqlashtiradi.'
  },
  'howItWorks.step2.feature1': {
    en: 'Easy online visit scheduling',
    ru: 'Легкое онлайн планирование визитов',
    uz: 'Oson onlayn tashrif rejalashtirish'
  },
  'howItWorks.step2.feature2': {
    en: 'Magit staff coordinates with property owners',
    ru: 'Сотрудники Magit координируются с владельцами недвижимости',
    uz: 'Magit xodimlari mulk egalari bilan muvofiqlashadi'
  },
  'howItWorks.step2.feature3': {
    en: 'Professional guidance during property visits',
    ru: 'Профессиональное руководство во время просмотра недвижимости',
    uz: 'Mulkni ko\'rish paytida professional yo\'l-yo\'riq'
  },
  
  'howItWorks.step3.title': {
    en: 'Apply for Halal Financing',
    ru: 'Подайте заявку на халяльное финансирование',
    uz: 'Halol moliyalashtirish uchun ariza bering'
  },
  'howItWorks.step3.description': {
    en: 'Get interest-free, Shariah-compliant financing with flexible terms and competitive rates.',
    ru: 'Получите беспроцентное, соответствующее шариату финансирование с гибкими условиями и конкурентными ставками.',
    uz: 'Moslashuvchan shartlar va raqobatbardosh stavkalar bilan foizsiz, Shariatga mos moliyalashtirish oling.'
  },
  'howItWorks.step3.feature1': {
    en: '100% interest-free (riba-free) financing',
    ru: '100% беспроцентное (без риба) финансирование',
    uz: '100% foizsiz (riba-free) moliyalashtirish'
  },
  'howItWorks.step3.feature2': {
    en: 'Down payments from 30-90% based on agreement',
    ru: 'Первоначальные взносы от 30-90% на основе соглашения',
    uz: 'Kelishuv asosida 30-90% gacha boshlang\'ich to\'lovlar'
  },
  'howItWorks.step3.feature3': {
    en: 'Fixed monthly installments with no hidden charges',
    ru: 'Фиксированные ежемесячные взносы без скрытых комиссий',
    uz: 'Yashirin to\'lovlarsiz qat\'iy oylik to\'lovlar'
  },
  
  'howItWorks.step4.title': {
    en: 'Secure Payment & Ownership',
    ru: 'Безопасный платеж и право собственности',
    uz: 'Xavfsiz to\'lov va egalik huquqi'
  },
  'howItWorks.step4.description': {
    en: 'Complete your purchase through secure payment methods and trusted legal processes.',
    ru: 'Завершите покупку через безопасные способы оплаты и надежные юридические процессы.',
    uz: 'Xavfsiz to\'lov usullari va ishonchli yuridik jarayonlar orqali xaridingizni yakunlang.'
  },
  'howItWorks.step4.feature1': {
    en: 'Multiple payment options (Uzum, Click, Payme, bank transfer)',
    ru: 'Множественные варианты оплаты (Uzum, Click, Payme, банковский перевод)',
    uz: 'Ko\'plab to\'lov variantlari (Uzum, Click, Payme, bank o\'tkazmasi)'
  },
  'howItWorks.step4.feature2': {
    en: 'Legal documentation handled by our partners',
    ru: 'Юридическая документация обрабатывается нашими партнерами',
    uz: 'Yuridik hujjatlar bizning hamkorlarimiz tomonidan ko\'rib chiqiladi'
  },
  'howItWorks.step4.feature3': {
    en: 'Full ownership transfer with government registration',
    ru: 'Полная передача права собственности с государственной регистрацией',
    uz: 'Davlat ro\'yxatiga olish bilan to\'liq egalik huquqini o\'tkazish'
  },
  
  'howItWorks.whyChoose.title': {
    en: 'Why Choose Magit?',
    ru: 'Почему выбрать Magit?',
    uz: 'Nega Magitni tanlash kerak?'
  },
  'howItWorks.whyChoose.reason1.title': {
    en: 'Verified & Secure',
    ru: 'Проверено и безопасно',
    uz: 'Tasdiqlangan va xavfsiz'
  },
  'howItWorks.whyChoose.reason1.description': {
    en: 'Every property is personally verified by our team. Your data and payments are protected.',
    ru: 'Каждая недвижимость лично проверяется нашей командой. Ваши данные и платежи защищены.',
    uz: 'Har bir mulk bizning jamoamiz tomonidan shaxsan tekshiriladi. Sizning ma\'lumotlaringiz va to\'lovlaringiz himoyalangan.'
  },
  'howItWorks.whyChoose.reason2.title': {
    en: 'No Commission Fees',
    ru: 'Без комиссионных',
    uz: 'Komissiya to\'lovlari yo\'q'
  },
  'howItWorks.whyChoose.reason2.description': {
    en: 'Sellers keep 100% of their sale price. Buyers pay no verification or platform fees.',
    ru: 'Продавцы сохраняют 100% цены продажи. Покупатели не платят за проверку или использование платформы.',
    uz: 'Sotuvchilar o\'z sotuv narxining 100% ini saqlab qoladilar. Xaridorlar tekshirish yoki platforma to\'lovlarini to\'lamaydilar.'
  },
  'howItWorks.whyChoose.reason3.title': {
    en: 'Halal Financing',
    ru: 'Халяльное финансирование',
    uz: 'Halol moliyalashtirish'
  },
  'howItWorks.whyChoose.reason3.description': {
    en: 'Interest-free financing that complies with Islamic principles and Uzbek regulations.',
    ru: 'Беспроцентное финансирование, соответствующее исламским принципам и узбекским правилам.',
    uz: 'Islom tamoyillari va O\'zbekiston qoidalariga mos foizsiz moliyalashtirish.'
  }
};
const LANGUAGE_STORAGE_KEY = 'magit_language';
const isSupportedLang = (val: any): val is Language => ['en', 'ru', 'uz'].includes(val);

const getBrowserLang = (): Language => {
  try {
    const nav = (navigator.language || 'ru').split('-')[0];
    return isSupportedLang(nav) ? nav : 'ru';
  } catch {
    return 'ru';
  }
};

const getStoredLang = (): Language => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLang(stored) ? stored : getBrowserLang();
  } catch {
    return getBrowserLang();
  }
};

export const useTranslation = () => {
  const { user } = useUser();
  const [language, setLanguageState] = useState<Language>(getStoredLang);

  // Sync across tabs/components using events
  useEffect(() => {
    const onLangEvent = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as Language | undefined;
        if (detail && isSupportedLang(detail) && detail !== language) {
          setLanguageState(detail);
        }
      } catch {}
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && e.newValue && isSupportedLang(e.newValue) && e.newValue !== language) {
        setLanguageState(e.newValue as Language);
      }
    };
    window.addEventListener('magit:language', onLangEvent as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('magit:language', onLangEvent as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, [language]);

  // Load user's saved language from Supabase when available
  useEffect(() => {
    const loadProfileLang = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('language')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data?.language) {
        const lang = data.language as Language;
        if (isSupportedLang(lang) && lang !== language) {
          setLanguageState(lang);
          try { localStorage.setItem(LANGUAGE_STORAGE_KEY, lang); } catch {}
        }
      }
    };
    void loadProfileLang();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const persistLanguage = async (lang: Language) => {
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, lang); } catch {}
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('user_id', user.id);
      if (error) {
        // Non-blocking error
        console.error('Failed to save language to profile', error);
      }
    }
  };

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    // Broadcast change to all hook instances across the app
    try { window.dispatchEvent(new CustomEvent('magit:language', { detail: lang })); } catch {}
    void persistLanguage(lang);
  }, [user?.id]);

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || key;
  }, [language]);

  return {
    language,
    setLanguage,
    t
  };
};
