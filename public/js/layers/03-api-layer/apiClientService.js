// public/js/layers/03-api-layer/apiClientService.js — 1. Hafta (Sprint 1) API İstemci Katmanı & Çevrimdışı Yedek Motoru
var app = (window.app = window.app || {});

Object.assign(app, {
  async api(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (this.state.token) {
      headers['Authorization'] = `Bearer ${this.state.token}`;
    }

    try {
      const response = await fetch(path, {
        ...options,
        headers
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data.error || 'İşlem sırasında bir hata oluştu.';
        this.toast(msg, 'error');
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      // Sunucu yanıtından dönen gerçek iş mantığı hatasıysa yeniden fırlat
      if (err && err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
      // file:// protokolü veya çevrimdışı modda yerel Sprint 1 motorunu çalıştır
      return this.localFallbackApi(path, options);
    }
  },

  initLocalFallbackStorage() {
    if (!localStorage.getItem('staynova_s1_users')) {
      const demoUsers = [
        {
          id: 1,
          name: 'Zeynep Kaya',
          email: 'misafir@staynova.com',
          password: '123456',
          role: 'guest',
          phone: '0532 410 20 30',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          bio: 'Seyahat etmeyi ve mimari tasarımlı konaklama deneyimlerini seven bir gezgin.',
          city: 'İstanbul',
          preferences: { currency: 'TRY', language: 'tr' },
          status: 'active'
        },
        {
          id: 2,
          name: 'Ahmet Kayar',
          email: 'evsahibi@staynova.com',
          password: '123456',
          role: 'host',
          phone: '0544 820 90 10',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          bio: 'StayNova Süper Ev Sahibi. Akdeniz, Ege ve İstanbul bölgelerinde lüks villa ve tasarım daireler işletiyorum.',
          city: 'Antalya',
          preferences: { currency: 'TRY', language: 'tr' },
          status: 'active'
        }
      ];
      localStorage.setItem('staynova_s1_users', JSON.stringify(demoUsers));
    }

    if (!localStorage.getItem('staynova_s1_listings')) {
      const demoListings = [
        {
          id: 1,
          hostId: 2,
          hostName: 'Ahmet Kayar',
          title: 'Villa Azure — Kaş Yarımadası Sonsuzluk Havuzlu Taş Villa',
          description: 'Meis Adası manzarasına hakim Çukurbağ Yarımadasında, özel ısıtmalı sonsuzluk havuzu ve jakuzili terasıyla izole bir tatil deneyimi.',
          propertyType: 'villa',
          categoryLabel: 'Müstakil Lüks Villa',
          city: 'Antalya',
          district: 'Kaş',
          neighborhood: 'Çukurbağ Yarımadası',
          address: 'Çukurbağ Yarımadası Bükülmez Cad. No: 18 Kaş/Antalya',
          basePrice: 8500,
          discountedPrice: 6950,
          discountNote: 'Erken Rezervasyon Fırsatı',
          cleaningFee: 950,
          maxAdults: 6,
          maxChildren: 2,
          bedrooms: 3,
          beds: 4,
          bathrooms: 3,
          amenities: ['wifi', 'pool', 'sea_view', 'ac', 'kitchen', 'parking', 'jacuzzi', 'bbq'],
          photos: [
            { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop&q=80', caption: 'Sonsuzluk Havuzu & Deniz Manzarası', isCover: true },
            { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=80', caption: 'Panoramik Teras', isCover: false }
          ],
          coverPhoto: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop&q=80',
          seasonalMultipliers: [{ label: 'Yaz Yüksek Sezonu', startDate: '2026-06-15', endDate: '2026-09-15', multiplier: 1.25 }],
          blockedDates: ['2026-11-18', '2026-11-19', '2026-11-20'],
          cancellationPolicy: 'esnek',
          status: 'active',
          moderationNote: 'Onaylandı ve yayında.'
        },
        {
          id: 2,
          hostId: 2,
          hostName: 'Ahmet Kayar',
          title: 'Galata Boğaz Manzaralı Tarihi Çatı Katı Loft',
          description: 'Galata Kulesine 2 dakika yürüme mesafesinde, yüksek tavanlı, özel terasından Tarihi Yarımada ve Boğaz manzarası sunan tasarım loft daire.',
          propertyType: 'daire',
          categoryLabel: 'Rezidans & Daire',
          city: 'İstanbul',
          district: 'Beyoğlu',
          neighborhood: 'Bereketzade',
          address: 'Serdar-ı Ekrem Cad. No: 42 Kat: 5 Galata Beyoğlu/İstanbul',
          basePrice: 4800,
          discountedPrice: null,
          discountNote: '',
          cleaningFee: 600,
          maxAdults: 4,
          maxChildren: 1,
          bedrooms: 2,
          beds: 2,
          bathrooms: 1,
          amenities: ['wifi', 'sea_view', 'ac', 'kitchen', 'workspace', 'elevator'],
          photos: [
            { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80', caption: 'Tasarım Loft Salon', isCover: true }
          ],
          coverPhoto: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80',
          seasonalMultipliers: [],
          blockedDates: ['2026-11-24', '2026-11-25'],
          cancellationPolicy: 'orta',
          status: 'active',
          moderationNote: 'Onaylandı ve yayında.'
        }
      ];
      localStorage.setItem('staynova_s1_listings', JSON.stringify(demoListings));
    }
  },

  localFallbackApi(path, options = {}) {
    this.initLocalFallbackStorage();
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body) : {};
    const users = JSON.parse(localStorage.getItem('staynova_s1_users') || '[]');
    const listings = JSON.parse(localStorage.getItem('staynova_s1_listings') || '[]');

    if (path === '/api/auth/login' && method === 'POST') {
      const user = users.find(u => u.email.toLowerCase() === String(body.email || '').trim().toLowerCase());
      if (!user || user.password !== String(body.password || '')) {
        this.toast('E-posta adresi veya şifre hatalı.', 'error');
        throw new Error('E-posta adresi veya şifre hatalı.');
      }
      if (body.expectedRole && user.role !== body.expectedRole) {
        const msg = `Bu giriş bölümü yalnızca ${body.expectedRole === 'host' ? 'EV SAHİBİ' : 'MİSAFİR'} hesapları içindir.`;
        this.toast(msg, 'error');
        throw new Error(msg);
      }
      const token = `local_jwt_${user.id}`;
      localStorage.setItem('staynova_s1_active_user_id', String(user.id));
      return { message: 'Giriş başarılı.', token, user };
    }

    if (path === '/api/auth/register' && method === 'POST') {
      const exists = users.find(u => u.email.toLowerCase() === String(body.email || '').trim().toLowerCase());
      if (exists) {
        this.toast('Bu e-posta adresi ile kayıtlı bir hesap zaten mevcut.', 'error');
        throw new Error('Bu e-posta adresi ile kayıtlı bir hesap zaten mevcut.');
      }
      const newUser = {
        id: Date.now(),
        name: body.name,
        email: String(body.email).trim().toLowerCase(),
        password: body.password,
        role: body.role === 'host' ? 'host' : 'guest',
        phone: body.phone || '',
        city: body.city || 'İstanbul',
        avatar: body.role === 'host'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        bio: body.role === 'host' ? 'StayNova Ev Sahibi' : 'StayNova Misafir Üyesi',
        preferences: { currency: 'TRY', language: 'tr' },
        status: 'active'
      };
      users.push(newUser);
      localStorage.setItem('staynova_s1_users', JSON.stringify(users));
      localStorage.setItem('staynova_s1_active_user_id', String(newUser.id));
      return {
        message: `Hoş geldiniz ${newUser.name}! Hesabınız oluşturuldu.`,
        token: `local_jwt_${newUser.id}`,
        user: newUser
      };
    }

    if ((path === '/api/users/me' || path === '/api/users/profile') && method === 'GET') {
      const uid = Number(localStorage.getItem('staynova_s1_active_user_id'));
      const user = users.find(u => u.id === uid);
      if (!user) throw new Error('Oturum bulunamadı.');
      return { user };
    }

    if (path === '/api/users/profile' && method === 'PUT') {
      const uid = Number(localStorage.getItem('staynova_s1_active_user_id'));
      const idx = users.findIndex(u => u.id === uid);
      if (idx < 0) throw new Error('Kullanıcı bulunamadı.');
      users[idx] = {
        ...users[idx],
        name: body.name ?? users[idx].name,
        phone: body.phone ?? users[idx].phone,
        city: body.city ?? users[idx].city,
        avatar: body.avatar ?? users[idx].avatar,
        bio: body.bio ?? users[idx].bio,
        preferences: { ...(users[idx].preferences || {}), ...(body.preferences || {}) }
      };
      localStorage.setItem('staynova_s1_users', JSON.stringify(users));
      return { message: 'Profil bilgileriniz başarıyla güncellendi.', user: users[idx] };
    }

    if ((path === '/api/listings' || path === '/api/listings/host') && method === 'GET') {
      return { listings };
    }

    if (path === '/api/listings' && method === 'POST') {
      const coverObj = (body.photos || []).find(p => p.isCover) || (body.photos || [])[0];
      const created = {
        id: Date.now(),
        hostId: this.state.user ? this.state.user.id : 2,
        hostName: this.state.user ? this.state.user.name : 'Ev Sahibi',
        ...body,
        coverPhoto: coverObj ? coverObj.url : 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop&q=80',
        status: 'pending_approval',
        moderationNote: 'Yönetici (Admin) moderasyon onayı bekleniyor.'
      };
      listings.unshift(created);
      localStorage.setItem('staynova_s1_listings', JSON.stringify(listings));
      return {
        message: 'İlanınız oluşturuldu ve Moderasyon Onayı için yöneticiye iletildi.',
        listing: created
      };
    }

    const idMatch = path.match(/^\/api\/listings\/(\d+)$/);
    if (idMatch) {
      const id = Number(idMatch[1]);
      const idx = listings.findIndex(l => Number(l.id) === id);
      if (method === 'PUT' && idx >= 0) {
        const coverObj = (body.photos || listings[idx].photos || []).find(p => p.isCover) || (body.photos || listings[idx].photos || [])[0];
        listings[idx] = {
          ...listings[idx],
          ...body,
          coverPhoto: coverObj ? coverObj.url : listings[idx].coverPhoto
        };
        localStorage.setItem('staynova_s1_listings', JSON.stringify(listings));
        return { message: 'İlan bilgileri ve müsaitlik takvimi başarıyla güncellendi.', listing: listings[idx] };
      }
      if (method === 'DELETE' && idx >= 0) {
        const removed = listings.splice(idx, 1)[0];
        localStorage.setItem('staynova_s1_listings', JSON.stringify(listings));
        return { message: `"${removed.title}" ilanı sistemden kalıcı olarak silindi.` };
      }
    }

    return {};
  },

  async refreshAllData() {
    const tasks = [this.api('/api/listings')];
    if (this.state.token) {
      tasks.push(this.api('/api/listings/host'));
    }
    const results = await Promise.allSettled(tasks);
    if (results[0] && results[0].status === 'fulfilled' && results[0].value.listings) {
      this.state.listings = results[0].value.listings;
    }
    if (results[1] && results[1].status === 'fulfilled' && results[1].value.listings) {
      this.state.hostListings = results[1].value.listings;
    } else {
      this.state.hostListings = this.state.listings;
    }
  }
});

