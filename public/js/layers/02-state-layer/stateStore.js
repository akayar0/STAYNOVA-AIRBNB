// public/js/layers/02-state-layer/stateStore.js — 1. Hafta (Sprint 1) Merkezi Durum Yönetimi
var app = (window.app = window.app || {});

Object.assign(app, {
  state: {
    // 1. Hafta varsayılan açılış ekranı: Giriş & Kayıt Portalı (AIR-42 / AIR-43)
    view: 'auth',
    token: localStorage.getItem('staynova_jwt') || null,
    user: null,
    theme: localStorage.getItem('staynova_theme') || 'light',
    userMenuOpen: false,

    // AIR-43: e-Okul tarzı ikiye ayrılmış Giriş / Kayıt Portalı durumu
    authPortal: {
      activeRole: 'guest',
      registerRole: 'guest',
      mode: 'login'
    },

    // AIR-45 & AIR-47: Ev Sahibi İlanları ve 5 Adımlı İlan Sihirbazı durumu
    listings: [],
    hostListings: [],
    wizardStep: 1,
    wizardData: null,
    wizardPopoverOpen: null,
    provinceSearchQuery: '',
    districtSearchQuery: '',
    hostCalendarListingId: null
  },

  formatMoney(amount) {
    const val = Number(amount) || 0;
    return '₺' + val.toLocaleString('tr-TR', { maximumFractionDigits: 0 });
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});

