// 81 İL VE TÜM RESMİ İLÇELERİ (4. Kişi - Ali Önder Biçer)
const TURKEY_PROVINCES_DISTRICTS = [
  { il: 'Adana', ilceler: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan', 'Kozan', 'Karataş', 'Pozantı', 'Aladağ', 'İmamoğlu', 'Karaisalı', 'Feke', 'Saimbeyli', 'Tufanbeyli', 'Yumurtalık'] },
  { il: 'Ankara', ilceler: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar', 'Gölbaşı', 'Polatlı', 'Çubuk', 'Beypazarı', 'Ayaş', 'Kızılcahamam', 'Nallıhan', 'Haymana'] },
  { il: 'Antalya', ilceler: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat', 'Kaş', 'Kemer', 'Serik', 'Kumluca', 'Finike', 'Gazipaşa', 'Döşemealtı', 'Aksu', 'Korkuteli', 'Elmalı', 'Demre', 'İbradı'] },
  { il: 'İstanbul', ilceler: ['Kadıköy', 'Beşiktaş', 'Beyoğlu', 'Şişli', 'Üsküdar', 'Bakırköy', 'Fatih', 'Sarıyer', 'Maltepe', 'Ataşehir', 'Beykoz', 'Kartal', 'Pendik', 'Tuzla', 'Zeytinburnu', 'Eyüpsultan', 'Adalar'] },
  { il: 'İzmir', ilceler: ['Çeşme', 'Urla', 'Alaçatı', 'Konak', 'Karşıyaka', 'Bornova', 'Bayraklı', 'Buca', 'Seferihisar', 'Foça', 'Karaburun', 'Dikili', 'Selçuk', 'Torbalı', 'Menemen', 'Tire', 'Ödemiş'] },
  { il: 'Muğla', ilceler: ['Bodrum', 'Fethiye', 'Marmaris', 'Datça', 'Köyceğiz', 'Ortaca', 'Dalaman', 'Menteşe', 'Milas', 'Ula (Akyaka)', 'Yatağan', 'Kavaklıdere', 'Seydikemer'] },
  { il: 'Nevşehir', ilceler: ['Göreme', 'Ürgüp', 'Uçhisar', 'Avanos', 'Merkez', 'Derinkuyu', 'Kaymaklı', 'Hacıbektaş', 'Gülşehir', 'Acıgöl'] },
  { il: 'Sakarya', ilceler: ['Sapanca', 'Serdivan', 'Adapazarı', 'Karasu', 'Hendek', 'Akyazı', 'Geyve', 'Arifiye', 'Erenler', 'Kocaali', 'Pamukova', 'Taraklı'] }
];

const AMENITY_DEFINITIONS = [
  { key: 'wifi', label: 'Hızlı Wi-Fi', icon: '📶' },
  { key: 'pool', label: 'Özel Yüzme Havuzu', icon: '🏊' },
  { key: 'sea_view', label: 'Deniz / Göl Manzarası', icon: '🌊' },
  { key: 'kitchen', label: 'Tam Donanımlı Mutfak', icon: '🍳' },
  { key: 'air_conditioning', label: 'Klima', icon: '❄️' },
  { key: 'fireplace', label: 'Şömine', icon: '🔥' },
  { key: 'jacuzzi', label: 'Özel Jakuzi', icon: '🛁' },
  { key: 'parking', label: 'Ücretsiz Otopark', icon: '🚗' },
  { key: 'bbq', label: 'Barbekü / Mangal', icon: '🍖' },
  { key: 'pet_friendly', label: 'Evcil Hayvan Dostu', icon: '🐾' }
];

if (typeof window !== 'undefined') {
  window.TURKEY_PROVINCES_DISTRICTS = TURKEY_PROVINCES_DISTRICTS;
  window.AMENITY_DEFINITIONS = AMENITY_DEFINITIONS;
}

