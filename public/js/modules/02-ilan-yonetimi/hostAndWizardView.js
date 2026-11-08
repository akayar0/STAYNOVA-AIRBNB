// public/js/modules/02-ilan-yonetimi/hostAndWizardView.js — MODÜL 2: İlan Oluşturma, 81 İl/İlçe Seçici, Canlı Önizleme Kartı ve Takvim (4. Kişi - AB | AIR-47)
var app = (window.app = window.app || {});

Object.assign(app, {
  initWizard(existingListing = null) {
    this.state.wizardStep = 1;
    this.state.wizardPopoverOpen = null;
    this.state.provinceSearchQuery = '';
    this.state.districtSearchQuery = '';

    // Yeni ilanda tüm seçenekler boş/sıfır başlar, ev sahibi kendisi doldurur
    this.state.wizardData = existingListing
      ? {
          id: existingListing.id,
          title: existingListing.title || '',
          description: existingListing.description || '',
          propertyType: existingListing.propertyType || '',
          city: existingListing.city || '',
          district: existingListing.district || '',
          neighborhood: existingListing.neighborhood || '',
          address: existingListing.address || '',
          basePrice: existingListing.basePrice || '',
          discountedPrice: existingListing.discountedPrice || '',
          discountNote: existingListing.discountNote || '',
          cleaningFee: existingListing.cleaningFee || '',
          maxAdults: Number(existingListing.maxAdults) || 0,
          maxChildren: Number(existingListing.maxChildren) || 0,
          bedrooms: Number(existingListing.bedrooms) || 0,
          beds: Number(existingListing.beds) || 0,
          bathrooms: Number(existingListing.bathrooms) || 0,
          cancellationPolicy: existingListing.cancellationPolicy || '',
          amenities: Array.isArray(existingListing.amenities) ? [...existingListing.amenities] : [],
          photos: Array.isArray(existingListing.photos) ? existingListing.photos.map(p => ({ ...p })) : [],
          seasonalMultipliers: Array.isArray(existingListing.seasonalMultipliers)
            ? existingListing.seasonalMultipliers.map(s => ({ ...s }))
            : [],
          blockedDates: Array.isArray(existingListing.blockedDates) ? [...existingListing.blockedDates] : [],
          requireModeration: true
        }
      : {
          id: null,
          title: '',
          description: '',
          propertyType: '',
          city: '',
          district: '',
          neighborhood: '',
          address: '',
          basePrice: '',
          discountedPrice: '',
          discountNote: '',
          cleaningFee: '',
          maxAdults: 0,
          maxChildren: 0,
          bedrooms: 0,
          beds: 0,
          bathrooms: 0,
          cancellationPolicy: '',
          amenities: [],
          photos: [],
          seasonalMultipliers: [],
          blockedDates: [],
          requireModeration: true
        };
  },

  openCreateWizard() {
    this.initWizard(null);
    this.state.view = 'wizard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.renderAll();
  },

  openEditWizard(listingId) {
    const list = this.state.hostListings.length ? this.state.hostListings : this.state.listings;
    const found = list.find(l => Number(l.id) === Number(listingId));
    if (!found) return;
    this.initWizard(found);
    this.state.view = 'wizard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.renderAll();
  },

  promptLeaveWizard() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'leaveWizardModal';
    modal.innerHTML = `
      <div class="modal-card">
        <h3 style="font-size:1.2rem;margin-bottom:8px;">İlan Oluşturmadan Çıkmak İstiyor Musunuz?</h3>
        <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:18px;">
          İlan oluşturmadan çıkmak istediğinizden emin misiniz? Kaydedilmeyen bilgileriniz silinecektir.
        </p>
        <div style="display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn-outline" onclick="document.getElementById('leaveWizardModal').remove()">
            Düzenlemeye Devam Et
          </button>
          <button class="btn btn-danger" onclick="document.getElementById('leaveWizardModal').remove(); app.state.view='host'; app.renderAll();">
            Evet, Çıkış Yap
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  syncWizardDomInputs() {
    const d = this.state.wizardData;
    if (!d) return;
    const titleEl = document.getElementById('wizTitleInput');
    const descEl = document.getElementById('wizDescInput');
    const neighEl = document.getElementById('wizNeighborhoodInput');
    const addrEl = document.getElementById('wizAddressInput');
    const basePriceEl = document.getElementById('wizBasePriceInput');
    const discPriceEl = document.getElementById('wizDiscountedPriceInput');
    const discNoteEl = document.getElementById('wizDiscountNoteSelect');
    const cleanFeeEl = document.getElementById('wizCleaningFeeInput');

    if (titleEl) d.title = titleEl.value;
    if (descEl) d.description = descEl.value;
    if (neighEl) d.neighborhood = neighEl.value;
    if (addrEl) d.address = addrEl.value;
    if (basePriceEl) d.basePrice = basePriceEl.value;
    if (discPriceEl) d.discountedPrice = discPriceEl.value;
    if (discNoteEl) d.discountNote = discNoteEl.value;
    if (cleanFeeEl) d.cleaningFee = cleanFeeEl.value;
  },

  // Sağ sütundaki Canlı İlan Önizlemesi & Adım Kontrolü kartını her tuş vuruşunda günceller
  updateWizardPreviewDom() {
    this.syncWizardDomInputs();
    const container = document.getElementById('wizardLivePreviewContainer');
    if (container) {
      container.innerHTML = this.renderWizardLivePreviewHtml();
    }
  },

  setWizardStep(step) {
    this.syncWizardDomInputs();
    this.state.wizardStep = Math.max(1, Math.min(5, Number(step)));
    this.state.wizardPopoverOpen = null;
    this.renderAll();
  },

  selectWizardPropertyType(typeKey) {
    this.syncWizardDomInputs();
    this.state.wizardData.propertyType = typeKey;
    this.renderAll();
  },

  toggleWizardPopover(popoverName, event) {
    if (event) event.stopPropagation();
    this.syncWizardDomInputs();
    this.state.wizardPopoverOpen = this.state.wizardPopoverOpen === popoverName ? null : popoverName;
    this.renderAll();
  },

  selectWizardProvince(prov) {
    this.syncWizardDomInputs();
    this.state.wizardData.city = prov;
    this.state.wizardData.district = '';
    this.state.wizardPopoverOpen = 'district';
    this.state.provinceSearchQuery = '';
    this.state.districtSearchQuery = '';
    this.renderAll();
  },

  selectWizardDistrict(dist) {
    this.syncWizardDomInputs();
    this.state.wizardData.district = dist;
    this.state.wizardPopoverOpen = null;
    this.renderAll();
  },

  stepWizardCapacity(field, delta) {
    this.syncWizardDomInputs();
    const cur = Number(this.state.wizardData[field] || 0);
    this.state.wizardData[field] = Math.max(0, Math.min(20, cur + delta));
    this.renderAll();
  },

  toggleWizardAmenity(key) {
    this.syncWizardDomInputs();
    const arr = this.state.wizardData.amenities;
    const idx = arr.indexOf(key);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(key);
    this.renderAll();
  },

  onWizardPhotosSelected(inputEl) {
    const files = inputEl && inputEl.files ? Array.from(inputEl.files) : [];
    if (!files.length) return;
    this.syncWizardDomInputs();

    let processed = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let w = img.width, h = img.height;
          if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
          const isFirst = this.state.wizardData.photos.length === 0;
          this.state.wizardData.photos.push({
            url: dataUrl,
            caption: file.name.replace(/\.[^.]+$/, ''),
            isCover: isFirst
          });
          processed++;
          if (processed === files.length) {
            this.toast(`${files.length} fotoğraf galeriye eklendi.`, 'success');
            this.renderAll();
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  addWizardPhotoByUrl() {
    this.syncWizardDomInputs();
    const urlInput = document.getElementById('wizPhotoUrlInput');
    const capInput = document.getElementById('wizPhotoCaptionInput');
    const url = urlInput ? urlInput.value.trim() : '';
    const caption = capInput ? capInput.value.trim() : '';
    if (!url) {
      this.toast('Lütfen geçerli bir görsel URL adresi giriniz.', 'error');
      return;
    }
    const isFirst = this.state.wizardData.photos.length === 0;
    this.state.wizardData.photos.push({
      url,
      caption: caption || `Mülk Görseli ${this.state.wizardData.photos.length + 1}`,
      isCover: isFirst
    });
    this.renderAll();
  },

  setWizardCoverPhoto(idx) {
    const photos = this.state.wizardData.photos;
    photos.forEach((p, i) => { p.isCover = i === idx; });
    const [selected] = photos.splice(idx, 1);
    photos.unshift(selected);
    this.renderAll();
  },

  removeWizardPhoto(idx) {
    const photos = this.state.wizardData.photos;
    photos.splice(idx, 1);
    if (photos.length > 0 && !photos.some(p => p.isCover)) {
      photos[0].isCover = true;
    }
    this.renderAll();
  },

  selectWizardPolicy(policyKey) {
    this.syncWizardDomInputs();
    this.state.wizardData.cancellationPolicy = policyKey;
    this.renderAll();
  },

  addSeasonalMultiplier() {
    this.syncWizardDomInputs();
    const labelEl = document.getElementById('wizSeasonLabel');
    const startEl = document.getElementById('wizSeasonStart');
    const endEl = document.getElementById('wizSeasonEnd');
    const multEl = document.getElementById('wizSeasonMult');
    const label = labelEl ? labelEl.value.trim() : '';
    const startDate = startEl ? startEl.value : '';
    const endDate = endEl ? endEl.value : '';
    const multiplier = multEl ? Number(multEl.value) : 1.2;

    if (!label || !startDate || !endDate) {
      this.toast('Sezon adı, başlangıç ve bitiş tarihlerini doldurunuz.', 'error');
      return;
    }
    this.state.wizardData.seasonalMultipliers.push({ label, startDate, endDate, multiplier });
    this.renderAll();
  },

  removeSeasonalMultiplier(idx) {
    this.syncWizardDomInputs();
    this.state.wizardData.seasonalMultipliers.splice(idx, 1);
    this.renderAll();
  },

  toggleWizardBlockedDate(dateStr) {
    this.syncWizardDomInputs();
    const arr = this.state.wizardData.blockedDates;
    const idx = arr.indexOf(dateStr);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(dateStr);
    this.renderAll();
  },

  getWizardStepStatuses() {
    const d = this.state.wizardData || {};
    return [
      { step: 1, title: '1. Temel Bilgiler & Tür', ok: Boolean(d.title && d.title.trim() && d.description && d.description.trim() && d.propertyType) },
      { step: 2, title: '2. 81 İl/İlçe & Kapasite', ok: Boolean(d.city && d.district && d.address && d.maxAdults > 0 && d.bedrooms > 0 && d.beds > 0) },
      { step: 3, title: '3. Olanaklar & Özellikler', ok: Boolean(Array.isArray(d.amenities) && d.amenities.length > 0) },
      { step: 4, title: '4. Fotoğraf Galerisi', ok: Boolean(Array.isArray(d.photos) && d.photos.length > 0) },
      { step: 5, title: '5. Fiyat, Kurallar & Takvim', ok: Boolean(Number(d.basePrice) > 0 && d.cancellationPolicy) }
    ];
  },

  renderWizardLivePreviewHtml() {
    const d = this.state.wizardData || {};
    const stepStatuses = this.getWizardStepStatuses();
    const coverObj = (d.photos || []).find(p => p.isCover) || (d.photos || [])[0];
    const coverUrl = coverObj ? coverObj.url : '';
    const propObj = (this.constants.PROPERTY_TYPES || []).find(t => t.key === d.propertyType);
    const basePrice = Number(d.basePrice) || 0;
    const discPrice = Number(d.discountedPrice) || 0;
    const hasDiscount = discPrice > 0 && discPrice < basePrice;

    return `
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <strong style="font-size:0.95rem;">Canlı İlan Önizlemesi</strong>
          <span class="badge badge-info">${d.id ? 'Düzenleme Modu' : 'Yeni İlan'}</span>
        </div>

        <div style="border-radius:16px;overflow:hidden;border:1px solid var(--border-color);background:var(--bg-elevated);margin-bottom:16px;">
          <div style="height:180px;background:rgba(15,23,42,0.06);display:flex;align-items:center;justify-content:center;position:relative;">
            ${coverUrl ? `
              <img src="${this.escapeHtml(coverUrl)}" alt="Kapak" style="width:100%;height:100%;object-fit:cover;" />
            ` : `
              <span style="font-size:0.85rem;color:var(--text-muted);">📷 Henüz Kapak Fotoğrafı Seçilmedi</span>
            `}
            ${hasDiscount ? `
              <span style="position:absolute;bottom:10px;left:10px;background:#e11d48;color:#fff;padding:4px 10px;border-radius:999px;font-size:0.76rem;font-weight:600;">
                📉 ${this.formatMoney(basePrice - discPrice)} düştü
              </span>
            ` : ''}
          </div>
          <div style="padding:14px;">
            <div style="font-size:0.76rem;color:var(--brand-primary);font-weight:500;margin-bottom:4px;">
              ${propObj ? `${propObj.icon} ${propObj.label}` : 'Mülk Tipi Seçilmedi'}
              ${d.city ? ` • 📍 ${this.escapeHtml(d.city)} / ${this.escapeHtml(d.district || 'İlçe')}` : ''}
            </div>
            <h4 style="font-size:1.02rem;margin-bottom:6px;">
              ${d.title ? this.escapeHtml(d.title) : 'İlan Başlığı Girilmedi'}
            </h4>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px;">
              ${d.maxAdults || 0} Yetişkin · ${d.bedrooms || 0} Oda · ${d.beds || 0} Yatak · ${d.bathrooms || 0} Banyo
            </div>
            <div style="display:flex;align-items:baseline;gap:8px;">
              ${basePrice > 0 ? (
                hasDiscount ? `
                  <span style="text-decoration:line-through;color:var(--text-muted);font-size:0.85rem;">${this.formatMoney(basePrice)}</span>
                  <strong style="font-size:1.15rem;color:var(--brand-primary);">${this.formatMoney(discPrice)}</strong>
                  <span style="font-size:0.76rem;color:var(--text-muted);">/ gece</span>
                ` : `
                  <strong style="font-size:1.15rem;color:var(--brand-primary);">${this.formatMoney(basePrice)}</strong>
                  <span style="font-size:0.76rem;color:var(--text-muted);">/ gece</span>
                `
              ) : `<span style="font-size:0.84rem;color:var(--text-muted);">Gecelik fiyat henüz girilmedi</span>`}
            </div>
          </div>
        </div>

        <h5 style="font-size:0.86rem;margin-bottom:8px;color:var(--text-muted);">Adım Kontrolü (Tıklayarak Geçiş Yapın)</h5>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${stepStatuses.map(s => `
            <div onclick="app.setWizardStep(${s.step})"
              style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:10px;border:1px solid var(--border-color);background:var(--bg-elevated);cursor:pointer;font-size:0.82rem;">
              <span>${s.title}</span>
              <span class="badge ${s.ok ? 'badge-success' : 'badge-warning'}">
                ${s.ok ? '✓ Tamam' : 'Eksik'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderCalendarDaysHtml(blockedDates = [], onClickExprPrefix = 'app.toggleWizardBlockedDate') {
    const days = [];
    const baseDate = new Date(2026, 10, 1); // Kasım 2026
    for (let i = 1; i <= 30; i++) {
      const dateStr = `2026-11-${String(i).padStart(2, '0')}`;
      const isBlocked = blockedDates.includes(dateStr);
      days.push(`
        <div class="cal-day ${isBlocked ? 'blocked' : ''}" onclick="${onClickExprPrefix}('${dateStr}')">
          <div style="font-weight:600;">${i} Kas</div>
          <div style="font-size:0.68rem;">${isBlocked ? 'Kapalı' : 'Müsait'}</div>
        </div>
      `);
    }
    return `
      <div class="calendar-grid">
        <div class="cal-day-header">Pzt</div>
        <div class="cal-day-header">Sal</div>
        <div class="cal-day-header">Çar</div>
        <div class="cal-day-header">Per</div>
        <div class="cal-day-header">Cum</div>
        <div class="cal-day-header">Cmt</div>
        <div class="cal-day-header">Paz</div>
        ${days.join('')}
      </div>
    `;
  },

  renderWizardView() {
    if (!this.state.wizardData) this.initWizard(null);
    const d = this.state.wizardData;
    const step = this.state.wizardStep || 1;
    const stepStatuses = this.getWizardStepStatuses();

    const provincesMap = (this.constants && this.constants.TURKEY_PROVINCES_DISTRICTS) || {};
    const allProvinces = Object.keys(provincesMap);
    const provQuery = (this.state.provinceSearchQuery || '').trim().toLocaleLowerCase('tr-TR');
    const filteredProvinces = provQuery
      ? allProvinces.filter(p => p.toLocaleLowerCase('tr-TR').includes(provQuery))
      : allProvinces;

    const districtsForCity = d.city && provincesMap[d.city] ? provincesMap[d.city] : [];
    const distQuery = (this.state.districtSearchQuery || '').trim().toLocaleLowerCase('tr-TR');
    const filteredDistricts = distQuery
      ? districtsForCity.filter(dist => dist.toLocaleLowerCase('tr-TR').includes(distQuery))
      : districtsForCity;

    let stepContentHtml = '';

    if (step === 1) {
      stepContentHtml = `
        <h3 style="font-size:1.25rem;margin-bottom:14px;">Adım 1: Temel Bilgiler ve Mülk Tipi</h3>
        <div class="form-group" style="margin-bottom:14px;">
          <label>İlan Başlığı</label>
          <input type="text" id="wizTitleInput" class="form-control"
            placeholder="Örn: Kaş Yarımadası Sonsuzluk Havuzlu Taş Villa"
            value="${this.escapeHtml(d.title)}"
            oninput="app.updateWizardPreviewDom()" />
        </div>
        <div class="form-group" style="margin-bottom:18px;">
          <label>İlan Açıklaması</label>
          <textarea id="wizDescInput" rows="4" class="form-control"
            placeholder="Mülkünüzün mimari özelliklerini, manzarasını ve sunduğu deneyimi detaylıca anlatın..."
            oninput="app.updateWizardPreviewDom()">${this.escapeHtml(d.description)}</textarea>
        </div>
        <label style="font-size:0.84rem;color:var(--text-muted);display:block;margin-bottom:8px;">Mülk Kategorisi Seçin</label>
        <div class="amenity-grid">
          ${(this.constants.PROPERTY_TYPES || []).map(pt => `
            <div class="amenity-card-item ${d.propertyType === pt.key ? 'selected' : ''}"
              onclick="app.selectWizardPropertyType('${pt.key}')">
              <span style="font-size:1.35rem;">${pt.icon}</span>
              <div>
                <div style="font-weight:500;">${pt.label}</div>
                <div style="font-size:0.74rem;color:var(--text-muted);">${pt.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (step === 2) {
      stepContentHtml = `
        <h3 style="font-size:1.25rem;margin-bottom:14px;">Adım 2: 81 İl / Resmi İlçe Seçimi ve Misafir Kapasitesi</h3>
        <div class="form-grid" style="margin-bottom:14px;">
          <!-- 81 İl Seçici Popover -->
          <div class="form-group custom-popover-wrapper">
            <label>İl (Türkiye 81 İl)</label>
            <button type="button" class="custom-popover-trigger" onclick="app.toggleWizardPopover('province', event)">
              <span>${d.city ? this.escapeHtml(d.city) : 'İl Seçiniz...'}</span>
              <span>▾</span>
            </button>
            ${this.state.wizardPopoverOpen === 'province' ? `
              <div class="custom-popover-menu" onclick="event.stopPropagation()">
                <input type="text" class="form-control" style="margin-bottom:8px;"
                  placeholder="81 il içinde ara..."
                  value="${this.escapeHtml(this.state.provinceSearchQuery)}"
                  oninput="app.state.provinceSearchQuery = this.value; app.renderAll();" />
                ${filteredProvinces.map(prov => `
                  <button type="button" class="popover-option-item ${d.city === prov ? 'active' : ''}"
                    onclick="app.selectWizardProvince('${prov}')">
                    <span>${prov}</span>
                    <span style="font-size:0.75rem;color:var(--text-muted);">${(provincesMap[prov] || []).length} ilçe</span>
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Resmi İlçe Seçici Popover -->
          <div class="form-group custom-popover-wrapper">
            <label>İlçe</label>
            <button type="button" class="custom-popover-trigger" onclick="app.toggleWizardPopover('district', event)">
              <span>${d.district ? this.escapeHtml(d.district) : (d.city ? `${this.escapeHtml(d.city)} İlçesi Seçiniz...` : 'Önce İl Seçiniz')}</span>
              <span>▾</span>
            </button>
            ${this.state.wizardPopoverOpen === 'district' && d.city ? `
              <div class="custom-popover-menu" onclick="event.stopPropagation()">
                ${filteredDistricts.map(dist => `
                  <button type="button" class="popover-option-item ${d.district === dist ? 'active' : ''}"
                    onclick="app.selectWizardDistrict('${dist}')">
                    <span>${dist}</span>
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="form-grid" style="margin-bottom:16px;">
          <div class="form-group">
            <label>Mahalle / Semt / Bölge</label>
            <input type="text" id="wizNeighborhoodInput" class="form-control"
              placeholder="Örn: Çukurbağ Yarımadası / Kalkan"
              value="${this.escapeHtml(d.neighborhood)}"
              oninput="app.updateWizardPreviewDom()" />
          </div>
          <div class="form-group">
            <label>Açık Adres</label>
            <input type="text" id="wizAddressInput" class="form-control"
              placeholder="Cadde, sokak ve kapı numarası"
              value="${this.escapeHtml(d.address)}"
              oninput="app.updateWizardPreviewDom()" />
          </div>
        </div>

        <label style="font-size:0.84rem;color:var(--text-muted);display:block;margin-bottom:8px;">Mülk Kapasitesi (− / + Stepper)</label>
        <div class="form-grid">
          ${[
            { field: 'maxAdults', label: 'Maksimum Yetişkin Sayısı' },
            { field: 'maxChildren', label: 'Maksimum Çocuk Sayısı' },
            { field: 'bedrooms', label: 'Yatak Odası Sayısı' },
            { field: 'beds', label: 'Toplam Yatak Sayısı' },
            { field: 'bathrooms', label: 'Banyo Sayısı' }
          ].map(item => `
            <div class="stepper-row">
              <span style="font-size:0.88rem;">${item.label}</span>
              <div class="stepper-controls">
                <button type="button" class="stepper-btn" onclick="app.stepWizardCapacity('${item.field}', -1)">−</button>
                <span class="stepper-val">${d[item.field] || 0}</span>
                <button type="button" class="stepper-btn" onclick="app.stepWizardCapacity('${item.field}', 1)">+</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (step === 3) {
      stepContentHtml = `
        <h3 style="font-size:1.25rem;margin-bottom:6px;">Adım 3: Mülk Olanakları ve Donanımlar</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
          Misafirlerinize sunduğunuz tüm olanakları işaretleyin.
        </p>
        <div class="amenity-grid">
          ${(this.constants.AMENITY_OPTIONS || []).map(am => {
            const selected = (d.amenities || []).includes(am.key);
            return `
              <div class="amenity-card-item ${selected ? 'selected' : ''}"
                onclick="app.toggleWizardAmenity('${am.key}')">
                <span style="font-size:1.25rem;">${am.icon}</span>
                <span>${am.label}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (step === 4) {
      stepContentHtml = `
        <h3 style="font-size:1.25rem;margin-bottom:6px;">Adım 4: Fotoğraf Galerisi ve Kapak Görseli Seçimi</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
          Cihazınızdan birden fazla fotoğraf yükleyebilir veya doğrudan görsel URL'si ekleyebilirsiniz.
        </p>

        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px;">
          <label class="btn btn-primary" style="cursor:pointer;">
            📷 Cihazımdan Fotoğraf Seç / Yükle
            <input type="file" accept="image/*" multiple style="display:none;" onchange="app.onWizardPhotosSelected(this)" />
          </label>
        </div>

        <div class="form-grid" style="margin-bottom:12px;">
          <div class="form-group">
            <label>Veya Görsel URL Adresi Ekle</label>
            <input type="url" id="wizPhotoUrlInput" class="form-control" placeholder="https://images.unsplash.com/..." />
          </div>
          <div class="form-group">
            <label>Görsel Alt Yazısı (Opsiyonel)</label>
            <div style="display:flex;gap:8px;">
              <input type="text" id="wizPhotoCaptionInput" class="form-control" placeholder="Örn: Havuz & Teras Görünümü" />
              <button type="button" class="btn btn-outline" onclick="app.addWizardPhotoByUrl()">+ Ekle</button>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:14px;">
          ${(d.photos || []).map((p, idx) => `
            <div style="border:1px solid var(--border-color);border-radius:14px;overflow:hidden;background:var(--bg-elevated);">
              <div style="height:125px;position:relative;">
                <img src="${this.escapeHtml(p.url)}" alt="Görsel" style="width:100%;height:100%;object-fit:cover;" />
                ${p.isCover ? `
                  <span class="badge badge-success" style="position:absolute;top:8px;left:8px;">⭐ Kapak Görseli</span>
                ` : ''}
              </div>
              <div style="padding:10px;">
                <div style="font-size:0.8rem;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${this.escapeHtml(p.caption || `Görsel ${idx + 1}`)}
                </div>
                <div style="display:flex;gap:6px;">
                  ${!p.isCover ? `
                    <button type="button" class="btn btn-outline btn-sm" style="flex:1;" onclick="app.setWizardCoverPhoto(${idx})">
                      Kapak Yap
                    </button>
                  ` : ''}
                  <button type="button" class="btn btn-danger btn-sm" onclick="app.removeWizardPhoto(${idx})">
                    Sil
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (step === 5) {
      stepContentHtml = `
        <h3 style="font-size:1.25rem;margin-bottom:14px;">Adım 5: Fiyatlandırma, İndirim Kampanyası, Kurallar & Müsaitlik Takvimi</h3>

        <div class="form-grid" style="margin-bottom:14px;">
          <div class="form-group">
            <label>Gecelik Taban Fiyat (₺)</label>
            <input type="number" id="wizBasePriceInput" class="form-control" placeholder="Örn: 4500"
              value="${this.escapeHtml(d.basePrice)}" oninput="app.updateWizardPreviewDom()" />
          </div>
          <div class="form-group">
            <label>Temizlik Ücreti (₺)</label>
            <input type="number" id="wizCleaningFeeInput" class="form-control" placeholder="Örn: 600"
              value="${this.escapeHtml(d.cleaningFee)}" oninput="app.updateWizardPreviewDom()" />
          </div>
          <div class="form-group">
            <label>İndirimli Kampanyalı Fiyat (₺ - Opsiyonel)</label>
            <input type="number" id="wizDiscountedPriceInput" class="form-control" placeholder="Örn: 3800"
              value="${this.escapeHtml(d.discountedPrice)}" oninput="app.updateWizardPreviewDom()" />
          </div>
          <div class="form-group">
            <label>İndirim Kampanya Türü</label>
            <select id="wizDiscountNoteSelect" class="form-control" onchange="app.updateWizardPreviewDom()">
              <option value="">Kampanya Seçiniz (Opsiyonel)</option>
              ${(this.constants.DISCOUNT_CAMPAIGN_OPTIONS || []).map(opt => `
                <option value="${opt}" ${d.discountNote === opt ? 'selected' : ''}>${opt}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <label style="font-size:0.84rem;color:var(--text-muted);display:block;margin-bottom:8px;">İptal Politikası Seçin</label>
        <div class="amenity-grid" style="margin-bottom:18px;">
          ${(this.constants.CANCELLATION_POLICIES || []).map(cp => `
            <div class="amenity-card-item ${d.cancellationPolicy === cp.key ? 'selected' : ''}"
              onclick="app.selectWizardPolicy('${cp.key}')">
              <div>
                <div style="font-weight:500;">${cp.label}</div>
                <div style="font-size:0.74rem;color:var(--text-muted);">${cp.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="padding:14px;border-radius:14px;border:1px solid var(--border-color);background:var(--bg-elevated);margin-bottom:18px;">
          <strong style="font-size:0.9rem;display:block;margin-bottom:8px;">📅 Müsaitlik Takvimi — Tarih Kapatma / Açma</strong>
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">
            Takvimdeki günlere tıklayarak mülkünüzün bakımda veya kapalı olduğu tarihleri işaretleyebilirsiniz.
          </p>
          ${this.renderCalendarDaysHtml(d.blockedDates || [], 'app.toggleWizardBlockedDate')}
        </div>
      `;
    }

    return `
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 style="font-size:1.75rem;font-weight:600;">İLAN OLUŞTUR</h1>
            <p style="font-size:0.88rem;color:var(--text-muted);">
              5 adımlı mülk tanımlama, 81 il/ilçe seçimi, fotoğraf galerisi ve müsaitlik takvimi
            </p>
          </div>
          <button type="button" class="btn btn-outline" onclick="app.promptLeaveWizard()">
            ← Ev Sahibi Paneline Dön
          </button>
        </div>

        <div class="wizard-steps-bar">
          ${stepStatuses.map(s => `
            <button type="button" class="wizard-step-pill ${step === s.step ? 'active' : ''} ${s.ok ? 'done' : ''}"
              onclick="app.setWizardStep(${s.step})">
              <span>${s.title}</span>
              <span style="font-size:0.72rem;opacity:0.85;">${s.ok ? '✓ Tamamlandı' : 'Eksik Alan Var'}</span>
            </button>
          `).join('')}
        </div>

        <div class="wizard-layout-grid">
          <div class="card">
            ${stepContentHtml}

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:22px;padding-top:16px;border-top:1px solid var(--border-color);">
              ${step > 1 ? `
                <button type="button" class="btn btn-outline" onclick="app.setWizardStep(${step - 1})">
                  ← Önceki Adım
                </button>
              ` : `<div></div>`}

              ${step < 5 ? `
                <button type="button" class="btn btn-primary" onclick="app.setWizardStep(${step + 1})">
                  Sonraki Adım →
                </button>
              ` : `
                <button type="button" class="btn btn-primary" onclick="app.saveWizardListing()">
                  ✅ İlanı Kaydet ve Yayınla
                </button>
              `}
            </div>
          </div>

          <div class="wizard-preview-sticky" id="wizardLivePreviewContainer">
            ${this.renderWizardLivePreviewHtml()}
          </div>
        </div>
      </div>
    `;
  },

  async saveWizardListing() {
    this.syncWizardDomInputs();
    const d = this.state.wizardData;
    if (!d.title || !d.city || !d.district || !d.propertyType || !Number(d.basePrice)) {
      this.toast('Lütfen İlan Başlığı, Mülk Tipi, İl/İlçe ve Gecelik Fiyat alanlarını eksiksiz doldurunuz.', 'error');
      return;
    }

    const payload = {
      title: d.title,
      description: d.description || d.title,
      propertyType: d.propertyType,
      city: d.city,
      district: d.district,
      neighborhood: d.neighborhood,
      address: d.address || `${d.district}, ${d.city}`,
      basePrice: Number(d.basePrice),
      discountedPrice: d.discountedPrice ? Number(d.discountedPrice) : null,
      discountNote: d.discountNote || '',
      cleaningFee: Number(d.cleaningFee) || 0,
      maxAdults: Number(d.maxAdults) || 2,
      maxChildren: Number(d.maxChildren) || 0,
      bedrooms: Number(d.bedrooms) || 1,
      beds: Number(d.beds) || 1,
      bathrooms: Number(d.bathrooms) || 1,
      amenities: d.amenities || [],
      photos: d.photos && d.photos.length ? d.photos : [
        { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop&q=80', caption: 'Kapak Görseli', isCover: true }
      ],
      seasonalMultipliers: d.seasonalMultipliers || [],
      blockedDates: d.blockedDates || [],
      cancellationPolicy: d.cancellationPolicy || 'esnek'
    };

    if (d.id) {
      const res = await this.api(`/api/listings/${d.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      this.toast(res.message, 'success');
    } else {
      const res = await this.api('/api/listings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      this.toast(res.message, 'success');
    }

    await this.refreshAllData();
    this.state.view = 'host';
    this.renderAll();
  },

  async toggleDashboardBlockedDate(dateStr) {
    const list = this.state.hostListings.length ? this.state.hostListings : this.state.listings;
    const activeId = this.state.hostCalendarListingId || (list[0] && list[0].id);
    const target = list.find(l => Number(l.id) === Number(activeId));
    if (!target) return;

    const blocked = Array.isArray(target.blockedDates) ? [...target.blockedDates] : [];
    const idx = blocked.indexOf(dateStr);
    if (idx >= 0) blocked.splice(idx, 1);
    else blocked.push(dateStr);

    const res = await this.api(`/api/listings/${target.id}`, {
      method: 'PUT',
      body: JSON.stringify({ blockedDates: blocked })
    });
    this.toast(res.message, 'info');
    await this.refreshAllData();
    this.renderAll();
  },

  async deleteHostListing(listingId) {
    const res = await this.api(`/api/listings/${listingId}`, {
      method: 'DELETE'
    });
    this.toast(res.message, 'info');
    await this.refreshAllData();
    this.renderAll();
  },

  renderHostDashboardView() {
    const list = this.state.hostListings.length ? this.state.hostListings : this.state.listings;
    const selectedCalId = this.state.hostCalendarListingId || (list[0] && list[0].id);
    const calListing = list.find(l => Number(l.id) === Number(selectedCalId)) || list[0] || null;

    return `
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:14px;">
          <div>
            <h1 style="font-size:1.75rem;font-weight:600;">Ev Sahibi İlan Yönetimi & Müsaitlik Takvimi</h1>
            <p style="font-size:0.9rem;color:var(--text-muted);">
              Mülklerinizi oluşturun, düzenleyin ve müsaitlik takvimini yönetin
            </p>
          </div>
          <button class="btn btn-create-listing" onclick="app.openCreateWizard()">
            <span class="btn-create-plus">+</span>
            <span>İLAN OLUŞTUR</span>
          </button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px;margin-bottom:26px;">
          ${list.map(l => `
            <div class="card" style="padding:0;overflow:hidden;display:flex;flex-direction:column;">
              <div style="height:190px;position:relative;">
                <img src="${this.escapeHtml(l.coverPhoto)}" alt="${this.escapeHtml(l.title)}" style="width:100%;height:100%;object-fit:cover;" />
                <span class="badge ${l.status === 'active' ? 'badge-success' : 'badge-warning'}" style="position:absolute;top:12px;left:12px;">
                  ${l.status === 'active' ? '✓ YAYINDA (AKTİF)' : '⏳ MODERASYON ONAYI'}
                </span>
              </div>
              <div style="padding:18px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <div style="font-size:0.78rem;color:var(--brand-primary);font-weight:500;margin-bottom:4px;">
                    ${this.escapeHtml(l.categoryLabel)} • 📍 ${this.escapeHtml(l.city)} / ${this.escapeHtml(l.district)}
                  </div>
                  <h3 style="font-size:1.08rem;margin-bottom:6px;">${this.escapeHtml(l.title)}</h3>
                  <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;">
                    ${l.maxAdults} Yetişkin · ${l.bedrooms} Oda · ${l.beds} Yatak · ${(l.blockedDates || []).length} Kapalı Gün
                  </p>
                </div>
                <div>
                  <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px;">
                    <div>
                      <strong style="font-size:1.18rem;color:var(--brand-primary);">${this.formatMoney(l.discountedPrice || l.basePrice)}</strong>
                      <span style="font-size:0.78rem;color:var(--text-muted);">/ gece</span>
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn btn-outline btn-sm" style="flex:1;" onclick="app.openEditWizard(${l.id})">
                      ✏️ İlanı Düzenle
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="app.state.hostCalendarListingId=${l.id}; app.renderAll();">
                      📅 Takvim
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteHostListing(${l.id})">
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        ${calListing ? `
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
              <div>
                <h3 style="font-size:1.2rem;">📅 Hızlı Müsaitlik Takvimi Yönetimi: ${this.escapeHtml(calListing.title)}</h3>
                <p style="font-size:0.84rem;color:var(--text-muted);">
                  Takvimdeki günlere tıklayarak seçili mülkün tarihlerini anında kapatıp açabilirsiniz.
                </p>
              </div>
              <select class="form-control" style="max-width:320px;"
                onchange="app.state.hostCalendarListingId=Number(this.value); app.renderAll();">
                ${list.map(item => `
                  <option value="${item.id}" ${Number(item.id) === Number(calListing.id) ? 'selected' : ''}>
                    ${this.escapeHtml(item.title)}
                  </option>
                `).join('')}
              </select>
            </div>
            ${this.renderCalendarDaysHtml(calListing.blockedDates || [], 'app.toggleDashboardBlockedDate')}
          </div>
        ` : ''}
      </div>
    `;
  }
});

