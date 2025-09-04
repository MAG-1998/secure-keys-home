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
  // Page titles 
  'pageTitle.dashboard': {
    en: 'Dashboard',
    ru: 'Панель управления',
    uz: 'Boshqaruv paneli'
  },
  'pageTitle.profile': {
    en: 'Profile',
    ru: 'Профиль',
    uz: 'Profil'
  },
  'pageTitle.myProperties': {
    en: 'My Properties',
    ru: 'Мои объекты',
    uz: 'Mening uylarim'
  },

  // Dashboard Welcome & Main Actions  
  'dashboard.welcome': {
    en: 'Welcome to Magit',
    ru: 'Добро пожаловать в Magit',
    uz: 'Magitga xush kelibsiz'
  },
  'dashboard.choosePath': {
    en: 'Choose your path to finding the perfect property',
    ru: 'Выберите свой путь к поиску идеальной недвижимости',
    uz: 'Mukammal uy topish yo\'lingizni tanlang'
  },
  'dashboard.listProperty.title': {
    en: 'List Property',
    ru: 'Разместить объект',
    uz: 'Uy joylash'
  },
  'dashboard.listProperty.description': {
    en: 'Share your property with verified buyers',
    ru: 'Поделитесь своей недвижимостью с проверенными покупателями',
    uz: 'Uyingizni tekshirilgan xaridorlar bilan bo\'lishing'
  },
  'dashboard.listProperty.features.professional': {
    en: 'Professional photography',
    ru: 'Профессиональная фотосъёмка',
    uz: 'Professional fotosurat'
  },
  'dashboard.listProperty.features.photos': {
    en: 'High-quality photos',
    ru: 'Высококачественные фото',
    uz: 'Yuqori sifatli fotosuratlar'
  },
  'dashboard.listProperty.features.analytics': {
    en: 'Detailed analytics',
    ru: 'Подробная аналитика',
    uz: 'Batafsil tahlil'
  },
  'dashboard.listProperty.getStarted': {
    en: 'Get Started',
    ru: 'Начать',
    uz: 'Boshlash'
  },
  'dashboard.findProperty.title': {
    en: 'Find Property',
    ru: 'Найти объект',
    uz: 'Uy topish'
  },
  'dashboard.findProperty.description': {
    en: 'Discover your dream home with verified listings',
    ru: 'Найдите дом своей мечты с проверенными объявлениями',
    uz: 'Tekshirilgan e\'lonlar bilan orzuingizdagi uyni toping'
  },
  'dashboard.findProperty.features.verified': {
    en: 'Verified properties',
    ru: 'Проверенные объекты',
    uz: 'Tekshirilgan uylar'
  },
  'dashboard.findProperty.features.financing': {
    en: 'Financing options',
    ru: 'Варианты финансирования',
    uz: 'Moliyalashtirish variantlari'
  },
  'dashboard.findProperty.features.map': {
    en: 'Interactive map',
    ru: 'Интерактивная карта',
    uz: 'Interaktiv xarita'
  },
  'dashboard.findProperty.startBrowsing': {
    en: 'Start Browsing',
    ru: 'Начать поиск',
    uz: 'Ko\'rishni boshlash'
  },
  'dashboard.contactSupport': {
    en: 'Need help? Contact our support team',
    ru: 'Нужна помощь? Свяжитесь с нашей командой поддержки',
    uz: 'Yordam kerakmi? Yordam jamoamizga murojaat qiling'
  },

  // Profile Page translations
  'profile.backToDashboard': {
    en: 'Back to Dashboard',
    ru: 'Назад к панели',
    uz: 'Boshqaruv paneliga qaytish'
  },
  'profile.title': {
    en: 'My Profile',
    ru: 'Мой профиль',
    uz: 'Mening profilim'
  },
  'profile.editProfile': {
    en: 'Edit Profile',
    ru: 'Редактировать профиль',
    uz: 'Profilni tahrirlash'
  },
  'profile.saveChanges': {
    en: 'Save Changes',
    ru: 'Сохранить изменения',
    uz: 'O\'zgarishlarni saqlash'
  },
  'profile.personalInfo': {
    en: 'Personal Information',
    ru: 'Личная информация',
    uz: 'Shaxsiy ma\'lumotlar'
  },
  'profile.fullName': {
    en: 'Full Name',
    ru: 'Полное имя',
    uz: 'To\'liq ism'
  },
  'profile.email': {
    en: 'Email',
    ru: 'Электронная почта',
    uz: 'Email'
  },
  'profile.phoneNumber': {
    en: 'Phone Number',
    ru: 'Номер телефона',
    uz: 'Telefon raqami'
  },
  'profile.accountType': {
    en: 'Account Type',
    ru: 'Тип аккаунта',
    uz: 'Hisob turi'
  },
  'profile.identityVerification': {
    en: 'Identity Verification',
    ru: 'Проверка личности',
    uz: 'Shaxsni tasdiqlash'
  },

  // My Properties Page translations
  'myProperties.title': {
    en: 'My Properties',
    ru: 'Мои объекты',
    uz: 'Mening uylarim'
  },
  'myProperties.addProperty': {
    en: 'Add Property',
    ru: 'Добавить объект',
    uz: 'Uy qo\'shish'
  },
  'myProperties.noProperties': {
    en: 'No properties listed yet',
    ru: 'Пока нет размещённых объектов',
    uz: 'Hali uylar joylashtirilmagan'
  },
  'myProperties.listFirst': {
    en: 'List Your First Property',
    ru: 'Разместить первый объект',
    uz: 'Birinchi uyingizni joylash'
  },
  'myProperties.status.approved': {
    en: 'Approved',
    ru: 'Одобрено',
    uz: 'Tasdiqlangan'
  },
  'myProperties.status.notApproved': {
    en: 'Pending Review',
    ru: 'На рассмотрении',
    uz: 'Ko\'rib chiqilmoqda'
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
    ru: 'Просмотры',
    uz: 'Tashriflar'
  },
  'myProperties.views': {
    en: 'Views',
    ru: 'Просмотры',
    uz: 'Ko\'rishlar'
  },
  'myProperties.visitRequests': {
    en: 'Visit Requests',
    ru: 'Заявки на просмотр',
    uz: 'Tashrif so\'rovlari'
  },
  'myProperties.upcomingVisits': {
    en: 'No upcoming visits',
    ru: 'Нет предстоящих просмотров',
    uz: 'Kelgusi tashriflar yo\'q'
  },
  'myProperties.manage': {
    en: 'Manage',
    ru: 'Управлять',
    uz: 'Boshqarish'
  },

  // Common
  'common.contactSupport': {
    en: 'Contact Support',
    ru: 'Связаться с поддержкой',
    uz: 'Yordam bilan aloqa'
  },
  'common.startListingFirst': {
    en: 'Get started by listing your first property',
    ru: 'Начните с размещения вашего первого объекта',
    uz: 'Birinchi uyingizni joylash bilan boshlang'
  },

  // Navigation fallbacks for compatibility
  'nav.home': {
    en: 'Home',
    ru: 'Главная',
    uz: 'Bosh sahifa'
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

  // Hero fallbacks for compatibility
  'hero.titleStandard': {
    en: 'Find Your Perfect Home',
    ru: 'Найди свой идеальный дом',
    uz: 'Mukammal uyingizni toping'
  },

  // Minimal essential keys
  'search.placeholder': {
    en: 'Search properties...',
    ru: 'Поиск недвижимости...',
    uz: 'Uylarni qidirish...'
  },
  'footer.about': {
    en: 'About',
    ru: 'О нас',
    uz: 'Biz haqimizda'
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

const getInitialLang = (): Language => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && isSupportedLang(saved)) return saved;
  } catch {}
  return getBrowserLang();
};

export const useTranslation = () => {
  const { user } = useUser();
  const [language, setLanguageState] = useState<Language>(getInitialLang());

  // Sync language across the entire app (same tab) and across tabs
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