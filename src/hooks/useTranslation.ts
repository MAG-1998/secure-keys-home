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
  'search.monthlySalary': {
    en: 'Monthly Salary ($)',
    ru: 'Месячная зарплата ($)',
    uz: 'Oylik maosh ($)'
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

  // Common
  'common.any': {
    en: 'Any',
    ru: 'Любой',
    uz: 'Har qanday'
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
  'map.bed': {
    en: 'bed',
    ru: 'спальни',
    uz: 'xona'
  },
  'map.bath': {
    en: 'bath',
    ru: 'санузел',
    uz: 'hammom'
  },
  'map.myListing': {
    en: 'My Listing',
    ru: 'Моё объявление',
    uz: 'Mening eʼlonim'
  }
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('ru');

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || key;
  }, [language]);

  return {
    language,
    setLanguage,
    t
  };
};
