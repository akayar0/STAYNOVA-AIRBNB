// public/js/layers/04-controller-layer/routerAndLayoutController.js — 1. Hafta (Sprint 1) Yönlendirici ve Üst Menü Kontrolcüsü
var app = (window.app = window.app || {});

Object.assign(app, {
  async init() {
    this.applyTheme(this.state.theme);

    window.addEventListener('scroll', () => {
      const headerEl = document.querySelector('.main-header');
      const sy = window.scrollY || document.documentElement.scrollTop || 0;
      if (headerEl) {
        headerEl.classList.toggle('scrolled', sy > 20);
      }
      const topBtn = document.getElementById('scrollTopBtn');
      if (topBtn) {
        topBtn.classList.toggle('visible', sy > 220);
      }
    });

    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) {
        this.state.view = e.state.view;
        this.renderAll();
      }
    });

    window.addEventListener('beforeunload', (e) => {
      if (this.state.view === 'wizard') {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('button, .nav-tab, .amenity-card-item')) {
        const wave = document.createElement('span');
        wave.className = 'click-ripple-wave';
        wave.style.left = `${e.clientX}px`;
        wave.style.top = `${e.clientY}px`;
        document.body.appendChild(wave);
        setTimeout(() => wave.remove(), 550);
      }
      if (this.state.userMenuOpen && !e.target.closest('.user-menu-wrapper')) {
        this.state.userMenuOpen = false;
        this.renderHeader();
      }
      if (this.state.wizardPopoverOpen && !e.target.closest('.custom-popover-wrapper')) {
        this.state.wizardPopoverOpen = null;
        this.renderAll();
      }
    });

    this.ensureScrollTopButton();

    try {
      if (this.state.token) {
        const meRes = await this.api('/api/users/me');
        if (meRes && meRes.user) {
          this.state.user = meRes.user;
        }
      }
      await this.refreshAllData();
    } catch {
      this.state.token = null;
      this.state.user = null;
      localStorage.removeItem('staynova_jwt');
    } finally {
      this.renderAll();
    }
  },

  applyTheme(theme) {
    this.state.theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.state.theme);
    localStorage.setItem('staynova_theme', this.state.theme);
  },

  toggleTheme() {
    this.applyTheme(this.state.theme === 'dark' ? 'light' : 'dark');
    this.renderHeader();
  },

  toggleUserMenu() {
    this.state.userMenuOpen = !this.state.userMenuOpen;
    this.renderHeader();
  },

  ensureScrollTopButton() {
    if (document.getElementById('scrollTopBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'scrollTopBtn';
    btn.className = 'scroll-top-btn';
    btn.title = 'Yukarı Çık';
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>`;
    btn.onclick = () => this.scrollToTop();
    document.body.appendChild(btn);
  },

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toggleMobileNav() {
    this.state.mobileNavOpen = !this.state.mobileNavOpen;
    this.renderHeader();
  },

  navigate(viewId) {
    if (this.state.view === 'wizard' && viewId !== 'wizard') {
      this.promptLeaveWizard();
      return;
    }
    this.state.userMenuOpen = false;
    this.state.mobileNavOpen = false;
    if (viewId === 'profile' && !this.state.user) {
      this.toast('Profil Yönetimi ekranını görüntülemek için lütfen önce giriş yapınız.', 'info');
      this.state.view = 'auth';
      this.renderAll();
      return;
    }
    if (viewId === 'host' && (!this.state.user || !['host', 'admin'].includes(this.state.user.role))) {
      if (!this.state.user) {
        this.toast('Ev Sahibi İlan Sihirbazı & Takvim için lütfen Ev Sahibi olarak giriş yapınız.', 'info');
        this.state.authPortal.activeRole = 'host';
        this.state.authPortal.registerRole = 'host';
        this.state.view = 'auth';
        this.renderAll();
        return;
      }
    }
    this.state.view = viewId;
    try {
      window.history.pushState({ view: viewId }, '', `#${viewId}`);
    } catch {
      // file:// ortamında pushState hatası yoksayılır
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.renderAll();
  },

  logout() {
    this.state.token = null;
    this.state.user = null;
    this.state.userMenuOpen = false;
    localStorage.removeItem('staynova_jwt');
    localStorage.removeItem('staynova_s1_active_user_id');
    this.toast('Oturumunuz güvenli bir şekilde kapatıldı.', 'info');
    this.state.view = 'auth';
    this.renderAll();
  },

  renderHeader() {
    const headerEl = document.getElementById('headerRoot');
    if (!headerEl) return;

    // ÜST MENÜ VE VARSAYILAN EKRAN GÖRÜNÜM KODU
    const tabs = [
      { id: 'auth', label: '🔐 Giriş & Kayıt Portalı' },
      { id: 'profile', label: '👤 Profil Yönetimi' },
      { id: 'host', label: '🏠 Ev Sahibi İlan Sihirbazı & Takvim' }
    ];

    const u = this.state.user;
    const isWizardActive = this.state.view === 'wizard';

    headerEl.innerHTML = `
      <header class="main-header">
        <div class="header-inner">
          <div class="brand-logo" onclick="app.navigate('auth')">
            <span class="brand-icon">✦</span>
            <div>
              <span class="brand-title">StayNova</span>
              <span class="brand-subtitle">Otel & Ev Kiralama Platformu</span>
            </div>
          </div>

          <nav class="nav-tabs ${this.state.mobileNavOpen ? 'mobile-open' : ''}">
            ${tabs.map(t => {
              const active = (this.state.view === t.id) || (t.id === 'host' && isWizardActive);
              return `
                <button class="nav-tab ${active ? 'active' : ''}" onclick="app.navigate('${t.id}')">
                  <span>${t.label}</span>
                </button>
              `;
            }).join('')}
          </nav>

          <div class="header-right" id="headerUserArea">
            <button class="mobile-nav-toggle-btn" onclick="app.toggleMobileNav()" title="Menü">
              ☰
            </button>
            <button class="theme-toggle-btn" onclick="app.toggleTheme()" title="Açık / Karanlık Mod">
              ${this.state.theme === 'dark' ? '☀️' : '🌙'}
            </button>

            ${u ? `
              <div class="user-menu-wrapper">
                <button class="user-avatar-btn" onclick="app.toggleUserMenu()" title="${this.escapeHtml(u.name)}">
                  <img src="${this.escapeHtml(u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')}" alt="Avatar" />
                </button>
                ${this.state.userMenuOpen ? `
                  <div class="user-dropdown-menu">
                    <div class="user-dropdown-header">
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                        <strong style="font-size:0.92rem;">${this.escapeHtml(u.name)}</strong>
                        <span class="badge ${u.role === 'host' ? 'badge-info' : 'badge-success'}">
                          ${u.role === 'host' ? 'EV SAHİBİ' : 'MİSAFİR'}
                        </span>
                      </div>
                      <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">${this.escapeHtml(u.email)}</div>
                    </div>
                    <button class="user-dropdown-item" onclick="app.navigate('profile')">
                      ⚙️ Hesap & Profil Ayarları
                    </button>
                    ${u.role === 'host' ? `
                      <button class="user-dropdown-item" onclick="app.navigate('host')">
                        🏠 İlan Sihirbazı & Takvim
                      </button>
                    ` : ''}
                    <button class="user-dropdown-item" style="color:#ef4444;" onclick="app.logout()">
                      🚪 Çıkış Yap
                    </button>
                  </div>
                ` : ''}
              </div>
            ` : `
              <button class="btn btn-primary btn-sm" onclick="app.navigate('auth')">
                🔐 Giriş / Kayıt
              </button>
            `}
          </div>
        </div>
      </header>
    `;
  },

  renderAll() {
    this.renderHeader();
    const root = document.getElementById('appRoot');
    if (!root) return;

    if (this.state.view === 'auth') {
      root.innerHTML = this.renderAuthView();
    } else if (this.state.view === 'profile') {
      root.innerHTML = this.renderProfileView();
    } else if (this.state.view === 'host') {
      root.innerHTML = this.renderHostDashboardView();
    } else if (this.state.view === 'wizard') {
      root.innerHTML = this.renderWizardView();
    } else {
      root.innerHTML = this.renderAuthView();
    }
  },

  toast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 3600);
  }
});

