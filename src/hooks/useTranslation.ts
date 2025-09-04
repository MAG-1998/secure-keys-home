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
    en: '1,500+ Verified Homes',
    ru: '1,500+ проверенных домов',
    uz: '1,500+ tekshirilgan uy'
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
    en: 'Scam-free marketplace with 1,500+ verified properties across Tashkent',
    ru: 'Безопасная площадка с 1,500+ проверенными объектами в Ташкенте',
    uz: 'Toshkentda 1,500+ tekshirilgan uy bilan xavfsiz platforma'
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
  'filter.bedrooms': {
    en: 'Bedrooms',
    ru: 'Комнаты',
    uz: 'Xonalar'
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

  // Common
  'common.any': {
    en: 'Any',
    ru: 'Любой',
    uz: 'Hammasi'
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
    uz: 'Halol moliyalashtirish'
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
    en: 'Terms',
    ru: 'Условия',
    uz: 'Shartlar'
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
  'common.cancel': { en: 'Cancel', ru: 'Отмена', uz: 'Bekor qilish' },

  // Admin
  'admin.pending': { en: 'pending', ru: 'ожидает', uz: 'kutilmoqda' },
  'admin.approved': { en: 'approved', ru: 'одобрено', uz: 'tasdiqlangan' },
  'admin.rejected': { en: 'rejected', ru: 'отклонено', uz: 'rad etilgan' },
  'admin.saveFailed': { en: 'Failed to save review', ru: 'Не удалось сохранить отзыв', uz: 'Sharhni saqlash muvaffaqiyatsiz' },

  // Property Management
  'property.edit': { en: 'Edit', ru: 'Редактировать', uz: 'Tahrirlash' },
  'property.save': { en: 'Save Changes', ru: 'Сохранить изменения', uz: 'O\'zgarishlarni saqlash' },
  'property.generalInfo': { en: 'General Info', ru: 'Общая информация', uz: 'Umumiy ma\'lumot' },
  'property.photos': { en: 'Photos', ru: 'Фотографии', uz: 'Suratlar' },
  'property.financing': { en: 'Financing', ru: 'Финансирование', uz: 'Moliyalashtirish' },
  'property.displayName': { en: 'Display Name', ru: 'Отображаемое имя', uz: 'Ko\'rsatiladigan nom' },
  'property.displayNamePlaceholder': { en: 'Enter property name', ru: 'Введите название объекта', uz: 'Mulk nomini kiriting' },
  'property.price': { en: 'Price (USD)', ru: 'Цена (USD)', uz: 'Narx (USD)' },
  'property.description': { en: 'Description', ru: 'Описание', uz: 'Tavsif' },

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
  'common.success': { en: 'Success', ru: 'Успех', uz: 'Muvaffaqiyat' },
  'common.error': { en: 'Error', ru: 'Ошибка', uz: 'Xato' },
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
