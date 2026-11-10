const JWT_SECRET = process.env.JWT_SECRET || 'StayNova_Super_Secret_JWT_Key_2026_!@#';

const PROPERTY_TYPES = {
  daire: 'Daire & Rezidans',
  villa: 'Müstakil Villa',
  otel_odasi: 'Otel & Butik Oda',
  bungalov: 'Bungalov & Dağ Evi',
  paylasimli_oda: 'Paylaşımlı Oda'
};

const CATEGORY_LABELS = {
  daire: 'Şehir & Kültür',
  villa: 'Lüks & Havuzlu',
  otel_odasi: 'Butik & Konfor',
  bungalov: 'Doğa & Kaçış',
  paylasimli_oda: 'Ekonomik & Sosyal'
};

const SYSTEM_ROLES = ['guest', 'host', 'admin'];

module.exports = {
  JWT_SECRET,
  PROPERTY_TYPES,
  CATEGORY_LABELS,
  SYSTEM_ROLES
};

