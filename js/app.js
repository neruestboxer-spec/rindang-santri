// ============================================================
// STATE GLOBAL
// ============================================================
const state = {
  settings: { NAMA_LEMBAGA: 'Rindang Santri', SLOGAN: '', TAHUN_AJARAN: '', NO_REGISTRASI: '', MUDIR: '', LOGO_ID: '' },
  surah: [],
  navSeq: 0
};

const ROLE_LABEL = { admin: 'Administrator', ustad: 'Ustad Pengajar', donatur: 'Donatur' };

const MENU = {
  admin: [
    ['beranda', 'Beranda', 'home'],
    ['peringkat', 'Peringkat', 'trophy'],
    ['setoran', 'Setoran Hafalan', 'checkSquare'],
    ['santri', 'Data Santri', 'users'],
    ['donasi', 'Data Donasi', 'handHeart'],
    ['akun', 'Kelola Akun', 'shieldUser'],
    ['pengaturan', 'Pengaturan', 'sliders']
  ],
  ustad: [
    ['beranda', 'Beranda', 'home'],
    ['peringkat', 'Peringkat', 'trophy'],
    ['setoran', 'Setoran Hafalan', 'checkSquare'],
    ['santri', 'Santri Binaan', 'userSearch']
  ],
  donatur: [
    ['progres', 'Santri Binaan Saya', 'userSearch'],
    ['peringkat', 'Peringkat', 'trophy']
  ]
};

const ROUTES = {
  masuk:            { guest: true, fn: pageMasuk },
  peringkat:        { fn: pagePeringkat },
  beranda:          { roles: ['admin', 'ustad'], fn: pageBeranda },
  setoran:          { roles: ['admin', 'ustad'], fn: pageSetoran },
  'setoran/baru':   { roles: ['admin', 'ustad'], fn: pageSetoranForm, menu: 'setoran' },
  'setoran/ubah':   { roles: ['admin', 'ustad'], fn: pageSetoranForm, menu: 'setoran' },
  santri:           { roles: ['admin', 'ustad'], fn: pageSantri },
  'santri/detail':  { roles: ['admin', 'ustad', 'donatur'], fn: pageSantriDetail, menu: 'santri' },
  progres:          { roles: ['donatur'], fn: pageProgres },
  donasi:           { roles: ['admin'], fn: pageDonasi },
  akun:             { roles: ['admin'], fn: pageAkun },
  pengaturan:       { roles: ['admin'], fn: pagePengaturan }
};

// ============================================================
// PENGATURAN & DATA BERSAMA
// ============================================================
function logoHtml(size = 24) {
  return state.settings.LOGO_ID
    ? `<img src="${fotoUrl(state.settings.LOGO_ID, 160)}" alt="" referrerpolicy="no-referrer" onerror="this.replaceWith(document.createRange().createContextualFragment(icon('book', ${size})))">`
    : icon('book', size);
}

function applySettings(s) {
  if (!s) return;
  state.settings = Object.assign({}, state.settings, s);
  const nama = state.settings.NAMA_LEMBAGA || 'Rindang Santri';
  document.title = 'Rindang Santri — ' + nama;
  ['sbLogo', 'tbLogo'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = logoHtml(22); });
}

async function loadSettings() {
  const r = await api.get('pengaturanPublik');
  if (r.success) applySettings(r.data);
}

async function ensureSurah() {
  if (state.surah.length || !Session.user()) return state.surah;
  const r = await api.post('surahList');
  if (r.success) state.surah = r.data;
  return state.surah;
}

function homeFor(user) {
  if (!user) return 'peringkat';
  return user.role === 'donatur' ? 'progres' : 'beranda';
}

// Dipanggil api.js bila server menyatakan sesi habis
function onSessionExpired(message) {
  toast(message || 'Sesi berakhir. Silakan masuk kembali.', 'error', 'Sesi berakhir');
  go('#/masuk');
}

async function logout() {
  const ok = await confirmBox('Keluar dari aplikasi di perangkat ini?', { title: 'Keluar', okText: 'Keluar', danger: false });
  if (!ok) return;
  api.post('logout');
  Session.clear();
  state.surah = [];
  toast('Anda sudah keluar. Sampai jumpa kembali.');
  go('#/peringkat');
}

