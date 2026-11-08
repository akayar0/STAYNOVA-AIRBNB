// backend/config/constants.js — Sistem Sabitleri (1. Hafta - Sprint 1)
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'StayNova_Super_Secret_JWT_Key_2026_!@#';

const CATEGORY_LABELS = {
  daire: 'Rezidans & Daire',
  villa: 'Müstakil Lüks Villa',
  otel_odasi: 'Butik Otel Süiti',
  bungalov: 'Doğa Bungalovu & Glamping',
  paylasimli_oda: 'Paylaşımlı Oda & Co-Living'
};

const CANCELLATION_POLICIES = {
  esnek: 'Esnek (Girişten 24 saat öncesine kadar %100 kesintisiz iade)',
  orta: 'Orta (Girişten 5 gün öncesine kadar %100, sonrasında %50 iade)',
  siki: 'Sıkı (Girişten 14 gün öncesine kadar %50 iade, sonrasında iadesiz)'
};

module.exports = {
  PORT,
  JWT_SECRET,
  CATEGORY_LABELS,
  CANCELLATION_POLICIES
};

