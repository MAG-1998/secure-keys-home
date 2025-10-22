-- Expand city detection for all major cities in Uzbekistan
UPDATE properties 
SET city = CASE
  -- Tashkent (Capital)
  WHEN location ILIKE '%Tashkent%' OR location ILIKE '%Ташкент%' OR location ILIKE '%Toshkent%' THEN 'Tashkent'
  
  -- Andijan Region
  WHEN location ILIKE '%Andijan%' OR location ILIKE '%Андижан%' OR location ILIKE '%Andijon%' THEN 'Andijon'
  WHEN location ILIKE '%Asaka%' OR location ILIKE '%Асака%' THEN 'Asaka'
  WHEN location ILIKE '%Shahrixon%' OR location ILIKE '%Шахрихан%' THEN 'Shahrixon'
  
  -- Bukhara Region
  WHEN location ILIKE '%Bukhara%' OR location ILIKE '%Бухара%' OR location ILIKE '%Buxoro%' THEN 'Buxoro'
  WHEN location ILIKE '%Kogon%' OR location ILIKE '%Коган%' THEN 'Kogon'
  
  -- Fergana Region
  WHEN location ILIKE '%Kokand%' OR location ILIKE '%Коканд%' OR location ILIKE '%Qo''qon%' OR location ILIKE '%Qoqon%' THEN 'Qoqon'
  WHEN location ILIKE '%Fergana%' OR location ILIKE '%Фергана%' OR location ILIKE '%Farg''ona%' THEN 'Fargona'
  WHEN location ILIKE '%Margilan%' OR location ILIKE '%Маргилан%' OR location ILIKE '%Marg''ilon%' THEN 'Margilon'
  WHEN location ILIKE '%Quvasoy%' OR location ILIKE '%Кувасай%' THEN 'Quvasoy'
  
  -- Jizzakh Region
  WHEN location ILIKE '%Jizzakh%' OR location ILIKE '%Джизак%' OR location ILIKE '%Jizzax%' THEN 'Jizzax'
  
  -- Namangan Region
  WHEN location ILIKE '%Namangan%' OR location ILIKE '%Наманган%' THEN 'Namangan'
  WHEN location ILIKE '%Chust%' OR location ILIKE '%Чуст%' THEN 'Chust'
  
  -- Navoiy Region
  WHEN location ILIKE '%Navoiy%' OR location ILIKE '%Навои%' THEN 'Navoiy'
  WHEN location ILIKE '%Zarafshon%' OR location ILIKE '%Зарафшан%' THEN 'Zarafshon'
  
  -- Qashqadaryo Region
  WHEN location ILIKE '%Qarshi%' OR location ILIKE '%Карши%' THEN 'Qarshi'
  WHEN location ILIKE '%Shahrisabz%' OR location ILIKE '%Шахрисабз%' THEN 'Shahrisabz'
  WHEN location ILIKE '%Muborak%' OR location ILIKE '%Мубарек%' THEN 'Muborak'
  
  -- Samarqand Region
  WHEN location ILIKE '%Samarkand%' OR location ILIKE '%Самарканд%' OR location ILIKE '%Samarqand%' THEN 'Samarqand'
  WHEN location ILIKE '%Kattakurgan%' OR location ILIKE '%Каттакурган%' OR location ILIKE '%Kottaqo''rg''on%' THEN 'Kottaqorgon'
  WHEN location ILIKE '%Urgut%' OR location ILIKE '%Ургут%' THEN 'Urgut'
  
  -- Sirdaryo Region
  WHEN location ILIKE '%Guliston%' OR location ILIKE '%Гулистан%' THEN 'Guliston'
  WHEN location ILIKE '%Yangiyer%' OR location ILIKE '%Янгиер%' THEN 'Yangiyer'
  
  -- Surxondaryo Region
  WHEN location ILIKE '%Termiz%' OR location ILIKE '%Термез%' THEN 'Termiz'
  WHEN location ILIKE '%Denov%' OR location ILIKE '%Денау%' THEN 'Denov'
  WHEN location ILIKE '%Sherobod%' OR location ILIKE '%Шерабад%' THEN 'Sherobod'
  
  -- Tashkent Region
  WHEN location ILIKE '%Olmaliq%' OR location ILIKE '%Алмалык%' THEN 'Olmaliq'
  WHEN location ILIKE '%Angren%' OR location ILIKE '%Ангрен%' THEN 'Angren'
  WHEN location ILIKE '%Chirchiq%' OR location ILIKE '%Чирчик%' THEN 'Chirchiq'
  WHEN location ILIKE '%Bekobod%' OR location ILIKE '%Бекабад%' THEN 'Bekobod'
  WHEN location ILIKE '%Yangiyol%' OR location ILIKE '%Янгиюль%' OR location ILIKE '%Yangiyo''l%' THEN 'Yangiyol'
  
  -- Xorazm Region
  WHEN location ILIKE '%Urgench%' OR location ILIKE '%Ургенч%' OR location ILIKE '%Urganch%' THEN 'Urganch'
  WHEN location ILIKE '%Khiva%' OR location ILIKE '%Хива%' OR location ILIKE '%Xiva%' THEN 'Xiva'
  
  -- Karakalpakstan
  WHEN location ILIKE '%Nukus%' OR location ILIKE '%Нукус%' THEN 'Nukus'
  WHEN location ILIKE '%Beruniy%' OR location ILIKE '%Беруни%' THEN 'Beruniy'
  
  ELSE city
END
WHERE city IS NULL OR city = '';