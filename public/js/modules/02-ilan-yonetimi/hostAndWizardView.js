// MODÜL 2: İLAN SİHİRBAZI, 81 İL/İLÇE, CANLI ÖNİZLEME VE MÜSAİTLİK TAKVİMİ (4. Kişi - Ali Önder Biçer)
Object.assign(app, {
  initWizard(existingListing = null) {
    this.state.wizardStep = 1;
    // Yeni ilanda tüm seçenekler boş başlar, ev sahibi doldurur
    this.state.wizardData = existingListing ? { ...existingListing } : {
      id: null,
      title: '',
      description: '',
      propertyType: '',
      city: '',
      district: '',
      neighborhood: '',
      address: '',
      basePrice: '',
      cleaningFee: '',
      maxAdults: 0,
      maxChildren: 0,
      bedrooms: 0,
      beds: 0,
      bathrooms: 0,
      cancellationPolicy: 'esnek',
      amenities: [],
      photos: [],
      seasonalMultipliers: [],
      blockedDates: []
    };
  },

  syncWizardDomInputs() {
    const d = this.state.wizardData;
    if (!d) return;
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : null; };

    if (getVal('wizTitle') !== null) d.title = getVal('wizTitle').trim();
    if (getVal('wizDescription') !== null) d.description = getVal('wizDescription').trim();
    if (getVal('wizAddress') !== null) d.address = getVal('wizAddress').trim();
    if (getVal('wizBasePrice') !== null) d.basePrice = getVal('wizBasePrice');
    if (getVal('wizCleaningFee') !== null) d.cleaningFee = getVal('wizCleaningFee');
  },

  updateWizardPreviewDom() {
    this.syncWizardDomInputs();
    const container = document.getElementById('wizardLivePreviewContainer');
    if (container) {
      container.innerHTML = this.renderWizardLivePreviewHtml();
    }
  },

  renderWizardLivePreviewHtml() {
    const d = this.state.wizardData || {};
    const coverPhoto = (d.photos && d.photos.length > 0)
      ? (d.photos.find(p => p.isCover) || d.photos[0]).url
      : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';

    const step1Ok = Boolean(d.title && d.propertyType);
    const step2Ok = Boolean(d.city && d.district && d.maxAdults > 0);
    const step3Ok = Boolean(d.amenities && d.amenities.length > 0);
    const step4Ok = Boolean(d.photos && d.photos.length > 0);
    const step5Ok = Boolean(d.basePrice && Number(d.basePrice) > 0);

    return `
      <div class="card wizard-sticky-preview">
        <h4 style="font-size:1.1rem;font-weight:600;margin-bottom:12px;">Canlı İlan Önizlemesi</h4>
        <div style="width:100%;height:180px;border-radius:14px;overflow:hidden;margin-bottom:12px;background:#e2e8f0;">
          <img src="${coverPhoto}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div style="font-size:1rem;font-weight:600;color:var(--text-color);">${d.title || 'İlan Başlığı Belirtilmedi'}</div>
        <div style="font-size:0.85rem;color:var(--text-muted);margin:4px 0 10px;">
          📍 ${d.city || 'İl Seçilmedi'} ${d.district ? `/ ${d.district}` : ''}
        </div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--primary-color);">
          ${d.basePrice ? `₺${Number(d.basePrice).toLocaleString('tr-TR')}` : '₺0'} <span style="font-size:0.8rem;font-weight:400;color:var(--text-muted);">/ gece</span>
        </div>

        <hr style="margin:16px 0;border:none;border-top:1px solid var(--border-color);" />

        <div style="font-size:0.85rem;font-weight:600;margin-bottom:8px;">Adım Kontrolü</div>
        <div class="step-check-list" style="font-size:0.8rem;display:flex;flex-direction:column;gap:6px;">
          <div style="display:flex;justify-content:space-between;">
            <span>1. Mülk Türü & Başlık:</span>
            <span style="color:${step1Ok ? 'var(--success-color)' : '#f59e0b'};">${step1Ok ? '✓ Tamam' : '✕ Eksik'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span>2. Konum & Kapasite:</span>
            <span style="color:${step2Ok ? 'var(--success-color)' : '#f59e0b'};">${step2Ok ? '✓ Tamam' : '✕ Eksik'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span>3. Olanaklar:</span>
            <span style="color:${step3Ok ? 'var(--success-color)' : '#f59e0b'};">${step3Ok ? '✓ Tamam' : '✕ Eksik'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span>4. Fotoğraflar (${d.photos ? d.photos.length : 0} adet):</span>
            <span style="color:${step4Ok ? 'var(--success-color)' : '#f59e0b'};">${step4Ok ? '✓ Tamam' : '✕ Eksik'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span>5. Fiyatlandırma:</span>
            <span style="color:${step5Ok ? 'var(--success-color)' : '#f59e0b'};">${step5Ok ? '✓ Tamam' : '✕ Eksik'}</span>
          </div>
        </div>
      </div>
    `;
  },

  onWizardPhotosSelected(inputEl) {
    const files = inputEl && inputEl.files ? Array.from(inputEl.files) : [];
    if (files.length === 0) return;

    files.forEach((file) => {
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
          const compressed = canvas.toDataURL('image/jpeg', 0.85);

          const photos = this.state.wizardData.photos;
          photos.push({
            url: compressed,
            caption: file.name,
            isCover: photos.length === 0
          });
          this.updateWizardPreviewDom();
          this.renderAll();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  toggleWizardBlockedDate(dateStr) {
    const arr = this.state.wizardData.blockedDates;
    const idx = arr.indexOf(dateStr);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(dateStr);
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
    this.state.wizardData.photos.splice(idx, 1);
    if (this.state.wizardData.photos.length > 0) {
      this.state.wizardData.photos[0].isCover = true;
    }
    this.renderAll();
  }
});

