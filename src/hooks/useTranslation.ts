import { useState, useCallback } from 'react';

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
  'nav.about': {
    en: 'About',
    ru: 'О нас',
    uz: 'Biz haqimizda'
  },
  'nav.contact': {
    en: 'Contact',
    ru: 'Контакты',
    uz: 'Aloqa'
  },
  'nav.signIn': {
    en: 'Sign In',
    ru: 'Войти',
    uz: 'Kirish'
  },
  'nav.getStarted': {
    en: 'Get Started',
    ru: 'Начать',
    uz: 'Boshlash'
  },

  // Hero Section
  'hero.title': {
    en: 'Find Your Perfect Property with Smart Financing',
    ru: 'Найдите идеальную недвижимость с умным финансированием',
    uz: 'Aqlli moliyalashtirish bilan mukammal mulkni toping'
  },
  'hero.subtitle': {
    en: 'Discover thousands of verified properties with flexible financing options including Sharia-compliant solutions.',
    ru: 'Откройте для себя тысячи проверенных объектов недвижимости с гибкими вариантами финансирования, включая решения, соответствующие шариату.',
    uz: 'Shariat talablariga mos yechimlar bilan moslashuvchan moliyalashtirish imkoniyatlari bilan minglab tasdiqlangan mulklarni kashf eting.'
  },
  'hero.trustedBy': {
    en: 'Trusted by 50,000+ users',
    ru: 'Доверяют 50,000+ пользователей',
    uz: '50,000+ foydalanuvchi ishonadi'
  },
  'hero.verifiedProperties': {
    en: '10,000+ Verified Properties',
    ru: '10,000+ проверенных объектов',
    uz: '10,000+ tasdiqlangan mulk'
  },
  'hero.shariahCompliant': {
    en: 'Shariah Compliant Financing',
    ru: 'Финансирование в соответствии с шариатом',
    uz: 'Shariatga mos moliyalashtirish'
  },

  // Features
  'features.smartSearch': {
    en: 'Smart Property Search',
    ru: 'Умный поиск недвижимости',
    uz: 'Aqlli mulk qidiruvi'
  },
  'features.smartSearchDesc': {
    en: 'Advanced filters and AI-powered recommendations to find your perfect property match.',
    ru: 'Расширенные фильтры и рекомендации на основе ИИ для поиска идеальной недвижимости.',
    uz: 'Mukammal mulkni topish uchun ilg\'or filtrlar va AI-ga asoslangan tavsiyalar.'
  },
  'features.financing': {
    en: 'Flexible Financing',
    ru: 'Гибкое финансирование',
    uz: 'Moslashuvchan moliyalashtirish'
  },
  'features.financingDesc': {
    en: 'Multiple financing options including conventional and Shariah-compliant solutions.',
    ru: 'Множественные варианты финансирования, включая обычные и шариатские решения.',
    uz: 'An\'anaviy va shariatga mos yechimlar bilan ko\'plab moliyalashtirish imkoniyatlari.'
  },
  'features.verification': {
    en: 'Property Verification',
    ru: 'Проверка недвижимости',
    uz: 'Mulk tekshiruvi'
  },
  'features.verificationDesc': {
    en: 'All properties undergo thorough verification for authenticity and legal compliance.',
    ru: 'Вся недвижимость проходит тщательную проверку на подлинность и соответствие закону.',
    uz: 'Barcha mulklar haqiqiylik va qonuniy muvofiqlik uchun to\'liq tekshiruvdan o\'tadi.'
  },
  'features.support': {
    en: '24/7 Expert Support',
    ru: 'Экспертная поддержка 24/7',
    uz: '24/7 ekspert yordami'
  },
  'features.supportDesc': {
    en: 'Get professional guidance from our real estate experts whenever you need it.',
    ru: 'Получите профессиональные консультации от наших экспертов по недвижимости в любое время.',
    uz: 'Kerak bo\'lganda ko\'chmas mulk ekspertlarimizdan professional yo\'l-yo\'riq oling.'
  },

  // Stats
  'stats.properties': {
    en: 'Properties Listed',
    ru: 'Объектов размещено',
    uz: 'Ro\'yxatga olingan mulklar'
  },
  'stats.customers': {
    en: 'Happy Customers',
    ru: 'Довольных клиентов',
    uz: 'Mamnun mijozlar'
  },
  'stats.financing': {
    en: 'Financing Options',
    ru: 'Вариантов финансирования',
    uz: 'Moliyalashtirish imkoniyatlari'
  },
  'stats.support': {
    en: 'Support Rating',
    ru: 'Рейтинг поддержки',
    uz: 'Yordam reytingi'
  },

  // CTA
  'cta.title': {
    en: 'Ready to Find Your Dream Property?',
    ru: 'Готовы найти недвижимость своей мечты?',
    uz: 'Orzuingizdagi mulkni topishga tayyormisiz?'
  },
  'cta.subtitle': {
    en: 'Join thousands of satisfied customers who found their perfect home with our platform.',
    ru: 'Присоединяйтесь к тысячам довольных клиентов, которые нашли свой идеальный дом с нашей платформой.',
    uz: 'Bizning platformamiz bilan mukammal uyini topgan minglab mamnun mijozlarga qo\'shiling.'
  },
  'cta.button': {
    en: 'Start Your Search',
    ru: 'Начать поиск',
    uz: 'Qidiruvni boshlash'
  },

  // Search Section
  'search.halalMode': {
    en: 'Enable Halal Mode',
    ru: 'Включить халяльный режим',
    uz: 'Halol rejimini yoqish'
  },
  'search.standardMode': {
    en: 'Standard Mode',
    ru: 'Стандартный режим',
    uz: 'Standart rejim'
  }
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || key;
  }, [language]);

  return {
    language,
    setLanguage,
    t
  };
};