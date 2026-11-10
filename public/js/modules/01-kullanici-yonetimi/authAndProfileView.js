// MODÜL 1: KULLANICI YÖNETİMİ, GİRİŞ & KAYIT PORTALI VE PROFİL (3. Kişi - Ahmet Kayar)
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
    const posters = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80'
    ];
    return `
      <div class="auth-poster-backdrop" aria-hidden="true">
        ${posters.map(url => `<div class="auth-poster-tile" style="background-image:url('${url}')"></div>`).join('')}
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
    const portal = this.state.authPortal || { activeRole: 'guest', registerRole: 'guest', mode: 'login' };
    const isLogin = portal.mode === 'login';
    const isGuest = portal.activeRole === 'guest';

    return `
      <div class="auth-modal-header">
        <div class="brand-logo" style="margin-bottom:8px;">Stay<span>Nova</span></div>
        <div class="auth-role-tabs">
          <button type="button" class="auth-role-tab ${isGuest ? 'active' : ''}" onclick="app.switchAuthPortalState('guest', null)">
            🧳 Misafir Portalı
          </button>
          <button type="button" class="auth-role-tab ${!isGuest ? 'active' : ''}" onclick="app.switchAuthPortalState('host', null)">
            🏠 Ev Sahibi Portalı
          </button>
        </div>
      </div>

      <div class="auth-toggle-mode">
        <button type="button" class="btn btn-sm ${isLogin ? 'btn-primary' : 'btn-outline'}" onclick="app.switchAuthPortalState(null, 'login')">
          Giriş Yap
        </button>
        <button type="button" class="btn btn-sm ${!isLogin ? 'btn-primary' : 'btn-outline'}" onclick="app.switchAuthPortalState(null, 'register')">
          Kayıt Ol
        </button>
      </div>

      <form onsubmit="event.preventDefault(); ${isLogin ? 'app.handleLogin(this)' : 'app.handleRegister(this)'};" class="auth-form-body">
        <input type="hidden" name="expectedRole" value="${portal.activeRole}" />
        <input type="hidden" name="role" value="${portal.activeRole}" />

        ${!isLogin ? `
          <div class="form-group">
            <label>Ad Soyad</label>
            <input type="text" name="name" class="form-control" placeholder="Adınız Soyadınız" required />
          </div>
          <div class="form-group">
            <label>Telefon</label>
            <input type="tel" name="phone" class="form-control" placeholder="05XX XXX XX XX" />
          </div>
        ` : ''}

        <div class="form-group">
          <label>E-posta Adresi</label>
          <input type="email" name="email" class="form-control" placeholder="${isGuest ? 'misafir@staynova.com' : 'evsahibi@staynova.com'}" required />
        </div>

        <div class="form-group">
          <label>Şifre</label>
          <input type="password" name="password" class="form-control" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn btn-primary btn-block" style="margin-top:16px;">
          ${isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
        </button>
      </form>
    `;
  },

  async handleLogin(form) {
    const fd = new FormData(form);
    const res = await this.api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: fd.get('email'),
        password: fd.get('password'),
        expectedRole: fd.get('expectedRole')
      })
    });
    this.state.token = res.token;
    this.state.user = res.user;
    localStorage.setItem('staynova_token', res.token);
    this.toast(res.message, 'success');
    await this.refreshAllData();
    this.navigate(this.state.user.role === 'host' ? 'host' : 'profile');
  },

  async handleRegister(form) {
    const fd = new FormData(form);
    const res = await this.api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: fd.get('name'),
        email: fd.get('email'),
        password: fd.get('password'),
        role: fd.get('role'),
        phone: fd.get('phone')
      })
    });
    this.state.token = res.token;
    this.state.user = res.user;
    localStorage.setItem('staynova_token', res.token);
    this.toast(res.message, 'success');
    await this.refreshAllData();
    this.navigate('profile');
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

  renderProfileView() {
    const u = this.state.user;
    if (!u) {
      return `<div class="card text-center"><p>Profilinizi görüntülemek için lütfen giriş yapınız.</p></div>`;
    }

    return `
      <div class="profile-layout-container">
        <div class="card profile-main-card">
          <h2 style="font-size:1.6rem;font-weight:600;margin-bottom:20px;">Kullanıcı Profili</h2>
          
          <div class="profile-avatar-row" style="display:flex;align-items:center;gap:20px;margin-bottom:24px;">
            <div id="profileAvatarPreviewBox" style="width:96px;height:96px;border-radius:50%;overflow:hidden;border:2px solid var(--border-color);background:#f1f5f9;">
              <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80'}" style="width:100%;height:100%;object-fit:cover;" />
            </div>
            <div>
              <label class="btn btn-outline btn-sm" style="cursor:pointer;">
                📷 Bilgisayardan Resim Yükle
                <input type="file" accept="image/*" style="display:none;" onchange="app.onProfileAvatarSelected(this)" />
              </label>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">JPG, PNG maksimum 5MB</div>
            </div>
          </div>

          <form onsubmit="event.preventDefault(); app.saveProfile(this);">
            <input type="hidden" name="avatar" id="profileAvatarHiddenInput" value="${u.avatar || ''}" />
            <div class="form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div class="form-group">
                <label>Ad Soyad</label>
                <input type="text" name="name" class="form-control" value="${u.name}" required />
              </div>
              <div class="form-group">
                <label>Telefon</label>
                <input type="tel" name="phone" class="form-control" value="${u.phone || ''}" />
              </div>
              <div class="form-group">
                <label>Şehir</label>
                <input type="text" name="city" class="form-control" value="${u.city || ''}" />
              </div>
              <div class="form-group">
                <label>Rol</label>
                <input type="text" class="form-control" value="${u.role === 'host' ? 'Ev Sahibi (Host)' : 'Misafir (Guest)'}" disabled />
              </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
              <label>Hakkımda / Bio</label>
              <textarea name="bio" class="form-control" rows="3">${u.bio || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top:16px;">Değişiklikleri Kaydet</button>
          </form>
        </div>
      </div>
    `;
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
        bio: fd.get('bio')
      })
    });
    this.state.user = res.user;
    this.toast(res.message, 'success');
    this.renderAll();
  }
});

