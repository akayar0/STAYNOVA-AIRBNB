// public/js/modules/01-kullanici-yonetimi/authAndProfileView.js — MODÜL 1: Giriş/Kayıt Portalı ve Kullanıcı Profili Ön Yüzü (3. Kişi - AK | AIR-43)
var app = (window.app = window.app || {});

Object.assign(app, {
  // Giriş <-> Kayıt ve Misafir <-> Ev Sahibi geçişlerinde arka plan kolajını oynatmadan yalnız iç kartı günceller
  switchAuthPortalState(role, mode) {
    if (!this.state.authPortal) {
      this.state.authPortal = { activeRole: 'guest', registerRole: 'guest', mode: 'login' };
    }
    if (role) {
      this.state.authPortal.activeRole = role;
      this.state.authPortal.registerRole = role;
    }
    if (mode) {
      this.state.authPortal.mode = mode;
    }
    const innerEl = document.getElementById('authCardInnerContainer');
    if (innerEl) {
      innerEl.innerHTML = this.renderAuthCardInnerHtml();
      return;
    }
    this.renderAll();
  },

  renderAuthPosterBackdrop() {
    const imgs = (this.constants && this.constants.TRAVEL_POSTER_IMAGES) || [];
    return `
      <div class="auth-poster-backdrop">
        <div class="auth-poster-grid">
          ${imgs.map((url, idx) => `
            <div class="auth-poster-cell">
              <img src="${url}" alt="Destinasyon ${idx + 1}" loading="lazy" />
            </div>
          `).join('')}
        </div>
        <div class="auth-poster-veil"></div>
      </div>
    `;
  },

  renderAuthView() {
    if (!this.state.authPortal) {
      this.state.authPortal = { activeRole: 'guest', registerRole: 'guest', mode: 'login' };
    }
    return `
      <div class="auth-page-stage">
        ${this.renderAuthPosterBackdrop()}
        <div class="auth-center-modal-card" id="authCardInnerContainer">
          ${this.renderAuthCardInnerHtml()}
        </div>
      </div>
    `;
  },

  renderAuthCardInnerHtml() {
    const p = this.state.authPortal || { activeRole: 'guest', registerRole: 'guest', mode: 'login' };
    const isHost = p.activeRole === 'host';
    const isLogin = p.mode === 'login';

    return `
      <div style="text-align:center;margin-bottom:14px;">
        <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span class="brand-icon" style="width:32px;height:32px;font-size:1rem;">✦</span>
          <h2 style="font-size:1.35rem;font-weight:600;margin:0;">StayNova Giriş & Kayıt Portalı</h2>
        </div>
        <p style="font-size:0.82rem;color:var(--text-muted);">
          Misafir ve Ev Sahibi hesapları için güvenli oturum merkezi
        </p>
      </div>

      <!-- Rol Seçim Sekmeleri (Misafir vs Ev Sahibi) -->
      <div class="auth-role-tabs">
        <button type="button" class="auth-role-tab ${!isHost ? 'active' : ''}" onclick="app.switchAuthPortalState('guest', null)">
          🧳 Misafir Portalı
        </button>
        <button type="button" class="auth-role-tab ${isHost ? 'active' : ''}" onclick="app.switchAuthPortalState('host', null)">
          🏠 Ev Sahibi Portalı
        </button>
      </div>

      <!-- Giriş Yap / Kayıt Ol Mod Seçimi -->
      <div class="auth-mode-switch">
        <button type="button" class="auth-mode-btn ${isLogin ? 'active' : ''}" onclick="app.switchAuthPortalState(null, 'login')">
          🔐 ${isHost ? 'Ev Sahibi Girişi' : 'Misafir Girişi'}
        </button>
        <button type="button" class="auth-mode-btn ${!isLogin ? 'active' : ''}" onclick="app.switchAuthPortalState(null, 'register')">
          ✨ Yeni ${isHost ? 'Ev Sahibi' : 'Misafir'} Kaydı
        </button>
      </div>

      ${isLogin ? `
        <form onsubmit="event.preventDefault(); app.handleLoginSubmit(this);">
          <input type="hidden" name="expectedRole" value="${isHost ? 'host' : 'guest'}" />
          <div class="form-group" style="margin-bottom:12px;">
            <label>E-Posta Adresi</label>
            <input type="email" name="email" class="form-control" required
              placeholder="${isHost ? 'evsahibi@staynova.com' : 'misafir@staynova.com'}"
              value="${isHost ? 'evsahibi@staynova.com' : 'misafir@staynova.com'}" />
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label>Şifre</label>
            <input type="password" name="password" class="form-control" required
              placeholder="••••••" value="123456" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;padding:12px;">
            ${isHost ? '🏠 Ev Sahibi Olarak Giriş Yap' : '🧳 Misafir Olarak Giriş Yap'}
          </button>
        </form>

        <div style="margin-top:14px;padding-top:12px;border-top:1px dashed var(--border-color);display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <button type="button" class="btn btn-outline btn-sm" onclick="app.quickDemoLogin('guest')">
            ⚡ Hızlı Misafir Demo (Zeynep)
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="app.quickDemoLogin('host')">
            ⚡ Hızlı Ev Sahibi Demo (Ahmet)
          </button>
        </div>
      ` : `
        <form onsubmit="event.preventDefault(); app.handleRegisterSubmit(this);">
          <input type="hidden" name="role" value="${isHost ? 'host' : 'guest'}" />
          <div class="form-grid" style="margin-bottom:10px;">
            <div class="form-group">
              <label>Ad Soyad</label>
              <input type="text" name="name" class="form-control" required placeholder="Adınız Soyadınız" />
            </div>
            <div class="form-group">
              <label>Şehir</label>
              <input type="text" name="city" class="form-control" placeholder="İstanbul" value="İstanbul" />
            </div>
          </div>
          <div class="form-group" style="margin-bottom:10px;">
            <label>E-Posta Adresi</label>
            <input type="email" name="email" class="form-control" required placeholder="ornek@staynova.com" />
          </div>
          <div class="form-grid" style="margin-bottom:14px;">
            <div class="form-group">
              <label>Telefon</label>
              <input type="text" name="phone" class="form-control" placeholder="0532 000 00 00" />
            </div>
            <div class="form-group">
              <label>Şifre (En az 6 karakter)</label>
              <input type="password" name="password" class="form-control" required minlength="6" placeholder="••••••" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;padding:12px;">
            ✨ ${isHost ? 'Ev Sahibi Hesabı Oluştur' : 'Misafir Hesabı Oluştur'}
          </button>
        </form>
      `}
    `;
  },

  async handleLoginSubmit(form) {
    const fd = new FormData(form);
    const expectedRole = fd.get('expectedRole');
    const res = await this.api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: fd.get('email'),
        password: fd.get('password'),
        expectedRole
      })
    });
    this.state.token = res.token;
    this.state.user = res.user;
    localStorage.setItem('staynova_jwt', res.token);
    this.toast(res.message, 'success');
    await this.refreshAllData();
    this.navigate(res.user.role === 'host' ? 'host' : 'profile');
  },

  async handleRegisterSubmit(form) {
    const fd = new FormData(form);
    const res = await this.api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: fd.get('name'),
        email: fd.get('email'),
        password: fd.get('password'),
        phone: fd.get('phone'),
        city: fd.get('city'),
        role: fd.get('role')
      })
    });
    this.state.token = res.token;
    this.state.user = res.user;
    localStorage.setItem('staynova_jwt', res.token);
    this.toast(res.message, 'success');
    await this.refreshAllData();
    this.navigate(res.user.role === 'host' ? 'host' : 'profile');
  },

  async quickDemoLogin(role) {
    const email = role === 'host' ? 'evsahibi@staynova.com' : 'misafir@staynova.com';
    const res = await this.api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: '123456',
        expectedRole: role
      })
    });
    this.state.token = res.token;
    this.state.user = res.user;
    localStorage.setItem('staynova_jwt', res.token);
    this.toast(`${res.user.name} (${role === 'host' ? 'Ev Sahibi' : 'Misafir'}) olarak giriş yapıldı.`, 'success');
    await this.refreshAllData();
    this.navigate(role === 'host' ? 'host' : 'profile');
  },

  renderProfileView() {
    const u = this.state.user;
    if (!u) return this.renderAuthView();

    const prefs = u.preferences || { currency: 'TRY', language: 'tr' };
    const avatarUrl = u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

    return `
      <div style="max-width:860px;margin:0 auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 style="font-size:1.75rem;font-weight:600;">Kullanıcı Profili</h1>
            <p style="font-size:0.9rem;color:var(--text-muted);">
              Kişisel bilgilerinizi, profil fotoğrafınızı ve hesap tercihlerinizi yönetin
            </p>
          </div>
          <span class="badge ${u.role === 'host' ? 'badge-info' : 'badge-success'}" style="font-size:0.85rem;padding:6px 14px;">
            ${u.role === 'host' ? '🏠 Ev Sahibi Hesabı' : '🧳 Misafir Hesabı'}
          </span>
        </div>

        <div class="card">
          <form onsubmit="event.preventDefault(); app.saveProfile(this);">
            <input type="hidden" name="avatar" id="profileAvatarHiddenInput" value="${this.escapeHtml(avatarUrl)}" />

            <div style="display:flex;align-items:center;gap:22px;padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid var(--border-color);flex-wrap:wrap;">
              <div id="profileAvatarPreviewBox" style="width:96px;height:96px;border-radius:50%;overflow:hidden;border:3px solid var(--brand-primary);flex-shrink:0;">
                <img src="${this.escapeHtml(avatarUrl)}" alt="Profil Fotoğrafı" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />
              </div>
              <div style="flex:1;min-width:220px;">
                <h3 style="font-size:1.2rem;margin-bottom:4px;">${this.escapeHtml(u.name)}</h3>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">${this.escapeHtml(u.email)}</p>
                <label class="btn btn-outline btn-sm" style="cursor:pointer;">
                  📷 Bilgisayardan Resim Yükle
                  <input type="file" accept="image/*" style="display:none;" onchange="app.onProfileAvatarSelected(this)" />
                </label>
              </div>
            </div>

            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label>Ad Soyad</label>
                <input type="text" name="name" class="form-control" required value="${this.escapeHtml(u.name)}" />
              </div>
              <div class="form-group">
                <label>Telefon Numarası</label>
                <input type="text" name="phone" class="form-control" value="${this.escapeHtml(u.phone || '')}" />
              </div>
              <div class="form-group">
                <label>Yaşadığınız Şehir</label>
                <input type="text" name="city" class="form-control" value="${this.escapeHtml(u.city || 'İstanbul')}" />
              </div>
              <div class="form-group">
                <label>Para Birimi Tercihi</label>
                <select name="currency" class="form-control">
                  <option value="TRY" ${prefs.currency === 'TRY' ? 'selected' : ''}>₺ Türk Lirası (TRY)</option>
                  <option value="EUR" ${prefs.currency === 'EUR' ? 'selected' : ''}>€ Euro (EUR)</option>
                  <option value="USD" ${prefs.currency === 'USD' ? 'selected' : ''}>$ Amerikan Doları (USD)</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:18px;">
              <label>Hakkımda / Biyografi</label>
              <textarea name="bio" rows="3" class="form-control" placeholder="Kendinizden kısaca bahsedin...">${this.escapeHtml(u.bio || '')}</textarea>
            </div>

            <input type="hidden" name="language" value="${this.escapeHtml(prefs.language || 'tr')}" />

            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
              <button type="button" class="btn btn-outline" onclick="app.logout()">
                🚪 Oturumu Kapat
              </button>
              <button type="submit" class="btn btn-primary">
                💾 Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  // Kullanıcının bilgisayarından seçtiği resmi Canvas ile optimize ederek Base64 olarak profile yazar
  onProfileAvatarSelected(inputEl) {
    const file = inputEl && inputEl.files && inputEl.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 280;
        let w = img.width, h = img.height;
        if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.84);
        document.getElementById('profileAvatarHiddenInput').value = compressedDataUrl;
        document.getElementById('profileAvatarPreviewBox').innerHTML =
          `<img src="${compressedDataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
        this.toast('Fotoğraf seçildi. "Değişiklikleri Kaydet" butonuna basarak profilinize uygulayabilirsiniz.', 'info');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  },

  async saveProfile(form) {
    const fd = new FormData(form);
    const res = await this.api('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: fd.get('name'),
        phone: fd.get('phone'),
        city: fd.get('city'),
        avatar: fd.get('avatar'),
        bio: fd.get('bio'),
        preferences: { currency: fd.get('currency'), language: fd.get('language') }
      })
    });
    this.state.user = res.user;
    this.toast(res.message, 'success');
    this.renderAll();
  }
});

