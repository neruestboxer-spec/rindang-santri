// ============================================================
// IKON (garis 24px, gaya lucide)
// ============================================================
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  trophy: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  checkSquare: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6 6 0 0 1 3.5 6"/>',
  userSearch: '<circle cx="10" cy="8" r="4"/><path d="M3 20a7 7 0 0 1 9-6.7"/><circle cx="17" cy="17" r="3"/><path d="m21 21-1.8-1.8"/>',
  handHeart: '<path d="M2 14h3l4 1.5h3.5a1.5 1.5 0 0 1 0 3H9"/><path d="M13 18l5.5-2.6a1.6 1.6 0 0 1 1.9 2.5L15 21H6.5L2 19.5"/><path d="M16 10.5c-1.6-1.1-4-2.7-4-4.8A2.2 2.2 0 0 1 16 4.5a2.2 2.2 0 0 1 4 1.2c0 2.1-2.4 3.7-4 4.8z"/>',
  shieldUser: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3z"/><circle cx="12" cy="10" r="2.5"/><path d="M8 16.5a4 4 0 0 1 8 0"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  plusCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  download: '<path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  book: '<path d="M2 5.5A1.5 1.5 0 0 1 3.5 4H9a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z"/><path d="M22 5.5A1.5 1.5 0 0 0 20.5 4H15a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.01"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  upload: '<path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
  arrowL: '<path d="M19 12H5m0 0 6-6m-6 6 6 6"/>',
  arrowR: '<path d="M5 12h14m0 0-6-6m6 6-6 6"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.2"/>',
  receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  grad: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
  flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
  quote: '<path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>'
};

function icon(name, size = 18, cls = '') {
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

// ============================================================
// FORMAT
// ============================================================
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n || 0).toLocaleString('id-ID');
const fmt1 = n => (n === null || n === undefined || n === '') ? '—' : Number(n).toLocaleString('id-ID', { maximumFractionDigits: 1 });
const rupiah = n => 'Rp ' + fmt(Math.round(Number(n) || 0));
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Tanggal hari ini menurut WITA (Asia/Makassar), format yyyy-mm-dd
function hariIni() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}
function bulanIni() { return hariIni().slice(0, 7); }
function tgl(s) {
  if (!s) return '—';
  const p = String(s).slice(0, 10).split('-').map(Number);
  if (p.length < 3 || !p[0]) return esc(s);
  return `${p[2]} ${BULAN[p[1] - 1]} ${p[0]}`;
}
function jam(iso) { return iso && String(iso).length > 15 ? String(iso).slice(11, 16) + ' WITA' : ''; }
function selisihHari(s) {
  if (!s) return null;
  const a = Date.UTC(...String(s).slice(0, 10).split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v)));
  const b = Date.UTC(...hariIni().split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v)));
  return Math.round((b - a) / 86400000);
}
function relTgl(s) {
  const d = selisihHari(s);
  if (d === null) return '—';
  if (d === 0) return 'Hari ini';
  if (d === 1) return 'Kemarin';
  if (d > 1 && d < 7) return `${d} hari lalu`;
  return tgl(s);
}
function bulanLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  return `${BULAN[m - 1]} '${String(y).slice(2)}`;
}
function tanggalPanjang() {
  const now = new Date(Date.now() + 8 * 3600 * 1000);
  const masehi = `${HARI[now.getUTCDay()]}, ${now.getUTCDate()} ${BULAN_PANJANG[now.getUTCMonth()]} ${now.getUTCFullYear()}`;
  let hijri = '';
  try {
    hijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar' }).format(new Date());
    if (!/H$/.test(hijri)) hijri += ' H';
  } catch (e) { hijri = ''; }
  return hijri ? `${masehi} · ${hijri}` : masehi;
}

const PREDIKAT = [[90, 'Mumtaz'], [80, 'Jayyid Jiddan'], [70, 'Jayyid'], [0, 'Maqbul']];
function predikat(skor) {
  const s = Number(skor) || 0;
  for (const [min, label] of PREDIKAT) if (s >= min) return label;
  return 'Maqbul';
}
const PREDIKAT_CLASS = { 'Mumtaz': 'b-mumtaz', 'Jayyid Jiddan': 'b-jj', 'Jayyid': 'b-jayyid', 'Maqbul': 'b-maqbul' };

