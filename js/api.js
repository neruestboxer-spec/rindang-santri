// ============================================================
// SESI LOGIN (disimpan di browser pengguna)
// ============================================================
const Session = {
  token() {
    try { return localStorage.getItem('rs_token') || ''; } catch (e) { return ''; }
  },
  user() {
    try { return JSON.parse(localStorage.getItem('rs_user') || 'null'); } catch (e) { return null; }
  },
  save(token, user) {
    try {
      localStorage.setItem('rs_token', token);
      localStorage.setItem('rs_user', JSON.stringify(user));
    } catch (e) { /* mode privat: sesi hanya bertahan selama tab terbuka */ }
  },
  clear() {
    try {
      localStorage.removeItem('rs_token');
      localStorage.removeItem('rs_user');
    } catch (e) { /* abaikan */ }
  }
};

function isConfigured() {
  return typeof GAS_URL === 'string' && /^https:\/\/script\.google\.com\/.+\/exec$/.test(GAS_URL) && GAS_URL.indexOf('XXXX') === -1;
}

// ============================================================
// FETCH KE GOOGLE APPS SCRIPT
// Semua respons berbentuk { success, data, message, code? }
// ============================================================
const NET_ERROR = 'Tidak dapat terhubung ke server. Periksa koneksi internet, lalu coba lagi.';
const CONFIG_ERROR = 'Aplikasi belum terhubung ke backend. Isi GAS_URL di js/config.js.';

const api = {
  async get(action) {
    if (!isConfigured()) return { success: false, message: CONFIG_ERROR };
    try {
      const res = await fetch(`${GAS_URL}?action=${encodeURIComponent(action)}`);
      return await res.json();
    } catch (err) {
      return { success: false, message: NET_ERROR };
    }
  },

  async post(action, data = {}) {
    if (!isConfigured()) return { success: false, message: CONFIG_ERROR };
    let json;
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        // WAJIB text/plain agar tidak memicu preflight CORS yang ditolak GAS
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, token: Session.token(), data })
      });
      json = await res.json();
    } catch (err) {
      return { success: false, message: NET_ERROR };
    }
    if (json && json.code === 'UNAUTH') {
      Session.clear();
      if (typeof onSessionExpired === 'function') onSessionExpired(json.message);
    }
    return json;
  }
};
