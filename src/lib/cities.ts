export type CityKey = 
  // Tashkent (capital city)
  | 'Tashkent'
  // Andijan Region
  | 'Oqoltin' | 'Oltinkol' | 'Andijon' | 'Asaka' | 'Oxunboboyev' | 'Baliqchi' 
  | 'Boz' | 'Buloqboshi' | 'Qorasuv_Andijan' | 'Kuyganyor' | 'Qorgontepa' 
  | 'Marhamat' | 'Poytug' | 'Paxtaobod' | 'Xonobod' | 'Xojaobod' | 'Shahrixon'
  // Bukhara Region
  | 'Olot' | 'Buxoro' | 'Vobkent' | 'Gazli' | 'Galaosiyo' | 'Gijduvon' 
  | 'Jondor' | 'Kogon' | 'Qorakol' | 'Qorovulbozor' | 'Romitan' | 'Shofirkon'
  // Fergana Region
  | 'Oltiariq' | 'Bogdod' | 'Beshariq' | 'Vodil' | 'Dangara' | 'Qoqon' 
  | 'Quva' | 'Quvasoy' | 'Langar' | 'Margilon' | 'Navbahor' | 'Ravon' 
  | 'Rishton' | 'Toshloq' | 'Uchkoprik' | 'Fargona' | 'Hamza' 
  | 'Shohimardon' | 'Yozyovon' | 'Yaypan' | 'YangiMargilon' | 'Yangiqorgon'
  // Jizzakh Region
  | 'Aydarkol' | 'Balandchaqir' | 'Gagarin' | 'Gallaorol' | 'Goliblar'
  | 'Dashtaobod' | 'Jizzax' | 'Dostlik' | 'Zomin' | 'Zarbdor' 
  | 'Zafarobod' | 'Marjonbuloq' | 'Paxtakor' | 'Osmat' | 'Uchtepa' | 'Yangiqishloq'
  // Namangan Region
  | 'Jamashoy' | 'Kosonsoy' | 'Namangan' | 'Pop' | 'Toshbuloq' 
  | 'Toraqorgon' | 'Uchqorgon' | 'Xaqqulobod' | 'Chortoq' | 'Chust'
  // Navoiy Region
  | 'Beshrobot' | 'Zarafshon' | 'Konimex' | 'Karmana' | 'Qiziltepa' 
  | 'Navoiy' | 'Nurota' | 'Tomdibuloq' | 'Uchquduq' | 'Yangirobot'
  // Qashqadaryo Region
  | 'Beshkent' | 'Guzor' | 'Dehqonobod' | 'Qamashi' | 'Karashina' 
  | 'Qarshi' | 'Koson' | 'Kasbi' | 'Kitob' | 'Muborak' | 'Muglon' 
  | 'Talimarjon' | 'Chiroqchi' | 'Shahrisabz' | 'Yakkabog' | 'Mirishkor' | 'Nishon'
  // Samarqand Region
  | 'Oqtosh' | 'Bulungur' | 'Gozalkent' | 'Gulobod' | 'Darband' 
  | 'Jomboy' | 'Juma' | 'Ziadin' | 'Ishtixon' | 'Kottaqorgon' 
  | 'Qoshrobod' | 'Loish' | 'Nurobod' | 'Payariq' | 'Payshanba' 
  | 'Samarqand' | 'Tayloq' | 'Urgut' | 'Chelak'
  // Sirdaryo Region
  | 'Sirdaryo' | 'Baxt' | 'Boyovut' | 'Guliston' | 'Navroz' 
  | 'Sayxun' | 'Sardoba' | 'Terenozek' | 'Xovos' | 'Shirin' | 'Yangiyer'
  // Surxondaryo Region
  | 'Angor' | 'Boysun' | 'Bandixon' | 'Denov' | 'Jarqorgon' 
  | 'Qorlik' | 'Qiziriq' | 'Qumqorgon' | 'Muzrobod' | 'Sariosiyo' 
  | 'Sariq' | 'Termiz' | 'Uzun' | 'Uchqizil' | 'Xalqobod' 
  | 'Shargun' | 'Sherobod' | 'Shorchi'
  // Tashkent Region
  | 'Soqoq' | 'Oqqorgon' | 'Olmaliq' | 'Angren' | 'Ohangaron' 
  | 'Bekobod' | 'KattaChimyon' | 'Boka' | 'Gazalkent' | 'Gulbahor' 
  | 'Durmen' | 'Dostobod' | 'Zangiota' | 'Zafar' | 'Iskandar' 
  | 'Qorasuv_Tashkent' | 'Keles' | 'Qibray' | 'Koksaroy' | 'Krasnogorsk' | 'Mirobod' 
  | 'Nazarbek' | 'Toytepa' | 'Parkent' | 'Pskent' | 'Salar' 
  | 'Tashmore' | 'Turkiston' | 'Ortaovul' | 'Xojakent' | 'Chorvoq' 
  | 'Chinoz' | 'Chirchiq' | 'Eshonguzar' | 'Yangibozor' | 'Yangiyol'
  // Xorazm Region
  | 'Bogot' | 'Gurlan' | 'Qorovul' | 'Qoshkopir' | 'Pitnak' 
  | 'Urganch' | 'Xozarasp' | 'Xonqa' | 'Xiva' | 'Cholish' 
  | 'Shovot' | 'Yangiariq'
  // Karakalpakstan
  | 'Oqmangit' | 'Beruniy' | 'Boston' | 'Qanlikol' | 'Qoraozak' 
  | 'Kegeyli' | 'Qongirot' | 'Mangit' | 'Moynoq' | 'Nukus' 
  | 'Taxiatosh' | 'Tortkol' | 'Xojayli' | 'Chimboy' | 'Shumanay';

export type Language = 'en' | 'ru' | 'uz';