// ============================================================
// SHELL (sidebar, topbar)
// ============================================================
function renderShell(key, user) {
  const body = document.body;
  body.classList.remove('mode-guest', 'mode-app', 'mode-login', 'sb-open');
  body.classList.add(key === 'masuk' ? 'mode-login' : user ? 'mode-app' : 'mode-guest');

  const route = ROUTES[key] || {};
  const activeKey = route.menu || key;

  if (user) {
    document.getElementById('sbNav').innerHTML = (MENU[user.role] || []).map(([k, label, ic]) =>
      `<a href="#/${k}" class="${k === activeKey ? 'active' : ''}" ${k === activeKey ? 'aria-current="page"' : ''}>${icon(ic, 20)}<span>${label}</span></a>`).join('');
    document.getElementById('sbUser').innerHTML = `<div class="sb-user-card">
      <div class="sb-user-row">${avatar(user.nama, '', 40, 'round')}<div><strong>${esc(user.nama)}</strong><small>${ROLE_LABEL[user.role] || ''}</small></div></div>
      <div class="sb-user-foot"><span class="sb-role">${esc(user.role)}</span><button class="sb-logout" type="button" id="btnLogout">${icon('logout', 16)} Keluar</button></div>
    </div>`;
    document.getElementById('btnLogout').addEventListener('click', logout);
    document.getElementById('topRight').innerHTML = `<div class="top-user">${avatar(user.nama, '', 38, 'round')}<div class="txt"><strong>${esc(user.nama)}</strong><small>${ROLE_LABEL[user.role] || ''}</small></div></div>`;
  } else {
    document.getElementById('topRight').innerHTML = key === 'masuk' ? '' :
      `<a class="btn btn-ghost btn-sm" href="#/peringkat">${icon('trophy', 16)} Peringkat</a>
       <a class="btn btn-primary btn-sm" href="#/masuk">${icon('login', 16)} Masuk</a>`;
  }
}

function openSidebar() {
  document.body.classList.add('sb-open');
  document.getElementById('scrim').hidden = false;
}
function closeSidebar() {
  document.body.classList.remove('sb-open');
  document.getElementById('scrim').hidden = true;
}

// ============================================================
// ROUTER (hash)
// ============================================================
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  let key = parts[0] || '';
  let id = null;
  if (key === 'setoran' && parts[1] === 'baru') key = 'setoran/baru';
  else if (key === 'setoran' && parts[1] === 'ubah') { key = 'setoran/ubah'; id = parts[2] || null; }
  else if (key === 'santri' && parts[1]) { key = 'santri/detail'; id = parts[1]; }
  return { key, id, query };
}

function go(hash) {
  if (location.hash === hash) router();
  else location.hash = hash;
}

async function router() {
  const user = Session.user();
  const { key, id, query } = parseHash();
  const route = ROUTES[key];
  if (!route) return go('#/' + homeFor(user));
  if (route.guest && user) return go('#/' + homeFor(user));
  if (route.roles && !user) return go('#/masuk');
  if (route.roles && !route.roles.includes(user.role)) return go('#/' + homeFor(user));

  const seq = ++state.navSeq;
  renderShell(key, user);
  closeSidebar();
  window.scrollTo(0, 0);
  const ctx = { id, query, user, alive: () => seq === state.navSeq };
  try {
    await route.fn(ctx);
  } catch (err) {
    console.error(err);
    if (ctx.alive()) view(errorState('Terjadi kesalahan saat menampilkan halaman.'));
  }
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnMenu').innerHTML = icon('menu', 22);
  document.getElementById('btnMenu').addEventListener('click', openSidebar);
  document.getElementById('scrim').addEventListener('click', closeSidebar);
  applySettings({});

  if (!isConfigured()) {
    const b = document.getElementById('configBanner');
    b.hidden = false;
    b.innerHTML = `${icon('alert', 16)} <b>Aplikasi belum terhubung ke backend.</b> Buka <code>js/config.js</code> lalu isi <code>GAS_URL</code> dengan URL Web App Apps Script (berakhiran <code>/exec</code>).`;
  }

  window.addEventListener('hashchange', router);
  router();
  loadSettings();
});