// ============================================================
// KOMPONEN HTML
// ============================================================
function pill(text, cls = '', dot = false) {
  return `<span class="pill ${cls}">${dot ? '<span class="dot"></span>' : ''}${esc(text)}</span>`;
}
function badgePredikat(p) {
  if (!p) return '<span class="faint">—</span>';
  return `<span class="pill ${PREDIKAT_CLASS[p] || ''}">${esc(p)}</span>`;
}
function scoreCell(skor, p) {
  return `<span class="score-cell"><b>${esc(skor)}</b>${badgePredikat(p)}</span>`;
}
function hasilPill(lulus) {
  return lulus
    ? `<span class="pill p-ok">${icon('checkCircle', 14)} Lulus</span>`
    : `<span class="pill p-ulang">${icon('rotate', 14)} Perlu Diulang</span>`;
}
function statusSantriPill(s) {
  if (s === 'Aktif') return pill('Aktif', 'p-ok', true);
  if (s === 'Alumni') return `<span class="pill p-gold">${icon('award', 14)} Khatam / Alumni</span>`;
  return pill(s || 'Nonaktif', 'p-muted', true);
}
function rolePill(role) {
  const map = { admin: ['Admin', 'p-info'], ustad: ['Ustad', ''], donatur: ['Donatur', 'p-donatur'] };
  const [t, c] = map[role] || [role, 'p-muted'];
  return pill(t, c);
}
function bar(pct, cls = '') {
  const v = Math.max(0, Math.min(100, Number(pct) || 0));
  return `<div class="bar ${cls}" role="progressbar" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100"><i style="width:${v}%"></i></div>`;
}
function initials(n) {
  const parts = String(n || '?').replace(/[^\p{L}\s]/gu, ' ').trim().split(/\s+/).filter(w => !/^(h|hj|ir|dr|ust|ustad|ustadz|ustadzah|m)$/i.test(w));
  const w = parts.length ? parts : String(n || '?').trim().split(/\s+/);
  return ((w[0] || '?')[0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase();
}
function fotoUrl(id, size = 240) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${size}`;
}
function avatar(nama, fotoId, size = 40, cls = '') {
  const img = fotoId ? `<img src="${fotoUrl(fotoId, size * 2)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : '';
  return `<span class="av ${cls}" style="--s:${size}px" aria-hidden="true">${esc(initials(nama))}${img}</span>`;
}
function person(nama, sub, fotoId, size = 40) {
  return `<div class="person">${avatar(nama, fotoId, size)}<div class="txt"><strong>${esc(nama)}</strong>${sub ? `<small>${sub}</small>` : ''}</div></div>`;
}
function arab(text, cls = '') {
  return text ? `<span class="ar ${cls}" lang="ar" dir="rtl">${esc(text)}</span>` : '';
}
function surahCell(no, nama, namaArab, sub) {
  return `<div class="surah-cell"><div class="top"><span>${no ? esc(no) + '. ' : ''}${esc(nama)}</span>${arab(namaArab)}</div>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
}
function ring(pct, size = 96, stroke = 9, label = '') {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, Number(pct) || 0));
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#E3F4E8" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#1E7A4C" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(c * v / 100).toFixed(1)} ${c.toFixed(1)}"/>
    </svg>
    <div class="ring-label">${fmt1(v)}%${label ? `<small>${esc(label)}</small>` : ''}</div>
  </div>`;
}
function statCard({ label, value, unit = '', foot = '', iconName = 'book', tone = '', valueTone = '' }) {
  return `<div class="card stat">
    <div class="stat-top"><span class="stat-label">${esc(label)}</span><span class="stat-icon ${tone}">${icon(iconName, 22)}</span></div>
    <div class="stat-value ${valueTone}">${value}${unit ? `<small>${esc(unit)}</small>` : ''}</div>
    ${foot ? `<div class="stat-foot ${valueTone}">${foot}</div>` : ''}
  </div>`;
}
function emptyState(text, iconName = 'book') {
  return `<div class="empty">${icon(iconName, 36)}<p>${esc(text)}</p></div>`;
}
function loadingState(text = 'Memuat data…') {
  return `<div class="page-loading"><span class="spinner" aria-hidden="true"></span><span>${esc(text)}</span></div>`;
}
function errorState(message) {
  return `<div class="card"><div class="empty">${icon('alert', 36)}<p>${esc(message || 'Terjadi kesalahan.')}</p>
    <button class="btn btn-ghost" type="button" onclick="router()">${icon('refresh', 16)} Coba lagi</button></div></div>`;
}

// ============================================================
// TOAST
// ============================================================
function toast(message, type = 'ok', title) {
  const root = document.getElementById('toastRoot');
  const el = document.createElement('div');
  el.className = 'toast ' + (type === 'error' ? 'error' : '');
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  const head = title || (type === 'error' ? 'Gagal' : 'Berhasil');
  el.innerHTML = `${icon(type === 'error' ? 'alert' : 'checkCircle', 20)}<div><strong>${esc(head)}</strong><span>${esc(message)}</span></div>`;
  root.appendChild(el);
  setTimeout(() => el.remove(), type === 'error' ? 6000 : 3800);
}

// Tampilkan pesan dari respons API; kembalikan true jika sukses
function ensureOk(res) {
  if (res && res.success) return true;
  if (res && res.code === 'UNAUTH') return false; // sudah ditangani onSessionExpired
  toast((res && res.message) || 'Terjadi kesalahan.', 'error');
  return false;
}

// ============================================================
// MODAL
// ============================================================
function openModal({ title, subtitle = '', body, wide = false }) {
  const root = document.getElementById('modalRoot');
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="mTitle">
    <div class="modal-head"><div><h2 id="mTitle">${esc(title)}</h2>${subtitle ? `<p class="muted">${subtitle}</p>` : ''}</div>
      <button class="icon-btn" type="button" data-close aria-label="Tutup">${icon('x', 20)}</button></div>
    <div class="modal-body">${body}</div></div>`;
  const prevFocus = document.activeElement;
  const close = () => {
    wrap.remove();
    document.removeEventListener('keydown', onKey);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  wrap.addEventListener('mousedown', e => { if (e.target === wrap) close(); });
  wrap.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', onKey);
  root.appendChild(wrap);
  const first = wrap.querySelector('.modal-body input, .modal-body select, .modal-body textarea, .modal-body button');
  if (first) first.focus();
  return { el: wrap, close };
}

function confirmBox(message, { title = 'Konfirmasi', okText = 'Ya, lanjutkan', danger = true } = {}) {
  return new Promise(resolve => {
    let done = false;
    const m = openModal({
      title,
      body: `<p class="muted" style="line-height:22px">${esc(message)}</p>
        <div class="form-actions"><button class="btn btn-ghost" type="button" data-no>Batal</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="button" data-yes>${esc(okText)}</button></div>`
    });
    const finish = v => { if (!done) { done = true; m.close(); resolve(v); } };
    m.el.querySelector('[data-yes]').addEventListener('click', () => finish(true));
    m.el.querySelector('[data-no]').addEventListener('click', () => finish(false));
    m.el.querySelector('[data-close]').addEventListener('click', () => finish(false));
    const obs = new MutationObserver(() => { if (!document.body.contains(m.el)) { obs.disconnect(); finish(false); } });
    obs.observe(document.getElementById('modalRoot'), { childList: true });
  });
}

// ============================================================
// TOMBOL SIBUK
// ============================================================
function setBusy(btn, busy, text = 'Menyimpan…') {
  if (!btn) return;
  if (busy) {
    btn.dataset.label = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px"></span> ${esc(text)}`;
  } else {
    btn.disabled = false;
    if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
  }
}