export const CITIES: Record<CityKey, {
  labels: Record<Language, string>;
  synonyms: string[];
  coordinates: [number, number];
}> = {
  // Tashkent (Capital City)
  Tashkent: {
    labels: { en: 'Tashkent', ru: 'Ташкент', uz: 'Toshkent' },
    synonyms: ['Tashkent', 'Ташкент', 'Toshkent', 'tashkent'],
    coordinates: [41.2995, 69.2401]
  },

  // Andijan Region
  Oqoltin: {
    labels: { en: 'Oqoltin', ru: 'Окултин', uz: 'Oqoltin' },
    synonyms: ['Oqoltin', 'Окултин'],
    coordinates: [40.68, 72.25]
  },
  Oltinkol: {
    labels: { en: 'Oltinkol', ru: 'Олтинколь', uz: "oltinko'l" },
    synonyms: ['Oltinkol', 'Олтинколь', "oltinko'l"],
    coordinates: [40.72, 72.18]
  },
  Andijon: {
    labels: { en: 'Andijan', ru: 'Андижан', uz: 'Andijon' },
    synonyms: ['Andijan', 'Андижан', 'Andijon', 'andijan'],
    coordinates: [40.7821, 72.3442]
  },
  Asaka: {
    labels: { en: 'Asaka', ru: 'Асака', uz: 'Asaka' },
    synonyms: ['Asaka', 'Асака'],
    coordinates: [40.6461, 72.2386]
  },
  Oxunboboyev: {
    labels: { en: 'Oxunboboyev', ru: 'Охунбобоев', uz: 'Oxunboboyev' },
    synonyms: ['Oxunboboyev', 'Охунбобоев'],
    coordinates: [40.75, 72.28]
  },
  Baliqchi: {
    labels: { en: 'Baliqchi', ru: 'Баликчи', uz: 'Baliqchi' },
    synonyms: ['Baliqchi', 'Баликчи'],
    coordinates: [40.85, 72.30]
  },
  Boz: {
    labels: { en: 'Boz', ru: 'Боз', uz: "Bo'z" },
    synonyms: ['Boz', 'Боз', "Bo'z"],
    coordinates: [40.73, 72.35]
  },
  Buloqboshi: {
    labels: { en: 'Buloqboshi', ru: 'Булокбоши', uz: 'Buloqboshi' },
    synonyms: ['Buloqboshi', 'Булокбоши'],
    coordinates: [40.88, 72.42]
  },
  Qorasuv_Andijan: {
    labels: { en: 'Qorasuv', ru: 'Корасув', uz: 'Qorasuv' },
    synonyms: ['Qorasuv', 'Корасув'],
    coordinates: [40.72, 72.88]
  },
  Kuyganyor: {
    labels: { en: 'Kuyganyor', ru: 'Куйганьер', uz: 'Kuyganyor' },
    synonyms: ['Kuyganyor', 'Куйганьер'],
    coordinates: [40.74, 72.20]
  },
  Qorgontepa: {
    labels: { en: 'Qorgontepa', ru: 'Коргонтепа', uz: "Qo'rg'ontepa" },
    synonyms: ['Qorgontepa', 'Коргонтепа', "Qo'rg'ontepa"],
    coordinates: [40.73, 72.68]
  },
  Marhamat: {
    labels: { en: 'Marhamat', ru: 'Мархамат', uz: 'Marhamat' },
    synonyms: ['Marhamat', 'Мархамат'],
    coordinates: [40.50, 72.33]
  },
  Poytug: {
    labels: { en: 'Poytug', ru: 'Пойтуг', uz: "Poytug'" },
    synonyms: ['Poytug', 'Пойтуг', "Poytug'"],
    coordinates: [40.61, 72.20]
  },
  Paxtaobod: {
    labels: { en: 'Paxtaobod', ru: 'Пахтаобод', uz: 'Paxtaobod' },
    synonyms: ['Paxtaobod', 'Пахтаобод'],
    coordinates: [40.31, 72.02]
  },
  Xonobod: {
    labels: { en: 'Xonobod', ru: 'Хонобод', uz: 'Xonobod' },
    synonyms: ['Xonobod', 'Хонобод'],
    coordinates: [40.82, 72.10]
  },
  Xojaobod: {
    labels: { en: 'Xojaobod', ru: 'Ходжаобод', uz: "Xo'jaobod" },
    synonyms: ['Xojaobod', 'Ходжаобод', "Xo'jaobod"],
    coordinates: [40.69, 72.45]
  },
  Shahrixon: {
    labels: { en: 'Shahrixon', ru: 'Шахрихан', uz: 'Shahrixon' },
    synonyms: ['Shahrixon', 'Шахрихан'],
    coordinates: [40.71, 72.05]
  },

  // Bukhara Region
  Olot: {
    labels: { en: 'Olot', ru: 'Олот', uz: 'Olot' },
    synonyms: ['Olot', 'Олот'],
    coordinates: [39.93, 64.42]
  },
  Buxoro: {
    labels: { en: 'Bukhara', ru: 'Бухара', uz: 'Buxoro' },
    synonyms: ['Bukhara', 'Бухара', 'Buxoro', 'bukhara'],
    coordinates: [39.7747, 64.4286]
  },
  Vobkent: {
    labels: { en: 'Vobkent', ru: 'Вабкент', uz: 'Vobkent' },
    synonyms: ['Vobkent', 'Вабкент'],
    coordinates: [40.03, 64.51]
  },
  Gazli: {
    labels: { en: 'Gazli', ru: 'Газли', uz: 'Gazli' },
    synonyms: ['Gazli', 'Газли'],
    coordinates: [40.13, 63.45]
  },
  Galaosiyo: {
    labels: { en: 'Galaosiyo', ru: 'Галаосиё', uz: 'Galaosiyo' },
    synonyms: ['Galaosiyo', 'Галаосиё'],
    coordinates: [39.85, 64.50]
  },
  Gijduvon: {
    labels: { en: 'Gijduvon', ru: 'Гиждуван', uz: "G'ijduvon" },
    synonyms: ['Gijduvon', 'Гиждуван', "G'ijduvon"],
    coordinates: [40.10, 64.68]
  },
  Jondor: {
    labels: { en: 'Jondor', ru: 'Жондор', uz: 'Jondor' },
    synonyms: ['Jondor', 'Жондор'],
    coordinates: [39.68, 63.97]
  },
  Kogon: {
    labels: { en: 'Kogon', ru: 'Коган', uz: 'Kogon' },
    synonyms: ['Kogon', 'Коган'],
    coordinates: [39.73, 64.54]
  },
  Qorakol: {
    labels: { en: 'Qorakol', ru: 'Коракуль', uz: "Qorako'l" },
    synonyms: ['Qorakol', 'Коракуль', "Qorako'l"],
    coordinates: [39.53, 63.85]
  },
  Qorovulbozor: {
    labels: { en: 'Qorovulbozor', ru: 'Коровулбазар', uz: 'Qorovulbozor' },
    synonyms: ['Qorovulbozor', 'Коровулбазар'],
    coordinates: [39.50, 64.73]
  },
  Romitan: {
    labels: { en: 'Romitan', ru: 'Ромитан', uz: 'Romitan' },
    synonyms: ['Romitan', 'Ромитан'],
    coordinates: [39.93, 64.37]
  },
  Shofirkon: {
    labels: { en: 'Shofirkon', ru: 'Шофиркон', uz: 'Shofirkon' },
    synonyms: ['Shofirkon', 'Шофиркон'],
    coordinates: [39.98, 64.50]
  },

  // Fergana Region
  Oltiariq: {
    labels: { en: 'Oltiariq', ru: 'Алтиарык', uz: 'Oltiariq' },
    synonyms: ['Oltiariq', 'Алтиарык'],
    coordinates: [40.38, 72.25]
  },
  Bogdod: {
    labels: { en: 'Bogdod', ru: 'Багдад', uz: "Bog'dod" },
    synonyms: ['Bogdod', 'Багдад', "Bog'dod"],
    coordinates: [40.43, 70.82]
  },
  Beshariq: {
    labels: { en: 'Beshariq', ru: 'Бешарык', uz: 'Beshariq' },
    synonyms: ['Beshariq', 'Бешарык'],
    coordinates: [40.43, 70.61]
  },
  Vodil: {
    labels: { en: 'Vodil', ru: 'Вадиль', uz: 'Vodil' },
    synonyms: ['Vodil', 'Вадиль'],
    coordinates: [40.33, 71.65]
  },
  Dangara: {
    labels: { en: 'Dangara', ru: 'Дангара', uz: "Dang'ara" },
    synonyms: ['Dangara', 'Дангара', "Dang'ara"],
    coordinates: [40.45, 69.35]
  },
  Qoqon: {
    labels: { en: 'Kokand', ru: 'Коканд', uz: "Qo'qon" },
    synonyms: ['Kokand', 'Коканд', "Qo'qon", 'Qoqon', 'kokand'],
    coordinates: [40.5285, 70.9425]
  },
  Quva: {
    labels: { en: 'Quva', ru: 'Кува', uz: 'Quva' },
    synonyms: ['Quva', 'Кува'],
    coordinates: [40.52, 72.03]
  },
  Quvasoy: {
    labels: { en: 'Quvasoy', ru: 'Кувасай', uz: 'Quvasoy' },
    synonyms: ['Quvasoy', 'Кувасай'],
    coordinates: [40.30, 72.03]
  },
  Langar: {
    labels: { en: 'Langar', ru: 'Лангар', uz: 'Langar' },
    synonyms: ['Langar', 'Лангар'],
    coordinates: [40.42, 71.92]
  },
  Margilon: {
    labels: { en: 'Margilan', ru: 'Маргилан', uz: "Marg'ilon" },
    synonyms: ['Margilan', 'Маргилан', "Marg'ilon", 'margilan'],
    coordinates: [40.4717, 71.7247]
  },
  Navbahor: {
    labels: { en: 'Navbahor', ru: 'Навбахор', uz: 'Navbahor' },
    synonyms: ['Navbahor', 'Навбахор'],
    coordinates: [40.55, 71.88]
  },
  Ravon: {
    labels: { en: 'Ravon', ru: 'Равон', uz: 'Ravon' },
    synonyms: ['Ravon', 'Равон'],
    coordinates: [40.28, 71.78]
  },
  Rishton: {
    labels: { en: 'Rishton', ru: 'Риштан', uz: 'Rishton' },
    synonyms: ['Rishton', 'Риштан'],
    coordinates: [40.36, 71.28]
  },
  Toshloq: {
    labels: { en: 'Toshloq', ru: 'Ташлак', uz: 'Toshloq' },
    synonyms: ['Toshloq', 'Ташлак'],
    coordinates: [40.38, 71.03]
  },
  Uchkoprik: {
    labels: { en: 'Uchkoprik', ru: 'Учкуприк', uz: "Uchko'prik" },
    synonyms: ['Uchkoprik', 'Учкуприк', "Uchko'prik"],
    coordinates: [40.28, 71.23]
  },
  Fargona: {
    labels: { en: 'Fergana', ru: 'Фергана', uz: "Farg'ona" },
    synonyms: ['Fergana', 'Фергана', "Farg'ona", 'fergana'],
    coordinates: [40.3864, 71.7864]
  },
  Hamza: {
    labels: { en: 'Hamza', ru: 'Хамза', uz: 'Hamza' },
    synonyms: ['Hamza', 'Хамза'],
    coordinates: [40.43, 71.58]
  },
  Shohimardon: {
    labels: { en: 'Shohimardon', ru: 'Шахимардан', uz: 'Shohimardon' },
    synonyms: ['Shohimardon', 'Шахимардан'],
    coordinates: [39.99, 71.76]
  },
  Yozyovon: {
    labels: { en: 'Yozyovon', ru: 'Язъяван', uz: 'Yozyovon' },
    synonyms: ['Yozyovon', 'Язъяван'],
    coordinates: [40.60, 71.73]
  },
  Yaypan: {
    labels: { en: 'Yaypan', ru: 'Яйпан', uz: 'Yaypan' },
    synonyms: ['Yaypan', 'Яйпан'],
    coordinates: [40.38, 71.82]
  },
  YangiMargilon: {
    labels: { en: 'Yangi Margilan', ru: 'Янги Маргилан', uz: 'Yangi Marg\'ilon' },
    synonyms: ['Yangi Margilan', 'Янги Маргилан', 'Yangi Marg\'ilon'],
    coordinates: [40.43, 71.68]
  },
  Yangiqorgon: {
    labels: { en: 'Yangiqorgon', ru: 'Янгикурган', uz: "Yangiqo'rg'on" },
    synonyms: ['Yangiqorgon', 'Янгикурган', "Yangiqo'rg'on"],
    coordinates: [40.32, 71.71]
  },

  // Jizzakh Region
  Aydarkol: {
    labels: { en: 'Aydarkol', ru: 'Айдаркуль', uz: "Aydarko'l" },
    synonyms: ['Aydarkol', 'Айдаркуль', "Aydarko'l"],
    coordinates: [40.65, 66.82]
  },
  Balandchaqir: {
    labels: { en: 'Balandchaqir', ru: 'Баландчакир', uz: 'Balandchaqir' },
    synonyms: ['Balandchaqir', 'Баландчакир'],
    coordinates: [40.25, 67.92]
  },
  Gagarin: {
    labels: { en: 'Gagarin', ru: 'Гагарин', uz: 'Gagarin' },
    synonyms: ['Gagarin', 'Гагарин'],
    coordinates: [40.30, 68.12]
  },
  Gallaorol: {
    labels: { en: 'Gallaorol', ru: 'Галлаарал', uz: "G'allaorol" },
    synonyms: ['Gallaorol', 'Галлаарал', "G'allaorol"],
    coordinates: [40.12, 67.58]
  },
  Goliblar: {
    labels: { en: 'Goliblar', ru: 'Голиблар', uz: "G'oliblar" },
    synonyms: ['Goliblar', 'Голиблар', "G'oliblar"],
    coordinates: [40.18, 67.95]
  },
  Dashtaobod: {
    labels: { en: 'Dashtaobod', ru: 'Даштаобод', uz: 'Dashtaobod' },
    synonyms: ['Dashtaobod', 'Даштаобод'],
    coordinates: [40.35, 68.42]
  },
  Jizzax: {
    labels: { en: 'Jizzakh', ru: 'Джизак', uz: 'Jizzax' },
    synonyms: ['Jizzakh', 'Джизак', 'Jizzax', 'jizzakh'],
    coordinates: [40.1158, 67.8422]
  },
  Dostlik: {
    labels: { en: 'Dostlik', ru: 'Дустлик', uz: "Do'stlik" },
    synonyms: ['Dostlik', 'Дустлик', "Do'stlik"],
    coordinates: [40.35, 68.05]
  },
  Zomin: {
    labels: { en: 'Zomin', ru: 'Зомин', uz: 'Zomin' },
    synonyms: ['Zomin', 'Зомин'],
    coordinates: [39.97, 68.40]
  },
  Zarbdor: {
    labels: { en: 'Zarbdor', ru: 'Зарбдор', uz: 'Zarbdor' },
    synonyms: ['Zarbdor', 'Зарбдор'],
    coordinates: [40.22, 67.68]
  },
  Zafarobod: {
    labels: { en: 'Zafarobod', ru: 'Зафарабад', uz: 'Zafarobod' },
    synonyms: ['Zafarobod', 'Зафарабад'],
    coordinates: [40.08, 67.72]
  },
  Marjonbuloq: {
    labels: { en: 'Marjonbuloq', ru: 'Марджонбулак', uz: 'Marjonbuloq' },
    synonyms: ['Marjonbuloq', 'Марджонбулак'],
    coordinates: [40.28, 68.22]
  },
  Paxtakor: {
    labels: { en: 'Paxtakor', ru: 'Пахтакор', uz: 'Paxtakor' },
    synonyms: ['Paxtakor', 'Пахтакор'],
    coordinates: [40.32, 67.95]
  },
  Osmat: {
    labels: { en: 'Osmat', ru: 'Усмат', uz: "O'smat" },
    synonyms: ['Osmat', 'Усмат', "O'smat"],
    coordinates: [40.15, 68.18]
  },
  Uchtepa: {
    labels: { en: 'Uchtepa', uz: 'Uchtepa', ru: 'Учтепа' },
    synonyms: ['Uchtepa', 'Учтепа'],
    coordinates: [40.25, 67.75]
  },
  Yangiqishloq: {
    labels: { en: 'Yangiqishloq', ru: 'Янгикишлак', uz: 'Yangiqishloq' },
    synonyms: ['Yangiqishloq', 'Янгикишлак'],
    coordinates: [40.28, 68.35]
  },

  // Namangan Region
  Jamashoy: {
    labels: { en: 'Jamashoy', ru: 'Джамашой', uz: "Jamasho'y" },
    synonyms: ['Jamashoy', 'Джамашой', "Jamasho'y"],
    coordinates: [41.08, 71.20]
  },
  Kosonsoy: {
    labels: { en: 'Kosonsoy', ru: 'Косонсой', uz: 'Kosonsoy' },
    synonyms: ['Kosonsoy', 'Косонсой'],
    coordinates: [41.25, 71.55]
  },
  Namangan: {
    labels: { en: 'Namangan', ru: 'Наманган', uz: 'Namangan' },
    synonyms: ['Namangan', 'Наманган', 'namangan'],
    coordinates: [40.9983, 71.6726]
  },
  Pop: {
    labels: { en: 'Pop', ru: 'Поп', uz: 'Pop' },
    synonyms: ['Pop', 'Поп'],
    coordinates: [41.00, 71.10]
  },
  Toshbuloq: {
    labels: { en: 'Toshbuloq', ru: 'Ташбулак', uz: 'Toshbuloq' },
    synonyms: ['Toshbuloq', 'Ташбулак'],
    coordinates: [40.88, 71.85]
  },
  Toraqorgon: {
    labels: { en: 'Toraqorgon', ru: 'Туракурган', uz: "To'raqo'rg'on" },
    synonyms: ['Toraqorgon', 'Туракурган', "To'raqo'rg'on"],
    coordinates: [40.98, 71.02]
  },
  Uchqorgon: {
    labels: { en: 'Uchqorgon', ru: 'Учкурган', uz: "Uchqo'rg'on" },
    synonyms: ['Uchqorgon', 'Учкурган', "Uchqo'rg'on"],
    coordinates: [41.12, 71.98]
  },
  Xaqqulobod: {
    labels: { en: 'Xaqqulobod', ru: 'Хаккулабад', uz: 'Xaqqulobod' },
    synonyms: ['Xaqqulobod', 'Хаккулабад'],
    coordinates: [40.92, 71.95]
  },
  Chortoq: {
    labels: { en: 'Chortoq', ru: 'Чартак', uz: 'Chortoq' },
    synonyms: ['Chortoq', 'Чартак'],
    coordinates: [41.05, 71.82]
  },
  Chust: {
    labels: { en: 'Chust', ru: 'Чуст', uz: 'Chust' },
    synonyms: ['Chust', 'Чуст'],
    coordinates: [41.00, 71.23]
  },

  // Navoiy Region
  Beshrobot: {
    labels: { en: 'Beshrobot', ru: 'Бешрабат', uz: 'Beshrobot' },
    synonyms: ['Beshrobot', 'Бешрабат'],
    coordinates: [40.35, 65.18]
  },
  Zarafshon: {
    labels: { en: 'Zarafshon', ru: 'Зарафшан', uz: 'Zarafshon' },
    synonyms: ['Zarafshon', 'Зарафшан'],
    coordinates: [41.57, 64.20]
  },
  Konimex: {
    labels: { en: 'Konimex', ru: 'Канимех', uz: 'Konimex' },
    synonyms: ['Konimex', 'Канимех'],
    coordinates: [40.08, 64.25]
  },
  Karmana: {
    labels: { en: 'Karmana', ru: 'Кармана', uz: 'Karmana' },
    synonyms: ['Karmana', 'Кармана'],
    coordinates: [40.12, 65.53]
  },
  Qiziltepa: {
    labels: { en: 'Qiziltepa', ru: 'Кызылтепа', uz: 'Qiziltepa' },
    synonyms: ['Qiziltepa', 'Кызылтепа'],
    coordinates: [40.05, 65.15]
  },
  Navoiy: {
    labels: { en: 'Navoiy', ru: 'Навои', uz: 'Navoiy' },
    synonyms: ['Navoiy', 'Навои', 'navoiy'],
    coordinates: [40.0844, 65.3792]
  },
  Nurota: {
    labels: { en: 'Nurota', ru: 'Нурата', uz: 'Nurota' },
    synonyms: ['Nurota', 'Нурата'],
    coordinates: [40.55, 65.68]
  },
  Tomdibuloq: {
    labels: { en: 'Tomdibuloq', ru: 'Томдибулак', uz: 'Tomdibuloq' },
    synonyms: ['Tomdibuloq', 'Томдибулак'],
    coordinates: [40.38, 64.62]
  },
  Uchquduq: {
    labels: { en: 'Uchquduq', ru: 'Учкудук', uz: 'Uchquduq' },
    synonyms: ['Uchquduq', 'Учкудук'],
    coordinates: [42.15, 63.56]
  },
  Yangirobot: {
    labels: { en: 'Yangirobot', ru: 'Янгирабат', uz: 'Yangirobot' },
    synonyms: ['Yangirobot', 'Янгирабат'],
    coordinates: [40.28, 64.95]
  },

  // Qashqadaryo Region
  Beshkent: {
    labels: { en: 'Beshkent', ru: 'Бешкент', uz: 'Beshkent' },
    synonyms: ['Beshkent', 'Бешкент'],
    coordinates: [38.82, 66.20]
  },
  Guzor: {
    labels: { en: 'Guzor', ru: 'Гузар', uz: "G'uzor" },
    synonyms: ['Guzor', 'Гузар', "G'uzor"],
    coordinates: [38.62, 66.25]
  },
  Dehqonobod: {
    labels: { en: 'Dehqonobod', ru: 'Дехканабад', uz: 'Dehqonobod' },
    synonyms: ['Dehqonobod', 'Дехканабад'],
    coordinates: [38.27, 66.82]
  },
  Qamashi: {
    labels: { en: 'Qamashi', ru: 'Камаши', uz: 'Qamashi' },
    synonyms: ['Qamashi', 'Камаши'],
    coordinates: [39.02, 66.72]
  },
  Karashina: {
    labels: { en: 'Karashina', ru: 'Карашина', uz: 'Karashina' },
    synonyms: ['Karashina', 'Карашина'],
    coordinates: [38.95, 65.78]
  },
  Qarshi: {
    labels: { en: 'Qarshi', ru: 'Карши', uz: 'Qarshi' },
    synonyms: ['Qarshi', 'Карши', 'qarshi'],
    coordinates: [38.8606, 65.7897]
  },
  Koson: {
    labels: { en: 'Koson', ru: 'Касон', uz: 'Koson' },
    synonyms: ['Koson', 'Касон'],
    coordinates: [39.03, 65.62]
  },
  Kasbi: {
    labels: { en: 'Kasbi', ru: 'Касби', uz: 'Kasbi' },
    synonyms: ['Kasbi', 'Касби'],
    coordinates: [38.62, 65.88]
  },
  Kitob: {
    labels: { en: 'Kitob', ru: 'Китаб', uz: 'Kitob' },
    synonyms: ['Kitob', 'Китаб'],
    coordinates: [39.13, 66.85]
  },
  Muborak: {
    labels: { en: 'Muborak', ru: 'Мубарек', uz: 'Muborak' },
    synonyms: ['Muborak', 'Мубарек'],
    coordinates: [39.28, 65.55]
  },
  Muglon: {
    labels: { en: 'Muglon', ru: 'Муглан', uz: "Mug'lon" },
    synonyms: ['Muglon', 'Муглан', "Mug'lon"],
    coordinates: [38.72, 66.05]
  },
  Talimarjon: {
    labels: { en: 'Talimarjon', ru: 'Талимарджан', uz: 'Talimarjon' },
    synonyms: ['Talimarjon', 'Талимарджан'],
    coordinates: [39.12, 66.15]
  },
  Chiroqchi: {
    labels: { en: 'Chiroqchi', ru: 'Чиракчи', uz: 'Chiroqchi' },
    synonyms: ['Chiroqchi', 'Чиракчи'],
    coordinates: [39.02, 66.57]
  },
  Shahrisabz: {
    labels: { en: 'Shahrisabz', ru: 'Шахрисабз', uz: 'Shahrisabz' },
    synonyms: ['Shahrisabz', 'Шахрисабз'],
    coordinates: [39.05, 66.83]
  },
  Yakkabog: {
    labels: { en: 'Yakkabog', ru: 'Яккабаг', uz: "Yakkabog'" },
    synonyms: ['Yakkabog', 'Яккабаг', "Yakkabog'"],
    coordinates: [38.82, 66.72]
  },
  Mirishkor: {
    labels: { en: 'Mirishkor', ru: 'Миришкор', uz: 'Mirishkor' },
    synonyms: ['Mirishkor', 'Миришкор'],
    coordinates: [38.97, 66.15]
  },
  Nishon: {
    labels: { en: 'Nishon', ru: 'Нишон', uz: 'Nishon' },
    synonyms: ['Nishon', 'Нишон'],
    coordinates: [38.68, 65.52]
  },

  // Samarqand Region
  Oqtosh: {
    labels: { en: 'Oqtosh', ru: 'Актош', uz: 'Oqtosh' },
    synonyms: ['Oqtosh', 'Актош'],
    coordinates: [39.75, 66.88]
  },
  Bulungur: {
    labels: { en: 'Bulungur', ru: 'Булунгур', uz: "Bulung'ur" },
    synonyms: ['Bulungur', 'Булунгур', "Bulung'ur"],
    coordinates: [39.77, 67.27]
  },
  Gozalkent: {
    labels: { en: 'Gozalkent', ru: 'Гозалкент', uz: "Go'zalkent" },
    synonyms: ['Gozalkent', 'Гозалкент', "Go'zalkent"],
    coordinates: [39.82, 66.48]
  },
  Gulobod: {
    labels: { en: 'Gulobod', ru: 'Гулабад', uz: 'Gulobod' },
    synonyms: ['Gulobod', 'Гулабад'],
    coordinates: [39.58, 67.08]
  },
  Darband: {
    labels: { en: 'Darband', ru: 'Дарбанд', uz: 'Darband' },
    synonyms: ['Darband', 'Дарбанд'],
    coordinates: [39.68, 67.52]
  },
  Jomboy: {
    labels: { en: 'Jomboy', ru: 'Джамбай', uz: 'Jomboy' },
    synonyms: ['Jomboy', 'Джамбай'],
    coordinates: [39.72, 67.12]
  },
  Juma: {
    labels: { en: 'Juma', ru: 'Джума', uz: 'Juma' },
    synonyms: ['Juma', 'Джума'],
    coordinates: [39.82, 66.72]
  },
  Ziadin: {
    labels: { en: 'Ziadin', ru: 'Зиадин', uz: 'Ziadin' },
    synonyms: ['Ziadin', 'Зиадин'],
    coordinates: [39.92, 67.05]
  },
  Ishtixon: {
    labels: { en: 'Ishtixon', ru: 'Иштихан', uz: 'Ishtixon' },
    synonyms: ['Ishtixon', 'Иштихан'],
    coordinates: [39.93, 66.90]
  },
  Kottaqorgon: {
    labels: { en: 'Kottaqorgon', ru: 'Каттакурган', uz: "Kottaqo'rg'on" },
    synonyms: ['Kottaqorgon', 'Каттакурган', "Kottaqo'rg'on"],
    coordinates: [39.90, 66.25]
  },
  Qoshrobod: {
    labels: { en: 'Qoshrobod', ru: 'Кошрабад', uz: "Qo'shrobod" },
    synonyms: ['Qoshrobod', 'Кошрабад', "Qo'shrobod"],
    coordinates: [38.83, 65.53]
  },
  Loish: {
    labels: { en: 'Loish', ru: 'Лаиш', uz: 'Loish' },
    synonyms: ['Loish', 'Лаиш'],
    coordinates: [39.68, 67.82]
  },
  Nurobod: {
    labels: { en: 'Nurobod', ru: 'Нурабад', uz: 'Nurobod' },
    synonyms: ['Nurobod', 'Нурабад'],
    coordinates: [39.88, 67.70]
  },
  Payariq: {
    labels: { en: 'Payariq', ru: 'Пайарык', uz: 'Payariq' },
    synonyms: ['Payariq', 'Пайарык'],
    coordinates: [39.98, 67.35]
  },
  Payshanba: {
    labels: { en: 'Payshanba', ru: 'Пайшанба', uz: 'Payshanba' },
    synonyms: ['Payshanba', 'Пайшанба'],
    coordinates: [39.72, 67.35]
  },
  Samarqand: {
    labels: { en: 'Samarqand', ru: 'Самарканд', uz: 'Samarqand' },
    synonyms: ['Samarqand', 'Самарканд', 'Samarkand', 'samarqand'],
    coordinates: [39.6542, 66.9597]
  },
  Tayloq: {
    labels: { en: 'Tayloq', ru: 'Тайлак', uz: 'Tayloq' },
    synonyms: ['Tayloq', 'Тайлак'],
    coordinates: [39.52, 67.35]
  },
  Urgut: {
    labels: { en: 'Urgut', ru: 'Ургут', uz: 'Urgut' },
    synonyms: ['Urgut', 'Ургут'],
    coordinates: [39.40, 67.25]
  },
  Chelak: {
    labels: { en: 'Chelak', ru: 'Челак', uz: 'Chelak' },
    synonyms: ['Chelak', 'Челак'],
    coordinates: [40.02, 67.82]
  },

  // Sirdaryo Region
  Sirdaryo: {
    labels: { en: 'Sirdaryo', ru: 'Сырдарья', uz: 'Sirdaryo' },
    synonyms: ['Sirdaryo', 'Сырдарья'],
    coordinates: [40.38, 68.72]
  },
  Baxt: {
    labels: { en: 'Baxt', ru: 'Бахт', uz: 'Baxt' },
    synonyms: ['Baxt', 'Бахт'],
    coordinates: [40.52, 68.82]
  },
  Boyovut: {
    labels: { en: 'Boyovut', ru: 'Баяут', uz: 'Boyovut' },
    synonyms: ['Boyovut', 'Баяут'],
    coordinates: [40.42, 68.52]
  },
  Guliston: {
    labels: { en: 'Guliston', ru: 'Гулистан', uz: 'Guliston' },
    synonyms: ['Guliston', 'Гулистан', 'guliston'],
    coordinates: [40.4897, 68.7842]
  },
  Navroz: {
    labels: { en: 'Navroz', ru: 'Навруз', uz: "Navro'z" },
    synonyms: ['Navroz', 'Навруз', "Navro'z"],
    coordinates: [40.35, 68.95]
  },
  Sayxun: {
    labels: { en: 'Sayxun', ru: 'Сайхун', uz: 'Sayxun' },
    synonyms: ['Sayxun', 'Сайхун'],
    coordinates: [40.88, 68.68]
  },
  Sardoba: {
    labels: { en: 'Sardoba', ru: 'Сардоба', uz: 'Sardoba' },
    synonyms: ['Sardoba', 'Сардоба'],
    coordinates: [40.57, 68.25]
  },
  Terenozek: {
    labels: { en: 'Terenozek', ru: 'Теренозек', uz: 'Terenozek' },
    synonyms: ['Terenozek', 'Теренозек'],
    coordinates: [40.98, 68.25]
  },
  Xovos: {
    labels: { en: 'Xovos', ru: 'Хаваст', uz: 'Xovos' },
    synonyms: ['Xovos', 'Хаваст'],
    coordinates: [40.62, 68.92]
  },
  Shirin: {
    labels: { en: 'Shirin', ru: 'Ширин', uz: 'Shirin' },
    synonyms: ['Shirin', 'Ширин'],
    coordinates: [40.25, 68.62]
  },
  Yangiyer: {
    labels: { en: 'Yangiyer', ru: 'Янгиер', uz: 'Yangiyer' },
    synonyms: ['Yangiyer', 'Янгиер'],
    coordinates: [40.27, 68.82]
  },

  // Surxondaryo Region
  Angor: {
    labels: { en: 'Angor', ru: 'Ангор', uz: 'Angor' },
    synonyms: ['Angor', 'Ангор'],
    coordinates: [37.88, 67.52]
  },
  Boysun: {
    labels: { en: 'Boysun', ru: 'Байсун', uz: 'Boysun' },
    synonyms: ['Boysun', 'Байсун'],
    coordinates: [38.20, 67.20]
  },
  Bandixon: {
    labels: { en: 'Bandixon', ru: 'Бандихон', uz: 'Bandixon' },
    synonyms: ['Bandixon', 'Бандихон'],
    coordinates: [37.95, 67.75]
  },
  Denov: {
    labels: { en: 'Denov', ru: 'Денау', uz: 'Denov' },
    synonyms: ['Denov', 'Денау'],
    coordinates: [38.27, 67.90]
  },
  Jarqorgon: {
    labels: { en: 'Jarqorgon', ru: 'Джаркурган', uz: "Jarqo'rg'on" },
    synonyms: ['Jarqorgon', 'Джаркурган', "Jarqo'rg'on"],
    coordinates: [37.48, 67.42]
  },
  Qorlik: {
    labels: { en: 'Qorlik', ru: 'Карлык', uz: 'Qorlik' },
    synonyms: ['Qorlik', 'Карлык'],
    coordinates: [37.45, 68.20]
  },
  Qiziriq: {
    labels: { en: 'Qiziriq', ru: 'Кызырык', uz: 'Qiziriq' },
    synonyms: ['Qiziriq', 'Кызырык'],
    coordinates: [38.12, 67.68]
  },
  Qumqorgon: {
    labels: { en: 'Qumqorgon', ru: 'Кумкурган', uz: "Qumqo'rg'on" },
    synonyms: ['Qumqorgon', 'Кумкурган', "Qumqo'rg'on"],
    coordinates: [37.83, 67.58]
  },
  Muzrobod: {
    labels: { en: 'Muzrobod', ru: 'Музрабад', uz: 'Muzrobod' },
    synonyms: ['Muzrobod', 'Музрабад'],
    coordinates: [37.68, 68.02]
  },
  Sariosiyo: {
    labels: { en: 'Sariosiyo', ru: 'Сариасия', uz: 'Sariosiyo' },
    synonyms: ['Sariosiyo', 'Сариасия'],
    coordinates: [38.03, 67.08]
  },
  Sariq: {
    labels: { en: 'Sariq', ru: 'Сарык', uz: 'Sariq' },
    synonyms: ['Sariq', 'Сарык'],
    coordinates: [37.92, 67.32]
  },
  Termiz: {
    labels: { en: 'Termiz', ru: 'Термез', uz: 'Termiz' },
    synonyms: ['Termiz', 'Термез', 'termiz'],
    coordinates: [37.2242, 67.2783]
  },
  Uzun: {
    labels: { en: 'Uzun', ru: 'Узун', uz: 'Uzun' },
    synonyms: ['Uzun', 'Узун'],
    coordinates: [38.18, 68.25]
  },
  Uchqizil: {
    labels: { en: 'Uchqizil', ru: 'Учкизил', uz: 'Uchqizil' },
    synonyms: ['Uchqizil', 'Учкизил'],
    coordinates: [37.72, 67.88]
  },
  Xalqobod: {
    labels: { en: 'Xalqobod', ru: 'Халкабад', uz: 'Xalqobod' },
    synonyms: ['Xalqobod', 'Халкабад'],
    coordinates: [37.58, 68.12]
  },
  Shargun: {
    labels: { en: 'Shargun', ru: 'Шаргунь', uz: "Sharg'un" },
    synonyms: ['Shargun', 'Шаргунь', "Sharg'un"],
    coordinates: [37.95, 67.95]
  },
  Sherobod: {
    labels: { en: 'Sherobod', ru: 'Шерабад', uz: 'Sherobod' },
    synonyms: ['Sherobod', 'Шерабад'],
    coordinates: [37.62, 67.00]
  },
  Shorchi: {
    labels: { en: 'Shorchi', ru: 'Шурчи', uz: "Sho'rchi" },
    synonyms: ['Shorchi', 'Шурчи', "Sho'rchi"],
    coordinates: [37.98, 67.78]
  },

  // Tashkent Region
  Soqoq: {
    labels: { en: 'Soqoq', ru: 'Сокок', uz: "So'qoq" },
    synonyms: ['Soqoq', 'Сокок', "So'qoq"],
    coordinates: [40.82, 69.75]
  },
  Oqqorgon: {
    labels: { en: 'Oqqorgon', ru: 'Аккурган', uz: "Oqqo'rg'on" },
    synonyms: ['Oqqorgon', 'Аккурган', "Oqqo'rg'on"],
    coordinates: [40.78, 69.68]
  },
  Olmaliq: {
    labels: { en: 'Olmaliq', ru: 'Алмалык', uz: 'Olmaliq' },
    synonyms: ['Olmaliq', 'Алмалык'],
    coordinates: [40.8475, 69.5986]
  },
  Angren: {
    labels: { en: 'Angren', ru: 'Ангрен', uz: 'Angren' },
    synonyms: ['Angren', 'Ангрен'],
    coordinates: [41.0167, 70.1436]
  },
  Ohangaron: {
    labels: { en: 'Ohangaron', ru: 'Ахангаран', uz: 'Ohangaron' },
    synonyms: ['Ohangaron', 'Ахангаран'],
    coordinates: [40.91, 69.68]
  },
  Bekobod: {
    labels: { en: 'Bekobod', ru: 'Бекабад', uz: 'Bekobod' },
    synonyms: ['Bekobod', 'Бекабад'],
    coordinates: [40.22, 69.19]
  },
  KattaChimyon: {
    labels: { en: 'Katta Chimyon', ru: 'Катта Чимён', uz: 'Katta chimyon' },
    synonyms: ['Katta Chimyon', 'Катта Чимён', 'Katta chimyon'],
    coordinates: [40.95, 69.88]
  },
  Boka: {
    labels: { en: 'Boka', ru: 'Бока', uz: "Bo'ka" },
    synonyms: ['Boka', 'Бока', "Bo'ka"],
    coordinates: [40.78, 69.22]
  },
  Gazalkent: {
    labels: { en: 'Gazalkent', ru: 'Газалкент', uz: "G'azalkent" },
    synonyms: ['Gazalkent', 'Газалкент', "G'azalkent"],
    coordinates: [41.22, 69.75]
  },
  Gulbahor: {
    labels: { en: 'Gulbahor', ru: 'Гулбахор', uz: 'Gulbahor' },
    synonyms: ['Gulbahor', 'Гулбахор'],
    coordinates: [40.48, 69.25]
  },
  Durmen: {
    labels: { en: 'Durmen', ru: 'Дурмен', uz: 'Durmen' },
    synonyms: ['Durmen', 'Дурмен'],
    coordinates: [40.55, 69.52]
  },
  Dostobod: {
    labels: { en: 'Dostobod', ru: 'Дустабад', uz: "Do'stobod" },
    synonyms: ['Dostobod', 'Дустабад', "Do'stobod"],
    coordinates: [40.62, 69.18]
  },
  Zangiota: {
    labels: { en: 'Zangiota', ru: 'Зангиата', uz: 'Zangiota' },
    synonyms: ['Zangiota', 'Зангиата'],
    coordinates: [41.08, 69.12]
  },
  Zafar: {
    labels: { en: 'Zafar', ru: 'Зафар', uz: 'Zafar' },
    synonyms: ['Zafar', 'Зафар'],
    coordinates: [40.68, 68.95]
  },
  Iskandar: {
    labels: { en: 'Iskandar', ru: 'Искандар', uz: 'Iskandar' },
    synonyms: ['Iskandar', 'Искандар'],
    coordinates: [40.52, 69.68]
  },
  Qorasuv_Tashkent: {
    labels: { en: 'Qorasuv', ru: 'Карасу', uz: 'Qorasuv' },
    synonyms: ['Qorasuv', 'Карасу'],
    coordinates: [40.88, 69.52]
  },
  Keles: {
    labels: { en: 'Keles', ru: 'Келес', uz: 'Keles' },
    synonyms: ['Keles', 'Келес'],
    coordinates: [41.38, 69.22]
  },
  Qibray: {
    labels: { en: 'Qibray', ru: 'Кибрай', uz: 'Qibray' },
    synonyms: ['Qibray', 'Кибрай'],
    coordinates: [41.38, 69.48]
  },
  Koksaroy: {
    labels: { en: 'Koksaroy', ru: 'Коксарай', uz: "Ko'ksaroy" },
    synonyms: ['Koksaroy', 'Коксарай', "Ko'ksaroy"],
    coordinates: [40.58, 68.82]
  },
  Krasnogorsk: {
    labels: { en: 'Krasnogorsk', ru: 'Красногорск', uz: 'Krasnogorsk' },
    synonyms: ['Krasnogorsk', 'Красногорск'],
    coordinates: [41.18, 69.88]
  },
  Mirobod: {
    labels: { en: 'Mirobod', ru: 'Мирабад', uz: 'Mirobod' },
    synonyms: ['Mirobod', 'Мирабад'],
    coordinates: [40.72, 69.05]
  },
  Nazarbek: {
    labels: { en: 'Nazarbek', ru: 'Назарбек', uz: 'Nazarbek' },
    synonyms: ['Nazarbek', 'Назарбек'],
    coordinates: [40.95, 69.22]
  },
  Toytepa: {
    labels: { en: 'Toytepa', ru: 'Тойтепа', uz: "To'ytepa" },
    synonyms: ['Toytepa', 'Тойтепа', "To'ytepa"],
    coordinates: [40.42, 69.75]
  },
  Parkent: {
    labels: { en: 'Parkent', ru: 'Паркент', uz: 'Parkent' },
    synonyms: ['Parkent', 'Паркент'],
    coordinates: [41.28, 69.68]
  },
  Pskent: {
    labels: { en: 'Pskent', ru: 'Пскент', uz: 'Pskent' },
    synonyms: ['Pskent', 'Пскент'],
    coordinates: [40.85, 69.52]
  },
  Salar: {
    labels: { en: 'Salar', ru: 'Салар', uz: 'Salar' },
    synonyms: ['Salar', 'Салар'],
    coordinates: [40.32, 69.52]
  },
  Tashmore: {
    labels: { en: 'Tashmore', ru: 'Ташмор', uz: 'Tashmore' },
    synonyms: ['Tashmore', 'Ташмор'],
    coordinates: [40.52, 69.88]
  },
  Turkiston: {
    labels: { en: 'Turkiston', ru: 'Туркистан', uz: 'Turkiston' },
    synonyms: ['Turkiston', 'Туркистан'],
    coordinates: [40.95, 69.05]
  },
  Ortaovul: {
    labels: { en: 'Ortaovul', ru: 'Уртаауль', uz: "O'rtaovul" },
    synonyms: ['Ortaovul', 'Уртаауль', "O'rtaovul"],
    coordinates: [40.68, 69.68]
  },
  Xojakent: {
    labels: { en: 'Xojakent', ru: 'Ходжакент', uz: "Xo'jakent" },
    synonyms: ['Xojakent', 'Ходжакент', "Xo'jakent"],
    coordinates: [40.98, 69.35]
  },
  Chorvoq: {
    labels: { en: 'Chorvoq', ru: 'Чарвак', uz: 'Chorvoq' },
    synonyms: ['Chorvoq', 'Чарвак'],
    coordinates: [41.61, 70.01]
  },
  Chinoz: {
    labels: { en: 'Chinoz', ru: 'Чиназ', uz: 'Chinoz' },
    synonyms: ['Chinoz', 'Чиназ'],
    coordinates: [40.94, 68.77]
  },
  Chirchiq: {
    labels: { en: 'Chirchiq', ru: 'Чирчик', uz: 'Chirchiq' },
    synonyms: ['Chirchiq', 'Чирчик'],
    coordinates: [41.47, 69.58]
  },
  Eshonguzar: {
    labels: { en: 'Eshonguzar', ru: 'Эшангузар', uz: 'Eshonguzar' },
    synonyms: ['Eshonguzar', 'Эшангузар'],
    coordinates: [40.35, 69.35]
  },
  Yangibozor: {
    labels: { en: 'Yangibozor', ru: 'Янгибазар', uz: 'Yangibozor' },
    synonyms: ['Yangibozor', 'Янгибазар'],
    coordinates: [41.12, 69.05]
  },
  Yangiyol: {
    labels: { en: 'Yangiyol', ru: 'Янгиюль', uz: "Yangiyo'l" },
    synonyms: ['Yangiyol', 'Янгиюль', "Yangiyo'l"],
    coordinates: [41.11, 69.04]
  },

  // Xorazm Region
  Bogot: {
    labels: { en: 'Bogot', ru: 'Богат', uz: "Bog'ot" },
    synonyms: ['Bogot', 'Богат', "Bog'ot"],
    coordinates: [41.55, 60.95]
  },
  Gurlan: {
    labels: { en: 'Gurlan', ru: 'Гурлен', uz: 'Gurlan' },
    synonyms: ['Gurlan', 'Гурлен'],
    coordinates: [41.85, 60.38]
  },
  Qorovul: {
    labels: { en: 'Qorovul', ru: 'Караул', uz: 'Qorovul' },
    synonyms: ['Qorovul', 'Караул'],
    coordinates: [41.28, 60.25]
  },
  Qoshkopir: {
    labels: { en: 'Qoshkopir', ru: 'Кошкупыр', uz: "Qoshko'pir" },
    synonyms: ['Qoshkopir', 'Кошкупыр', "Qoshko'pir"],
    coordinates: [41.53, 60.35]
  },
  Pitnak: {
    labels: { en: 'Pitnak', ru: 'Питняк', uz: 'Pitnak' },
    synonyms: ['Pitnak', 'Питняк'],
    coordinates: [41.35, 60.82]
  },
  Urganch: {
    labels: { en: 'Urgench', ru: 'Ургенч', uz: 'Urganch' },
    synonyms: ['Urgench', 'Ургенч', 'Urganch', 'urgench'],
    coordinates: [41.5500, 60.6333]
  },
  Xozarasp: {
    labels: { en: 'Xozarasp', ru: 'Хазарасп', uz: 'Xozarasp' },
    synonyms: ['Xozarasp', 'Хазарасп'],
    coordinates: [41.32, 61.08]
  },
  Xonqa: {
    labels: { en: 'Xonqa', ru: 'Хонка', uz: 'Xonqa' },
    synonyms: ['Xonqa', 'Хонка'],
    coordinates: [41.22, 60.88]
  },
  Xiva: {
    labels: { en: 'Khiva', ru: 'Хива', uz: 'Xiva' },
    synonyms: ['Khiva', 'Хива', 'Xiva'],
    coordinates: [41.3775, 60.3642]
  },
  Cholish: {
    labels: { en: 'Cholish', ru: 'Чолиш', uz: 'Cholish' },
    synonyms: ['Cholish', 'Чолиш'],
    coordinates: [41.18, 60.52]
  },
  Shovot: {
    labels: { en: 'Shovot', ru: 'Шават', uz: 'Shovot' },
    synonyms: ['Shovot', 'Шават'],
    coordinates: [41.68, 60.32]
  },
  Yangiariq: {
    labels: { en: 'Yangiariq', ru: 'Янгиарык', uz: 'Yangiariq' },
    synonyms: ['Yangiariq', 'Янгиарык'],
    coordinates: [41.12, 60.18]
  },

  // Karakalpakstan
  Oqmangit: {
    labels: { en: 'Oqmangit', ru: 'Акмангит', uz: 'Oqmang\'it' },
    synonyms: ['Oqmangit', 'Акмангит', 'Oqmang\'it'],
    coordinates: [43.72, 59.82]
  },
  Beruniy: {
    labels: { en: 'Beruniy', ru: 'Беруни', uz: 'Beruniy' },
    synonyms: ['Beruniy', 'Беруни'],
    coordinates: [41.69, 60.75]
  },
  Boston: {
    labels: { en: 'Boston', ru: 'Бустон', uz: "Bo'ston" },
    synonyms: ['Boston', 'Бустон', "Bo'ston"],
    coordinates: [42.82, 59.68]
  },
  Qanlikol: {
    labels: { en: 'Qanlikol', ru: 'Канлыкуль', uz: "Qanliko'l" },
    synonyms: ['Qanlikol', 'Канлыкуль', "Qanliko'l"],
    coordinates: [43.15, 58.52]
  },
  Qoraozak: {
    labels: { en: 'Qoraozak', ru: 'Караузяк', uz: "Qorao'zak" },
    synonyms: ['Qoraozak', 'Караузяк', "Qorao'zak"],
    coordinates: [43.48, 59.95]
  },
  Kegeyli: {
    labels: { en: 'Kegeyli', ru: 'Кегейли', uz: 'Kegeyli' },
    synonyms: ['Kegeyli', 'Кегейли'],
    coordinates: [43.15, 58.42]
  },
  Qongirot: {
    labels: { en: 'Qongirot', ru: 'Кунград', uz: "Qo'ng'irot" },
    synonyms: ['Qongirot', 'Кунград', "Qo'ng'irot"],
    coordinates: [43.08, 58.90]
  },
  Mangit: {
    labels: { en: 'Mangit', ru: 'Мангит', uz: 'Mang\'it' },
    synonyms: ['Mangit', 'Мангит', 'Mang\'it'],
    coordinates: [42.12, 60.05]
  },
  Moynoq: {
    labels: { en: 'Moynoq', ru: 'Муйнак', uz: "Mo'ynoq" },
    synonyms: ['Moynoq', 'Муйнак', "Mo'ynoq"],
    coordinates: [43.76, 59.03]
  },
  Nukus: {
    labels: { en: 'Nukus', ru: 'Нукус', uz: 'Nukus' },
    synonyms: ['Nukus', 'Нукус', 'nukus'],
    coordinates: [42.4531, 59.6103]
  },
  Taxiatosh: {
    labels: { en: 'Taxiatosh', ru: 'Тахиаташ', uz: 'Taxiatosh' },
    synonyms: ['Taxiatosh', 'Тахиаташ'],
    coordinates: [41.92, 59.95]
  },
  Tortkol: {
    labels: { en: 'Tortkol', ru: 'Турткуль', uz: "To'rtko'l" },
    synonyms: ['Tortkol', 'Турткуль', "To'rtko'l"],
    coordinates: [41.55, 61.00]
  },
  Xojayli: {
    labels: { en: 'Xojayli', ru: 'Ходжейли', uz: "Xo'jayli" },
    synonyms: ['Xojayli', 'Ходжейли', "Xo'jayli"],
    coordinates: [42.38, 59.45]
  },
  Chimboy: {
    labels: { en: 'Chimboy', ru: 'Чимбай', uz: 'Chimboy' },
    synonyms: ['Chimboy', 'Чимбай'],
    coordinates: [42.95, 59.78]
  },
  Shumanay: {
    labels: { en: 'Shumanay', ru: 'Шуманай', uz: 'Shumanay' },
    synonyms: ['Shumanay', 'Шуманай'],
    coordinates: [42.28, 60.12]
  },
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
