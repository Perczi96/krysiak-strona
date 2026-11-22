-- ============================================
-- BEZ MASKI - Import Existing Data (v4)
-- Import z krysiak-merged/data/*.json
-- ============================================

-- Helper: extract YouTube video ID from URL
create or replace function extract_youtube_id(url text) returns text language sql immutable as $$
  select regexp_replace(url, '^.*(?:youtu\.be/|v/|embed/|watch\?v=|shorts/)([^#&?]+).*$', '\1')
$$;

-- ============================================
-- 1. WYROŻNIONE (wyroznione.json) → content (video, public, featured)
-- ============================================

insert into content (title, slug, type, visibility, excerpt, video_provider, video_id, thumbnail_url, published_at, is_featured, meta) values
  ('LIROY ODPIERA ZARZUTY INWESTORÓW I WSKAZUJE WINNYCH. W TLE MILIONOWA ŁAPÓWKA', 'liroy-odpiera-zarzuty-inwestorow', 'video', 'public', 'Wideo z kanału Piotr Krysiak - Bez maski', 'youtube', extract_youtube_id('https://www.youtube.com/watch?v=lNtyAyoH-Jc'), 'https://i.ytimg.com/vi/lNtyAyoH-Jc/maxresdefault.jpg', '2025-01-15 12:00:00+01', true, '{"source": "wyroznione", "medium": "Piotr Krysiak - Bez maski", "kanalUrl": "https://www.youtube.com/@piotr_krysiak", "etykieta": "Wideo"}'),
  ('NEPOTYZM W TELEWIZJI PUBLICZNEJ', 'nepotyzm-w-telewizji-publicznej', 'video', 'public', 'Wideo z kanału Piotr Krysiak - Bez maski', 'youtube', extract_youtube_id('https://www.youtube.com/watch?v=r5YEi7oun9g'), 'https://i.ytimg.com/vi/r5YEi7oun9g/maxresdefault.jpg', '2025-01-14 12:00:00+01', false, '{"source": "wyroznione", "medium": "Piotr Krysiak - Bez maski", "kanalUrl": "https://www.youtube.com/@piotr_krysiak", "etykieta": "Wideo"}'),
  ('CO UKRYWA SZEF TVP? Od licencjata do doktora', 'co-ukrywa-szef-tvp', 'video', 'public', 'Wideo z kanału Piotr Krysiak - Bez maski', 'youtube', extract_youtube_id('https://www.youtube.com/watch?v=G5i4pk-i6fc'), 'https://i.ytimg.com/vi/G5i4pk-i6fc/maxresdefault.jpg', '2025-01-13 12:00:00+01', false, '{"source": "wyroznione", "medium": "Piotr Krysiak - Bez maski", "kanalUrl": "https://www.youtube.com/@piotr_krysiak", "etykieta": "Wideo"}'),
  ('NIEPAMIĘTNIK EMI I JEJ WERSJA DZIEWCZYN Z DUBAJU', 'niepamietnik-emi-i-jej-wersja-dziewczyn-z-dubaju', 'video', 'public', 'Wideo z kanału Piotr Krysiak - Bez maski', 'youtube', extract_youtube_id('https://www.youtube.com/watch?v=BhdvcuzR6Aw'), 'https://i.ytimg.com/vi/BhdvcuzR6Aw/maxresdefault.jpg', '2025-01-12 12:00:00+01', false, '{"source": "wyroznione", "medium": "Piotr Krysiak - Bez maski", "kanalUrl": "https://www.youtube.com/@piotr_krysiak", "etykieta": "Wideo"}'),
  ('Były mąż Kurskiej oskarżył Krysiaka. Jest wyrok! NIEDZIELNIK/pierdzielnik #6', 'byl-maz-kurskiej-oskarzil-krysiaka', 'video', 'public', 'Wideo z kanału Piotr Krysiak - Bez maski', 'youtube', extract_youtube_id('https://www.youtube.com/watch?v=CByvoDGwW2I'), 'https://i.ytimg.com/vi/CByvoDGwW2I/maxresdefault.jpg', '2025-01-11 12:00:00+01', false, '{"source": "wyroznione", "medium": "Piotr Krysiak - Bez maski", "kanalUrl": "https://www.youtube.com/@piotr_krysiak", "etykieta": "Wideo"}'),
  ('AWANTURA W SĄDZIE: Rutkowski opuszcza salę, świadek zastraszony', 'awantura-w-sadzie-rutkowski-opuszcza-sale', 'video', 'public', 'Wideo z kanału Piotr Krysiak - Bez maski', 'youtube', extract_youtube_id('https://www.youtube.com/watch?v=5hdH9kitdx8'), 'https://i.ytimg.com/vi/5hdH9kitdx8/maxresdefault.jpg', '2025-01-10 12:00:00+01', true, '{"source": "wyroznione", "medium": "Piotr Krysiak - Bez maski", "kanalUrl": "https://www.youtube.com/@piotr_krysiak", "etykieta": "Wideo"}'),
  ('DODA&EMIL: NAGRALI JAK UKRYWALI SWÓJ MAJĄTEK. TAŚMA W PROKURATURZE', 'doda-emil-nagrali-jak-ukrywali-swoj-majatek', 'video', 'public', 'Wideo z kanału Piotr Krysiak - Bez maski', 'youtube', extract_youtube_id('https://www.youtube.com/watch?v=Z8bvPC6QXLE'), 'https://i.ytimg.com/vi/Z8bvPC6QXLE/maxresdefault.jpg', '2025-01-09 12:00:00+01', false, '{"source": "wyroznione", "medium": "Piotr Krysiak - Bez maski", "kanalUrl": "https://www.youtube.com/@piotr_krysiak", "etykieta": "Wideo"}')
on conflict (slug) do nothing;

-- ============================================
-- 2. SERIALE (seriale.json) → content (video, public) with series meta
-- ============================================

insert into content (title, slug, type, visibility, video_provider, video_id, thumbnail_url, published_at, meta) values
  ('KRYSIAK NA INDEKSIE 28% "SZMERÓW SZUKAM" #1 ŚLAD PROWADZI DO CBA', 'serial-krysiak-na-indeksie-1', 'video', 'public', 'youtube', extract_youtube_id('https://www.youtube.com/watch?v=6oMEf0wjAsY'), 'https://i.ytimg.com/vi/6oMEf0wjAsY/maxresdefault.jpg', '2025-01-01 00:00:00+01', '{"source": "seriale", "serial_tytul": "KRYSIAK NA INDEKSIE", "serial_podpis": "Serial biograficzny", "serial_kanal": "Piotr Krysiak - Bez maski", "serial_kanalUrl": "https://www.youtube.com/@piotr_krysiak", "odcinek_numer": 1}')
on conflict (slug) do nothing;

-- ============================================
-- Cleanup helper function
-- ============================================

drop function if exists extract_youtube_id(text);