// ============================================================
// PAGINASI
// ============================================================
function pagerHtml(total, page, per = PER_PAGE) {
  const pages = Math.max(1, Math.ceil(total / per));
  const from = total ? (page - 1) * per + 1 : 0;
  const to = Math.min(total, page * per);
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return `<span>Menampilkan <b>${from}–${to}</b> dari <b>${fmt(total)}</b></span>
    <div class="pager">
      <button type="button" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Sebelumnya">${icon('chevL', 16)}</button>
      ${nums.map(n => n === '…' ? '<span class="gap">…</span>' : `<button type="button" data-page="${n}" class="${n === page ? 'on' : ''}">${n}</button>`).join('')}
      <button type="button" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Berikutnya">${icon('chevR', 16)}</button>
    </div>`;
}
function bindPager(container, onPage) {
  container.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => onPage(Number(b.dataset.page))));
}

// ============================================================
// UNDUHAN & BERKAS
// ============================================================
function downloadBlob(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function base64ToBlob(b64, mime) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
function downloadCSV(name, header, rows) {
  // Pemisah titik koma agar langsung terbaca rapi di Excel berbahasa Indonesia
  const safe = v => {
    let s = String(v ?? '');
    if (/^[=+\-@]/.test(s)) s = "'" + s; // cegah rumus berbahaya saat dibuka di Excel
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header, ...rows].map(r => r.map(safe).join(';'));
  downloadBlob(name, new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
}

// Baca berkas pilihan pengguna → { data (base64), mime }. Gambar diperkecil & dikompres.
function readFilePayload(file, { maxDim = 640, quality = 0.82, allowPdf = false } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const isImg = /^image\/(jpeg|png|webp)$/.test(file.type);
    const isPdf = file.type === 'application/pdf';
    if (!isImg && !(allowPdf && isPdf)) return reject(new Error(allowPdf ? 'Pilih gambar (JPG/PNG/WEBP) atau PDF.' : 'Pilih gambar JPG, PNG, atau WEBP.'));
    if (isPdf) {
      if (file.size > 2 * 1024 * 1024) return reject(new Error('Ukuran PDF maksimal 2 MB.'));
      const fr = new FileReader();
      fr.onload = () => resolve({ data: String(fr.result).split(',')[1], mime: 'application/pdf', preview: '' });
      fr.onerror = () => reject(new Error('Gagal membaca berkas.'));
      fr.readAsDataURL(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      const dataUrl = cv.toDataURL('image/jpeg', quality);
      resolve({ data: dataUrl.split(',')[1], mime: 'image/jpeg', preview: dataUrl });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gambar tidak dapat dibaca.')); };
    img.src = url;
  });
}

// ============================================================
// GRAFIK BATANG (satu seri, dengan tooltip & tabel aksesibel)
// ============================================================
function niceMax(v) {
  if (v <= 4) return 4;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const steps = [1, 2, 2.5, 5, 10];
  for (const s of steps) if (s * mag >= v) return s * mag;
  return 10 * mag;
}
function barChart(data, { valueKey = 'total', labelFn = d => d.label, tipFn = d => '' } = {}) {
  const max = niceMax(Math.max(1, ...data.map(d => d[valueKey])));
  const ticks = [max, max / 2, 0];
  const last = data.length - 1;
  return `<div class="chart" role="img" aria-label="Grafik batang">
    <div class="chart-grid">${ticks.map(t => `<div><span>${fmt(t)}</span></div>`).join('')}</div>
    <div class="chart-cols">
      ${data.map((d, i) => {
        const h = (d[valueKey] / max) * 100;
        return `<div class="chart-col">
          <div class="chart-plot">
            <button type="button" class="chart-bar ${i === last ? 'now' : ''}" style="height:${h}%" aria-label="${esc(labelFn(d))}: ${d[valueKey]}">
              <span class="chart-val">${fmt(d[valueKey])}</span>
              <span class="chart-tip">${tipFn(d)}</span>
            </button>
          </div>
          <div class="chart-x ${i === last ? 'now' : ''}">${esc(labelFn(d))}</div>
        </div>`;
      }).join('')}
    </div>
  </div>
  <table class="sr-only"><caption>Data grafik</caption><tr><th>Periode</th><th>Nilai</th></tr>
    ${data.map(d => `<tr><td>${esc(labelFn(d))}</td><td>${d[valueKey]}</td></tr>`).join('')}</table>`;
}

// ============================================================
// UTIL DOM
// ============================================================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function view(html) {
  document.getElementById('view').innerHTML = html;
}
function setCrumb(items) {
  const el = document.getElementById('crumb');
  if (!el) return;
  el.innerHTML = items.map(t => `<span>${esc(t)}</span>`).join(`<span class="sep">${icon('chevR', 14)}</span>`);
}
function debounce(fn, ms = 200) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
function normalize(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’`]/g, '');
}
