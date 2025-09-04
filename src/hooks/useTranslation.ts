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
    en: '• Document review within 24 hours',
    ru: '• Проверка документов в течение 24 часов',
    uz: '• Hujjatlar 24 soat ichida ko\'rib chiqiladi'
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
    en: 'List your property for free. No hidden fees or commission charges.',
    ru: 'Размещайте объект бесплатно. Никаких скрытых платежей или комиссий.',
    uz: 'Mulkingizni bepul joylashtiring. Yashirin to\'lovlar yoki komissiya yo\'q.'
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
  'listProperty.proofOwnership': {
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
  'profile.accountType': {
    en: 'Account Type',
    ru: 'Тип аккаунта',
    uz: 'Akkaunt turi'
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
  'profile.verificationStatus': {
    en: 'Verification Status',
    ru: 'Статус верификации',
    uz: 'Tasdiqlash holati'
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
  'admin.financing.stageUnderReview': {
    en: 'Under Review',
    ru: 'На Рассмотрении',
    uz: 'Ko\'rib chiqilmoqda'
  },
  'admin.financing.stageFinalApproval': {
    en: 'Final Approval',
    ru: 'Окончательное Одобрение',
    uz: 'Yakuniy Tasdiqlash'
  },
  'admin.financing.stageApproved': {
    en: 'Approved',
    ru: 'Одобрено',
    uz: 'Tasdiqlangan'
  },
  'admin.financing.stageDenied': {
    en: 'Denied',
    ru: 'Отклонено',
    uz: 'Rad etilgan'
  },
  'admin.financing.viewDetails': {
    en: 'View Details',
    ru: 'Просмотр Деталей',
    uz: 'Tafsilotlarni Ko\'rish'
  },
  'admin.financing.quickDeny': {
    en: 'Quick Deny',
    ru: 'Быстро Отклонить',
    uz: 'Tez Rad etish'
  },
  'admin.financing.deleteTitle': {
    en: 'Delete Financing Request',
    ru: 'Удалить Заявку на Финансирование',
    uz: 'Moliyalashtirish So\'rovini O\'chirish'
  },
  'admin.financing.deleteDescription': {
    en: 'Are you sure you want to permanently delete this financing request? This action cannot be undone.',
    ru: 'Вы уверены, что хотите навсегда удалить эту заявку на финансирование? Это действие нельзя отменить.',
    uz: 'Ushbu moliyalashtirish so\'rovini butunlay o\'chirishni xohlaysizmi? Bu amalni bekor qilib bo\'lmaydi.'
  },
  'admin.financing.deleteConfirm': {
    en: 'Delete Request',
    ru: 'Удалить Заявку',
    uz: 'So\'rovni O\'chirish'
  },
  'admin.financing.denyTitle': {
    en: 'Deny Financing Request',
    ru: 'Отклонить Заявку на Финансирование',
    uz: 'Moliyalashtirish So\'rovini Rad etish'
  },
  'admin.financing.denyDescription': {
    en: 'Please provide a reason for denying this financing request:',
    ru: 'Пожалуйста, укажите причину отклонения этой заявки на финансирование:',
    uz: 'Ushbu moliyalashtirish so\'rovini rad etish sababini ko\'rsating:'
  },
  'admin.financing.denyReason': {
    en: 'Enter denial reason...',
    ru: 'Введите причину отклонения...',
    uz: 'Rad etish sababini kiriting...'
  },
  'admin.financing.denyConfirm': {
    en: 'Deny Request',
    ru: 'Отклонить Заявку',
    uz: 'So\'rovni Rad etish'
  },

  // District Review Panel
  'admin.districts.title': {
    en: 'District review (manual)',
    ru: 'Обзор районов (ручной)',
    uz: 'Tumanlarni ko\'rib chiqish (qo\'lda)'
  },
  'admin.districts.limit': {
    en: 'Limit',
    ru: 'Лимит',
    uz: 'Cheklov'
  },
  'admin.districts.scanSuggestions': {
    en: 'Scan suggestions',
    ru: 'Сканировать предложения',
    uz: 'Takliflarni skanerlash'
  },
  'admin.districts.scanning': {
    en: 'Scanning…',
    ru: 'Сканирование…',
    uz: 'Skanerlanmoqda…'
  },
  'admin.districts.noSuggestions': {
    en: 'No suggestions yet. Run a scan to preview districts without auto-changing.',
    ru: 'Пока нет предложений. Запустите сканирование для предварительного просмотра районов без автоматического изменения.',
    uz: 'Hozircha takliflar yo\'q. Avtomatik o\'zgartirishsiz tumanlarni oldindan ko\'rish uchun skanerlashni ishga tushiring.'
  },
  'admin.districts.property': {
    en: 'Property',
    ru: 'Недвижимость',
    uz: 'Mulk'
  },
  'admin.districts.current': {
    en: 'Current',
    ru: 'Текущий',
    uz: 'Joriy'
  },
  'admin.districts.suggested': {
    en: 'Suggested',
    ru: 'Предлагаемый',
    uz: 'Taklif qilingan'
  },
  'admin.districts.via': {
    en: 'via',
    ru: 'через',
    uz: 'orqali'
  },
  'admin.districts.apply': {
    en: 'Apply',
    ru: 'Применить',
    uz: 'Qo\'llash'
  },
  'admin.districts.applying': {
    en: 'Applying…',
    ru: 'Применение…',
    uz: 'Qo\'llanmoqda…'
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
