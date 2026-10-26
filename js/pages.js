// ============================================================
// HALAMAN-HALAMAN APLIKASI
// Setiap halaman menerima ctx = { id, query, user, alive() }.
// alive() bernilai false bila pengguna sudah pindah halaman saat data masih dimuat.
// ============================================================

function gagalMuat(res) {
  if (res && res.code === 'UNAUTH') return true;
  view(errorState(res && res.message));
  return true;
}

async function unduhRapor(santriId, btn) {
  setBusy(btn, true, 'Menyiapkan PDF…');
  const r = await api.post('raporPdf', { santriId });
  setBusy(btn, false);
  if (!ensureOk(r)) return;
  downloadBlob(r.data.fileName, base64ToBlob(r.data.base64, 'application/pdf'));
  toast('Laporan PDF berhasil dibuat dan diunduh.');
}

async function lihatBukti(id, btn) {
  setBusy(btn, true, 'Membuka…');
  const r = await api.post('donasiBukti', { id });
  setBusy(btn, false);
  if (!ensureOk(r)) return;
  const { fileName, mime, base64 } = r.data;
  if (/^image\//.test(mime)) {
    openModal({ title: 'Bukti Transfer', subtitle: esc(fileName), body: `<img src="data:${esc(mime)};base64,${base64}" alt="Bukti transfer" style="border-radius:12px;width:100%">` });
  } else {
    downloadBlob(fileName, base64ToBlob(base64, mime));
  }
}

const KUTIPAN = `<section class="card quote-card">
  <span class="kicker">Kutipan adab penghafal</span>
  <span class="ar" lang="ar" dir="rtl">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</span>
  <p>"Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya."</p>
  <small>HR. Bukhari</small>
</section>`;

// ============================================================
// PERINGKAT (publik)
// ============================================================
function podiumCard(r) {
  const size = r.rank === 1 ? 104 : 84;
  const tag = r.rank === 1 ? `${icon('crown', 14)} Peringkat 1` : `${icon('trophy', 14)} Peringkat ${r.rank}`;
  const sisa = r.totalSurah - r.jumlahSurah;
  return `<article class="card podium-card p${r.rank}">
    <span class="rank-tag">${tag}</span>
    <div class="podium-photo">${avatar(r.nama, r.fotoId, size, 'round')}<span class="num-badge">${r.rank}</span></div>
    <h3>${esc(r.nama)}</h3>
    <div class="who">${icon('user', 14)} ${esc(r.ustad)}</div>
    <div>${badgePredikat(r.rataPredikat)}</div>
    <div class="podium-box">
      <div class="top"><span>Total capaian</span><b>${r.jumlahSurah} / ${r.totalSurah} Surah</b></div>
      ${bar(r.progres, 'strong')}
      <div class="bot"><span>${sisa > 0 ? `Tersisa ${sisa} surah` : 'Khatam Juz 30'}</span><b>${fmt1(r.progres)}% selesai</b></div>
    </div>
  </article>`;
}

async function pagePeringkat(ctx) {
  setCrumb(['Lembaga', 'Peringkat Hafalan']);
  view(loadingState());
  const res = await api.get('ranking');
  if (!ctx.alive()) return;
  if (!res.success) return gagalMuat(res);

  const d = res.data;
  if (d.pengaturan) applySettings(d.pengaturan);
  const S = state.settings;
  const rows = d.rows;
  const ustads = [...new Set(rows.map(r => r.ustad))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'id'));
  const top = rows.filter(r => r.jumlahSurah > 0).slice(0, 3);
  const isAdmin = ctx.user && ctx.user.role === 'admin';

  view(`
    <section class="card hero">
      <div>
        <span class="chip">${icon('checkCircle', 14)} ${S.TAHUN_AJARAN ? 'Tahun Ajaran ' + esc(S.TAHUN_AJARAN) + ' · ' : ''}Juz 30 (Surah 78–114)</span>
        <h1>Peringkat Hafalan Santri</h1>
        <p class="lead">Pemantauan capaian hafalan surah pendek santri secara transparan, diperbarui setiap kali ustad mencatat setoran.</p>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><span class="badge-ic">${icon('grad', 24)}</span><div><span>Santri aktif</span><strong>${fmt(d.totalSantri)}<small>Santri</small></strong></div></div>
        <div class="hero-stat"><span class="badge-ic">${icon('book', 24)}</span><div><span>Surah Juz 30</span><strong>${fmt(d.totalSurah)}<small>Surah</small></strong></div></div>
      </div>
    </section>

    ${top.length ? `
      <div class="section-title"><h2>${icon('award', 22)} Tiga Terbaik Juz 30</h2><span class="muted small">Berdasarkan jumlah surah yang lulus</span></div>
      <div class="podium">${top.map(podiumCard).join('')}</div>` : ''}

    <section class="card filter-bar mt-24">
      <div class="input-icon">${icon('search', 18)}<input class="input" id="rkQ" type="search" placeholder="Cari nama santri…" aria-label="Cari nama santri"></div>
      <select class="select" id="rkUstad" aria-label="Filter ustad pengajar">
        <option value="">Semua ustad pengajar</option>
        ${ustads.map(u => `<option value="${esc(u)}">${esc(u)}</option>`).join('')}
      </select>
      <button class="btn btn-text" type="button" id="rkReset">${icon('refresh', 16)} Reset filter</button>
    </section>

    <section class="card table-card mt-16">
      <div class="table-wrap"><table class="table">
        <thead><tr><th class="center">Peringkat</th><th>Nama santri</th><th>Ustad pengajar</th><th>Surah terakhir</th><th>Total hafalan</th><th>Progres</th></tr></thead>
        <tbody id="rkBody"></tbody>
      </table></div>
      <div class="table-foot" id="rkFoot"></div>
    </section>

    <p class="note mt-16">${icon('info', 18)} Data hafalan diperbarui setelah setoran dinilai oleh ustad pengajar. Halaman ini dapat diakses publik dan hanya menampilkan nama, foto, dan capaian hafalan.</p>
  `);

  let page = 1;
  const draw = () => {
    const q = normalize($('#rkQ').value);
    const u = $('#rkUstad').value;
    const list = rows.filter(r => normalize(r.nama).includes(q) && (!u || r.ustad === u));
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (page > pages) page = pages;
    const slice = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    $('#rkBody').innerHTML = slice.length ? slice.map(r => {
      const nama = isAdmin ? `<a href="#/santri/${encodeURIComponent(r.id)}">${esc(r.nama)}</a>` : esc(r.nama);
      return `<tr>
        <td class="center"><span class="rank-dot ${r.rank <= 3 && r.jumlahSurah > 0 ? 'r' + r.rank : ''}">${r.rank}</span></td>
        <td><div class="person">${avatar(r.nama, r.fotoId, 40)}<div class="txt"><strong>${nama}</strong></div></div></td>
        <td>${esc(r.ustad)}</td>
        <td>${r.terakhir ? surahCell('', r.terakhir.surahNama, r.terakhir.namaArab, relTgl(r.terakhir.tanggal)) : '<span class="faint">Belum ada setoran</span>'}</td>
        <td class="num"><b>${r.jumlahSurah}</b> / ${r.totalSurah} <span class="faint">Surah</span></td>
        <td><div class="progress-cell"><div class="top"><span>${fmt1(r.progres)}%</span><b>${r.jumlahSurah} surah</b></div>${bar(r.progres)}</div></td>
      </tr>`;
    }).join('') : `<tr><td colspan="6">${emptyState(rows.length ? 'Tidak ada santri yang cocok dengan pencarian.' : 'Belum ada santri aktif.', 'users')}</td></tr>`;
    const foot = $('#rkFoot');
    foot.innerHTML = pagerHtml(list.length, page);
    bindPager(foot, p => { page = p; draw(); });
  };
  $('#rkQ').addEventListener('input', debounce(() => { page = 1; draw(); }));
  $('#rkUstad').addEventListener('change', () => { page = 1; draw(); });
  $('#rkReset').addEventListener('click', () => { $('#rkQ').value = ''; $('#rkUstad').value = ''; page = 1; draw(); });
  draw();
}

// ============================================================
// MASUK
// ============================================================
function pageMasuk() {
  const S = state.settings;
  view(`
    <div class="login-wrap">
      <div class="login-card">
        <aside class="login-side">
          <div class="brand"><span class="logo">${logoHtml(30)}</span><div><small>Sistem Informasi Tahfidz</small><strong>Rindang Santri</strong></div></div>
          <h2>${esc(S.NAMA_LEMBAGA || 'Rindang Santri')}</h2>
          ${S.SLOGAN ? `<p class="slogan">${esc(S.SLOGAN)}</p>` : ''}
          <div class="login-feats">
            <div class="login-feat">${icon('book', 22)}<div><strong>Pencatatan terstruktur Juz 30</strong><span>Setoran mingguan dengan skor dan catatan ustad</span></div></div>
            <div class="login-feat">${icon('handHeart', 22)}<div><strong>Transparansi progres donatur</strong><span>Donatur memantau perkembangan santri binaannya</span></div></div>
            <div class="login-feat">${icon('file', 22)}<div><strong>Laporan berkala</strong><span>Rapor PDF berisi capaian dan catatan ustad</span></div></div>
          </div>
          <div class="foot">© ${new Date().getFullYear()} ${esc(S.NAMA_LEMBAGA || 'Rindang Santri')}</div>
        </aside>
        <div class="login-main">
          <a class="back" href="#/peringkat">${icon('arrowL', 16)} Kembali ke peringkat publik</a>
          <form class="card login-form" id="loginForm" novalidate>
            <div>
              <h1>Masuk ke Rindang Santri</h1>
              <p class="muted mt-8">Gunakan akun yang diberikan oleh admin lembaga.</p>
            </div>
            <div class="field">
              <label for="lgUser">Username</label>
              <div class="input-icon">${icon('user', 18)}<input class="input" id="lgUser" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Masukkan username Anda" required></div>
            </div>
            <div class="field">
              <label for="lgPass">Password</label>
              <div class="input-icon has-toggle">${icon('lock', 18)}<input class="input" id="lgPass" type="password" autocomplete="current-password" placeholder="Masukkan password" required>
                <button class="icon-btn toggle-pw" type="button" id="lgEye" aria-label="Tampilkan password">${icon('eye', 18)}</button></div>
            </div>
            <p class="note">${icon('info', 18)} Peran akun (admin, ustad, atau donatur) dikenali otomatis saat masuk.</p>
            <button class="btn btn-primary btn-block" type="submit" id="lgBtn">Masuk ke akun ${icon('arrowR', 18)}</button>
            <p class="login-help">Lupa password atau belum punya akun?<br><b>Hubungi admin lembaga.</b></p>
          </form>
        </div>
      </div>
    </div>`);

  const pass = $('#lgPass');
  $('#lgEye').addEventListener('click', e => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    e.currentTarget.innerHTML = icon(show ? 'eyeOff' : 'eye', 18);
    e.currentTarget.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password');
  });
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = $('#lgUser').value.trim();
    const password = pass.value;
    if (!username || !password) return toast('Username dan password wajib diisi.', 'error');
    const btn = $('#lgBtn');
    setBusy(btn, true, 'Memeriksa…');
    const res = await api.post('login', { username, password });
    setBusy(btn, false);
    if (!ensureOk(res)) return;
    Session.save(res.data.token, res.data.user);
    state.surah = [];
    toast('Selamat datang kembali.', 'ok', `Assalamu'alaikum, ${res.data.user.nama}`);
    go('#/' + homeFor(res.data.user));
  });
  $('#lgUser').focus();
}

// ============================================================
// BERANDA (admin & ustad)
// ============================================================
async function pageBeranda(ctx) {
  setCrumb(['Lembaga', 'Beranda']);
  view(loadingState());
  const res = await api.post('dashboard');
  if (!ctx.alive()) return;
  if (!res.success) return gagalMuat(res);

  const d = res.data;
  const u = ctx.user;
  const S = state.settings;
  const isAdmin = u.role === 'admin';
  const pctSetor = d.totalSantri ? Math.round((d.santriSetorPekan / d.totalSantri) * 100) : 0;
  const delta = d.rataPekan !== null && d.rataPekanLalu !== null ? Math.round((d.rataPekan - d.rataPekanLalu) * 10) / 10 : null;
  const g = d.grafik;
  const total6 = g.reduce((s, x) => s + x.total, 0);
  const lulus6 = g.reduce((s, x) => s + x.lulus, 0);

  const belum = d.belumSetor;
  const belumHtml = belum.length ? belum.slice(0, 6).map(b => `
    <div class="list-item">
      ${avatar(b.nama, b.fotoId, 38)}
      <div class="grow"><strong>${esc(b.nama)}</strong>
        <small class="${b.terakhir && selisihHari(b.terakhir) > 7 ? 'red' : ''}">${b.terakhir ? 'Terakhir setor: ' + relTgl(b.terakhir) : 'Belum pernah setor'}${b.target ? ' · Target: ' + esc(b.target) : ''}</small></div>
      <a class="btn btn-primary btn-sm" href="#/setoran/baru?santri=${encodeURIComponent(b.id)}">Catat</a>
    </div>`).join('') + (belum.length > 6 ? `<p class="small muted center">dan ${belum.length - 6} santri lainnya</p>` : '')
    : emptyState('Alhamdulillah, semua santri sudah setor pekan ini.', 'checkCircle');

  view(`
    <section class="page-head greet">
      <div>
        ${S.TAHUN_AJARAN ? `<span class="chip">${icon('calendar', 14)} Tahun Ajaran ${esc(S.TAHUN_AJARAN)}</span>` : ''}
        <h1>Assalamu'alaikum, ${esc(u.nama)}</h1>
        <p class="date">${icon('calendar', 16)} ${esc(tanggalPanjang())}</p>
      </div>
      <a class="btn btn-primary" href="#/setoran/baru">${icon('plusCircle', 18)} Catat Setoran Baru</a>
    </section>

    <div class="grid grid-4">
      ${statCard({
        label: isAdmin ? 'Santri aktif' : 'Santri binaan', value: fmt(d.totalSantri), unit: 'Santri', iconName: 'users',
        foot: isAdmin ? `${icon('handHeart', 16)} Donasi bulan ini <b>${rupiah(d.donasiBulanIni)}</b>` : `${fmt(d.totalSantriLembaga)} santri aktif di lembaga`
      })}
      ${statCard({
        label: 'Setoran pekan ini', value: fmt(d.setoranPekan), unit: 'Setoran', iconName: 'checkCircle',
        foot: `<div style="width:100%"><div class="row-gap" style="justify-content:space-between;margin-bottom:6px"><span>${d.santriSetorPekan} dari ${d.totalSantri} santri sudah setor</span><b style="color:var(--primary)">${pctSetor}%</b></div>${bar(pctSetor, 'strong')}</div>`
      })}
      ${statCard({
        label: 'Rata-rata nilai pekan ini', value: d.rataPekan === null ? '—' : fmt1(d.rataPekan), unit: '/100', iconName: 'award', tone: 'gold',
        foot: d.rataPekan === null ? 'Belum ada setoran pekan ini' : `${badgePredikat(predikat(d.rataPekan))}${delta !== null ? `<span>${delta >= 0 ? '+' : ''}${fmt1(delta)} dari pekan lalu</span>` : ''}`
      })}
      ${statCard({
        label: 'Santri perlu perhatian', value: fmt(belum.length), unit: 'Santri', iconName: 'alert', tone: 'red', valueTone: belum.length ? 'red' : '',
        foot: belum.length ? `${icon('alert', 16)} Belum setor dalam 7 hari terakhir` : 'Semua santri aktif sudah setor'
      })}
    </div>

    <div class="grid grid-main mt-24">
      <div class="stack">
        <section class="card">
          <div class="card-head"><div><h2>Perkembangan Setoran Bulanan</h2><p class="muted">Jumlah setoran hafalan ${isAdmin ? 'seluruh santri' : 'santri binaan'} dalam 6 bulan terakhir</p></div><span class="chip">6 bulan terakhir</span></div>
          ${total6 ? barChart(g, {
            labelFn: x => bulanLabel(x.bulan),
            tipFn: x => `<b>${x.total}</b> setoran · ${x.lulus} lulus`
          }) : emptyState('Belum ada setoran dalam 6 bulan terakhir.', 'book')}
          <div class="grid grid-3 mt-16" style="gap:12px">
            <div class="mini-stat"><span>Total setoran</span><strong>${fmt(total6)} setoran</strong></div>
            <div class="mini-stat"><span>Tingkat kelulusan</span><strong class="green">${total6 ? fmt1((lulus6 / total6) * 100) + '%' : '—'}</strong></div>
            <div class="mini-stat"><span>Rata-rata per bulan</span><strong>${fmt1(total6 / 6)} setoran</strong></div>
          </div>
        </section>

        <section class="card table-card">
          <div class="card-head" style="padding:24px 24px 0">
            <div><h2>Setoran Hafalan Terkini</h2><p class="muted">Catatan setoran yang baru saja dinilai</p></div>
            <a class="btn btn-ghost btn-sm" href="#/setoran">Lihat semua ${icon('arrowR', 16)}</a>
          </div>
          ${d.terkini.length ? `<div class="table-wrap"><table class="table">
            <thead><tr><th>Santri</th><th>Surah</th><th>Waktu setor</th><th>Nilai & hasil</th></tr></thead>
            <tbody>${d.terkini.map(x => `<tr>
              <td>${person(x.santriNama, 'NIS ' + esc(x.nis), x.fotoId, 36)}</td>
              <td>${surahCell(x.surahNomor, x.surahNama, x.namaArab, x.ayat)}</td>
              <td>${relTgl(x.tanggal)}<small class="faint" style="display:block">${esc(x.ustad)}</small></td>
              <td>${scoreCell(x.skor, x.predikat)}<div class="mt-8">${hasilPill(x.lulus)}</div></td></tr>`).join('')}</tbody></table></div>`
            : `<div style="padding:0 24px 24px">${emptyState('Belum ada setoran yang dicatat.', 'book')}</div>`}
        </section>
      </div>

      <aside class="stack">
        <section class="card">
          <div class="card-head"><div><h3>Belum Setor Pekan Ini</h3><p class="muted small">Perlu dikonfirmasi sebelum evaluasi mingguan.</p></div>${belum.length ? `<span class="pill p-ulang">${belum.length} santri</span>` : ''}</div>
          <div class="list">${belumHtml}</div>
        </section>
        <section class="card">
          <div class="card-head"><div><h3>5 Besar ${isAdmin ? 'Santri' : 'Santri Binaan'}</h3><p class="muted small">Progres hafalan Juz 30 tertinggi</p></div>${icon('award', 22)}</div>
          <div class="list">${d.teratas.length ? d.teratas.map((t, i) => `
            <a class="top-item" href="#/santri/${encodeURIComponent(t.id)}" style="color:inherit;text-decoration:none">
              <span class="rank-num ${i === 0 ? 'r1' : ''}">${i + 1}</span>
              <div class="grow"><div class="name-row"><strong>${esc(t.nama)}</strong><span>${t.jumlahSurah} / ${t.totalSurah} surah</span></div>${bar(t.progres, i === 0 ? 'strong' : '')}</div>
              <span class="pts">${t.rataSkor === null ? '—' : fmt1(t.rataSkor)}</span>
            </a>`).join('') : emptyState('Belum ada data.', 'users')}</div>
        </section>
        ${KUTIPAN}
      </aside>
    </div>
  `);
}

// ============================================================
// SETORAN HAFALAN — daftar
// ============================================================
async function pageSetoran(ctx) {
  setCrumb(['Lembaga', 'Setoran Hafalan']);
  view(loadingState());
  const [res] = await Promise.all([api.post('setoranList'), ensureSurah()]);
  if (!ctx.alive()) return;
  if (!res.success) return gagalMuat(res);

  const all = res.data;
  const isAdmin = ctx.user.role === 'admin';
  const bulan = bulanIni();
  const ini = all.filter(x => x.tanggal.slice(0, 7) === bulan);
  const rataIni = ini.length ? ini.reduce((s, x) => s + x.skor, 0) / ini.length : null;
  const ulangIni = ini.filter(x => !x.lulus).length;
  const ustads = [...new Set(all.map(x => x.ustad))].sort((a, b) => a.localeCompare(b, 'id'));
  const surahDipakai = [...new Set(all.map(x => x.surahNomor))].sort((a, b) => a - b);
  const surahNama = {};
  all.forEach(x => { surahNama[x.surahNomor] = x.surahNama; });

  view(`
    <section class="page-head">
      <div><span class="eyebrow">Modul tahfidz Juz 30</span><h1>Setoran Hafalan Santri</h1>
        <p class="lead">Pencatatan dan riwayat setoran surah Juz 30 ${isAdmin ? 'seluruh santri' : 'santri binaan Anda'}.</p></div>
      <div class="row-gap">
        <button class="btn btn-ghost" type="button" id="stCsv">${icon('download', 18)} Ekspor CSV</button>
        <a class="btn btn-primary" href="#/setoran/baru">${icon('plusCircle', 18)} Catat Setoran Baru</a>
      </div>
    </section>

    <div class="grid grid-3">
      ${statCard({ label: 'Total setoran bulan ini', value: fmt(ini.length), unit: 'Setoran', iconName: 'book', foot: `${BULAN_PANJANG[Number(bulan.slice(5)) - 1]} ${bulan.slice(0, 4)}` })}
      ${statCard({ label: 'Rata-rata nilai bulan ini', value: rataIni === null ? '—' : fmt1(rataIni), unit: '/100', iconName: 'award', tone: 'gold', foot: rataIni === null ? 'Belum ada setoran' : badgePredikat(predikat(rataIni)) })}
      ${statCard({ label: 'Perlu diulang bulan ini', value: fmt(ulangIni), unit: 'Setoran', iconName: 'rotate', tone: 'red', foot: ulangIni ? `<span class="pill p-ulang">Prioritas</span> Perlu bimbingan muraja'ah` : 'Tidak ada setoran yang perlu diulang' })}
    </div>

    <section class="card filter-bar mt-24">
      <div class="input-icon">${icon('search', 18)}<input class="input" id="fq" type="search" placeholder="Cari nama santri atau NIS…" aria-label="Cari"></div>
      ${isAdmin ? `<select class="select" id="fUstad" aria-label="Filter ustad"><option value="">Semua ustad</option>${ustads.map(u => `<option>${esc(u)}</option>`).join('')}</select>` : ''}
      <select class="select" id="fSurah" aria-label="Filter surah"><option value="">Semua surah</option>${surahDipakai.map(n => `<option value="${n}">${n}. ${esc(surahNama[n])}</option>`).join('')}</select>
      <select class="select" id="fStatus" aria-label="Filter hasil"><option value="">Semua hasil</option><option value="1">Lulus</option><option value="0">Perlu diulang</option></select>
      <input class="input" id="fBulan" type="month" aria-label="Filter bulan" value="${esc(ctx.query.bulan || '')}">
      <button class="btn btn-text" type="button" id="fReset">${icon('refresh', 16)} Reset</button>
    </section>

    <section class="card table-card mt-16">
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Tanggal</th><th>Santri</th><th>Surah Juz 30</th><th>Nilai & predikat</th><th>Hasil</th><th>Catatan ustad</th>${isAdmin ? '<th>Pencatat</th>' : ''}<th class="right">Aksi</th></tr></thead>
        <tbody id="stBody"></tbody>
      </table></div>
      <div class="table-foot" id="stFoot"></div>
    </section>
  `);

  let page = 1;
  const filtered = () => {
    const q = normalize($('#fq').value);
    const us = isAdmin ? $('#fUstad').value : '';
    const sr = $('#fSurah').value;
    const stv = $('#fStatus').value;
    const bl = $('#fBulan').value;
    return all.filter(x =>
      (!q || normalize(x.santriNama).includes(q) || normalize(x.nis).includes(q)) &&
      (!us || x.ustad === us) &&
      (!sr || String(x.surahNomor) === sr) &&
      (stv === '' || String(x.lulus ? 1 : 0) === stv) &&
      (!bl || x.tanggal.slice(0, 7) === bl));
  };
  const draw = () => {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (page > pages) page = pages;
    const slice = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const cols = isAdmin ? 8 : 7;
    $('#stBody').innerHTML = slice.length ? slice.map(x => `<tr>
      <td><b>${tgl(x.tanggal)}</b><small class="faint" style="display:block">${jam(x.dibuat)}</small></td>
      <td>${person(x.santriNama, 'NIS ' + esc(x.nis), x.fotoId, 36)}</td>
      <td>${surahCell(x.surahNomor, x.surahNama, x.namaArab, x.ayat)}</td>
      <td>${scoreCell(x.skor, x.predikat)}</td>
      <td>${hasilPill(x.lulus)}</td>
      <td class="clip" title="${esc(x.catatan)}">${esc(x.catatan) || '—'}</td>
      ${isAdmin ? `<td>${esc(x.ustad)}</td>` : ''}
      <td><div class="actions">
        ${x.bisaUbah ? `<a class="icon-btn" href="#/setoran/ubah/${encodeURIComponent(x.id)}" title="Ubah setoran" aria-label="Ubah setoran">${icon('edit')}</a>` : ''}
        ${isAdmin ? `<button class="icon-btn danger" type="button" data-del="${esc(x.id)}" title="Hapus setoran" aria-label="Hapus setoran">${icon('trash')}</button>` : ''}
      </div></td></tr>`).join('')
      : `<tr><td colspan="${cols}">${emptyState(all.length ? 'Tidak ada setoran yang cocok dengan filter.' : 'Belum ada setoran. Mulai dengan "Catat Setoran Baru".', 'book')}</td></tr>`;
    const foot = $('#stFoot');
    foot.innerHTML = pagerHtml(list.length, page);
    bindPager(foot, p => { page = p; draw(); });
    $$('[data-del]', $('#stBody')).forEach(b => b.addEventListener('click', async () => {
      const x = all.find(s => s.id === b.dataset.del);
      const yakin = await confirmBox(`Hapus setoran ${x.surahNama} milik ${x.santriNama} tanggal ${tgl(x.tanggal)}? Tindakan ini tidak bisa dibatalkan.`, { title: 'Hapus setoran?', okText: 'Hapus' });
      if (!yakin) return;
      setBusy(b, true, '');
      const r = await api.post('setoranDelete', { id: x.id });
      if (!ensureOk(r)) return setBusy(b, false);
      toast(r.message);
      router();
    }));
  };
  ['#fq'].forEach(s => $(s).addEventListener('input', debounce(() => { page = 1; draw(); })));
  ['#fSurah', '#fStatus', '#fBulan'].concat(isAdmin ? ['#fUstad'] : []).forEach(s => $(s).addEventListener('change', () => { page = 1; draw(); }));
  $('#fReset').addEventListener('click', () => {
    ['#fq', '#fSurah', '#fStatus', '#fBulan'].concat(isAdmin ? ['#fUstad'] : []).forEach(s => { $(s).value = ''; });
    page = 1; draw();
  });
  $('#stCsv').addEventListener('click', () => {
    const list = filtered();
    if (!list.length) return toast('Tidak ada data untuk diekspor.', 'error');
    downloadCSV(`setoran-hafalan-${hariIni()}.csv`,
      ['Tanggal', 'NIS', 'Nama Santri', 'No. Surah', 'Surah', 'Cakupan Ayat', 'Skor', 'Predikat', 'Hasil', 'Ustad', 'Catatan'],
      list.map(x => [x.tanggal, x.nis, x.santriNama, x.surahNomor, x.surahNama, x.ayat, x.skor, x.predikat, x.lulus ? 'Lulus' : 'Perlu diulang', x.ustad, x.catatan]));
  });
  draw();
}

// ============================================================
// SETORAN HAFALAN — formulir catat/ubah
// ============================================================
const CATATAN_CEPAT = ['Fasih dan tartil', 'Perhatikan ghunnah', 'Cermat dalam waqaf', 'Perbaiki makhraj huruf', 'Jaga panjang mad', "Perlu muraja'ah ulang"];

async function pageSetoranForm(ctx) {
  const editId = ctx.id || '';
  setCrumb(['Setoran Hafalan', editId ? 'Ubah Setoran' : 'Catat Setoran Baru']);
  view(loadingState());
  const [sRes, lRes] = await Promise.all([api.post('santriList'), editId ? api.post('setoranList') : Promise.resolve(null), ensureSurah()]);
  if (!ctx.alive()) return;
  if (!sRes.success) return gagalMuat(sRes);

  let edit = null;
  if (editId) {
    if (!lRes.success) return gagalMuat(lRes);
    edit = lRes.data.find(x => x.id === editId);
    if (!edit) return view(errorState('Setoran tidak ditemukan.'));
    if (!edit.bisaUbah) return view(errorState('Anda tidak dapat mengubah setoran ini.'));
  }

  const isAdmin = ctx.user.role === 'admin';
  const pilihan = sRes.data.filter(s => s.status === 'Aktif' || (edit && s.id === edit.santriId));
  if (!pilihan.length) {
    return view(`<div class="card">${emptyState('Belum ada santri aktif yang bisa dicatat setorannya.', 'users')}
      ${isAdmin ? `<div class="center" style="text-align:center"><a class="btn btn-primary" href="#/santri">${icon('plus', 18)} Tambah santri</a></div>` : ''}</div>`);
  }
  const surahList = state.surah.filter(s => s.aktif || (edit && s.nomor === edit.surahNomor)).sort((a, b) => a.nomor - b.nomor);
  if (!surahList.length) return view(errorState('Belum ada surah aktif. Admin dapat menambahkannya di Pengaturan.'));

  const awalSantri = edit ? edit.santriId : (pilihan.find(s => s.id === ctx.query.santri) || pilihan[0]).id;
  const penuh = !edit || edit.ayat === 'Surah penuh';

  view(`
    <div class="page-head">
      <a class="btn btn-text" href="#/setoran">${icon('arrowL', 18)} Kembali ke daftar setoran</a>
    </div>
    <div class="grid grid-form">
      <form class="card" id="fSetoran" novalidate>
        <div class="card-head"><div>
          <span class="eyebrow">Formulir halaqah tahfidz</span>
          <h1>${edit ? 'Ubah Setoran Hafalan' : 'Catat Setoran Hafalan'}</h1>
          <p class="muted mt-8">Isi setoran surah Juz 30 beserta nilai kelancaran, status kelulusan, dan catatan evaluasi.</p>
        </div></div>
        <div class="stack" style="gap:22px">
          <div class="field">
            <label for="fSantri">Santri binaan <span class="req">*</span></label>
            <select class="select" id="fSantri" ${edit ? 'disabled' : ''}>
              ${pilihan.map(s => `<option value="${esc(s.id)}" ${s.id === awalSantri ? 'selected' : ''}>${esc(s.nama)} — NIS ${esc(s.nis)}${isAdmin ? ' · ' + esc(s.ustad) : ''}</option>`).join('')}
            </select>
            <span class="hint">${icon('info', 14)} ${isAdmin ? 'Menampilkan seluruh santri aktif.' : 'Hanya menampilkan santri aktif yang Anda ajar.'}</span>
          </div>
          <div class="form-grid">
            <div class="field">
              <label for="fSurah">Surah (Juz 30) <span class="req">*</span></label>
              <select class="select" id="fSurah">
                ${surahList.map(s => `<option value="${s.nomor}" ${edit && edit.surahNomor === s.nomor ? 'selected' : ''}>${s.nomor}. ${esc(s.nama)}${s.namaArab ? ' (' + esc(s.namaArab) + ')' : ''} — ${s.jumlahAyat} ayat</option>`).join('')}
              </select>
              <span class="hint" id="surahHint"></span>
            </div>
            <div class="field">
              <label for="fTanggal">Tanggal setoran <span class="req">*</span></label>
              <input class="input" type="date" id="fTanggal" max="${hariIni()}" value="${edit ? esc(edit.tanggal) : hariIni()}" required>
            </div>
          </div>
          <div class="field">
            <span class="label">Cakupan ayat</span>
            <div class="segmented light" id="segAyat" role="group" aria-label="Cakupan ayat">
              <button type="button" data-v="penuh" aria-pressed="${penuh}">1 surah penuh</button>
              <button type="button" data-v="sebagian" aria-pressed="${!penuh}">Ayat tertentu</button>
            </div>
            <input class="input" id="fAyat" maxlength="40" placeholder="Contoh: Ayat 1–20" value="${edit && !penuh ? esc(edit.ayat) : ''}" ${penuh ? 'hidden' : ''}>
          </div>
          <div class="score-box">
            <div class="row-gap" style="justify-content:space-between">
              <div><strong>Skor kelancaran & tajwid <span class="req">*</span></strong><p class="muted small">Geser slider atau ketik angka langsung (0–100).</p></div>
              <span id="predChip"></span>
            </div>
            <div class="score-row">
              <label class="score-input"><input id="fSkor" type="number" min="0" max="100" step="1" inputmode="numeric" aria-label="Skor" value="${edit ? edit.skor : ''}" placeholder="—"><span>/100</span></label>
              <div class="range">
                <input id="fRange" type="range" min="0" max="100" step="1" value="${edit ? edit.skor : 0}" aria-label="Skor (slider)">
                <div class="range-labels"><span style="left:0">0</span><span style="left:70%">70</span><span style="left:80%">80</span><span style="left:90%">90</span><span style="left:100%">100</span></div>
              </div>
            </div>
            <p class="small muted mt-16">Mumtaz 90–100 · Jayyid Jiddan 80–89 · Jayyid 70–79 · Maqbul di bawah 70</p>
          </div>
          <div class="field">
            <span class="label">Status hasil penilaian <span class="req">*</span></span>
            <div class="segmented" id="segLulus" role="group" aria-label="Status hasil">
              <button type="button" data-v="1" aria-pressed="${edit ? edit.lulus : false}">${icon('checkCircle', 16)} Lulus (Mutqin)</button>
              <button type="button" data-v="0" aria-pressed="${edit ? !edit.lulus : false}">${icon('rotate', 16)} Perlu diulang (Muraja'ah)</button>
            </div>
            <span class="hint">Surah yang ditandai lulus dihitung ke capaian hafalan dan peringkat.</span>
          </div>
          <div class="field">
            <label for="fCatatan">Catatan & evaluasi tajwid <span class="faint" id="cnt">0/500</span></label>
            <textarea class="textarea" id="fCatatan" maxlength="500" placeholder="Contoh: makhraj sudah fasih, perhatikan panjang mad pada ayat 5.">${edit ? esc(edit.catatan) : ''}</textarea>
            <div class="quick-chips"><span class="small faint">Rekomendasi cepat:</span>${CATATAN_CEPAT.map(c => `<button type="button" data-chip="${esc(c)}">+ ${esc(c)}</button>`).join('')}</div>
          </div>
        </div>
        <div class="form-actions">
          <a class="btn btn-text" href="#/setoran">Batal</a>
          <button class="btn btn-primary" type="submit" id="btnSimpan">${icon('checkCircle', 18)} ${edit ? 'Simpan Perubahan' : 'Simpan Setoran Hafalan'}</button>
        </div>
      </form>
      <aside class="stack" id="sidePanel">${loadingState('Memuat profil santri…')}</aside>
    </div>`);

  const f = {
    santri: $('#fSantri'), surah: $('#fSurah'), tanggal: $('#fTanggal'), ayat: $('#fAyat'),
    skor: $('#fSkor'), range: $('#fRange'), catatan: $('#fCatatan')
  };
  let ayatMode = penuh ? 'penuh' : 'sebagian';
  let lulus = edit ? edit.lulus : null;
  let touchedLulus = !!edit;
  let touchedSurah = !!edit;
  let detail = null;
  let sideSeq = 0;

  const setLulus = v => {
    lulus = v;
    $$('#segLulus button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === (v ? '1' : '0'))));
  };
  const setSkor = (raw, fromRange) => {
    if (raw === '' || raw === null) {
      $('#predChip').innerHTML = '';
      return;
    }
    let v = Math.round(Number(raw));
    if (!isFinite(v)) return;
    v = Math.max(0, Math.min(100, v));
    if (fromRange) f.skor.value = v; else f.range.value = v;
    $('#predChip').innerHTML = badgePredikat(predikat(v));
    if (!touchedLulus) setLulus(v >= 70);
  };
  const updateCount = () => { $('#cnt').textContent = `${f.catatan.value.length}/500`; };
  const updateSurahHint = () => {
    const s = state.surah.find(x => x.nomor === Number(f.surah.value));
    let hint = s ? `${s.jumlahAyat} ayat` : '';
    const p = detail && detail.peta.find(x => x.nomor === Number(f.surah.value));
    if (p && p.status === 'lulus') hint += " · sudah lulus sebelumnya, tercatat sebagai muraja'ah";
    else if (p && p.nomor === (detail.peta.find(x => x.status !== 'lulus') || {}).nomor) hint += ' · target berikutnya';
    $('#surahHint').innerHTML = hint ? `${icon('flag', 14)} ${esc(hint)}` : '';
  };

  const renderSide = () => {
    const panel = $('#sidePanel');
    if (!detail) return;
    const { santri: s, rank, target, peta, setoran } = detail;
    const tiga = setoran.slice(0, 3);
    const catatanLama = setoran.find(x => x.catatan);
    panel.innerHTML = `
      <section class="card">
        <div class="person">${avatar(s.nama, s.fotoId, 60)}<div class="txt">
          ${rank ? `<span class="pill p-gold" style="margin-bottom:4px">${icon('trophy', 12)} Peringkat #${rank}</span>` : ''}
          <strong style="font-size:17px;line-height:22px">${esc(s.nama)}</strong><small>NIS ${esc(s.nis)}${s.halaqah ? ' · ' + esc(s.halaqah) : ''}</small></div></div>
        <div class="row-gap mt-16" style="flex-wrap:nowrap;gap:18px">
          ${ring(s.progres, 92, 9, 'Tuntas')}
          <div><span class="stat-label">Capaian Juz 30</span>
            <div style="font-size:24px;line-height:32px;font-weight:700">${s.jumlahSurah} <span class="muted" style="font-size:14px;font-weight:500">dari ${s.totalSurah} surah</span></div>
            <p class="small" style="color:var(--primary)">${icon('flag', 14)} ${target ? 'Target berikutnya: ' + esc(target) : 'Khatam Juz 30'}</p></div>
        </div>
        <div class="mt-16">
          <div class="row-gap" style="justify-content:space-between"><span class="small muted">Peta ketuntasan ${peta.length} surah</span><b class="small">${s.jumlahSurah}/${s.totalSurah} mutqin</b></div>
          <div class="mini-peta mt-8">${peta.map(p => `<i class="${p.status}" title="${esc(p.nomor + '. ' + p.nama)}"></i>`).join('')}</div>
        </div>
      </section>
      <section class="card">
        <div class="card-head" style="margin-bottom:12px"><h3>${icon('rotate', 18)} 3 Setoran Terakhir</h3></div>
        <div class="list">${tiga.length ? tiga.map(x => `
          <div class="list-item"><span class="rank-num">${x.surahNomor}</span>
            <div class="grow"><strong>${esc(x.surahNama)}</strong><small>${tgl(x.tanggal)} · ${esc(x.ustad)}</small></div>
            ${badgePredikat(x.predikat)}</div>`).join('') : emptyState('Belum ada setoran.', 'book')}</div>
      </section>
      ${catatanLama ? `<p class="note warn">${icon('quote', 18)}<span><b>Catatan ustad sebelumnya:</b><br><i>"${esc(catatanLama.catatan)}"</i></span></p>` : ''}`;
  };

  const loadSide = async () => {
    const seq = ++sideSeq;
    $('#sidePanel').innerHTML = loadingState('Memuat profil santri…');
    const r = await api.post('santriDetail', { santriId: f.santri.value });
    if (seq !== sideSeq || !ctx.alive()) return;
    if (!r.success) {
      $('#sidePanel').innerHTML = `<div class="card">${emptyState(r.message || 'Gagal memuat profil.', 'alert')}</div>`;
      return;
    }
    detail = r.data;
    if (!touchedSurah) {
      const t = detail.peta.find(p => p.status !== 'lulus');
      if (t && surahList.some(s => s.nomor === t.nomor)) f.surah.value = t.nomor;
    }
    renderSide();
    updateSurahHint();
  };

  // Event
  f.santri.addEventListener('change', () => { touchedSurah = false; loadSide(); });
  f.surah.addEventListener('change', () => { touchedSurah = true; updateSurahHint(); });
  f.skor.addEventListener('input', () => setSkor(f.skor.value, false));
  f.range.addEventListener('input', () => setSkor(f.range.value, true));
  f.catatan.addEventListener('input', updateCount);
  $$('#segAyat button').forEach(b => b.addEventListener('click', () => {
    ayatMode = b.dataset.v;
    $$('#segAyat button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    f.ayat.hidden = ayatMode === 'penuh';
    if (!f.ayat.hidden) f.ayat.focus();
  }));
  $$('#segLulus button').forEach(b => b.addEventListener('click', () => { touchedLulus = true; setLulus(b.dataset.v === '1'); }));
  $$('[data-chip]').forEach(b => b.addEventListener('click', () => {
    const t = f.catatan.value.trim();
    f.catatan.value = (t ? t.replace(/[.\s]*$/, '') + '. ' : '') + b.dataset.chip + '.';
    f.catatan.value = f.catatan.value.slice(0, 500);
    updateCount();
    f.catatan.focus();
  }));

  $('#fSetoran').addEventListener('submit', async e => {
    e.preventDefault();
    const skor = f.skor.value === '' ? NaN : Number(f.skor.value);
    if (!isFinite(skor) || skor < 0 || skor > 100) { f.skor.focus(); return toast('Isi skor antara 0 sampai 100.', 'error'); }
    if (!f.tanggal.value) { f.tanggal.focus(); return toast('Isi tanggal setoran.', 'error'); }
    if (f.tanggal.value > hariIni()) { f.tanggal.focus(); return toast('Tanggal setoran tidak boleh melebihi hari ini.', 'error'); }
    if (ayatMode === 'sebagian' && !f.ayat.value.trim()) { f.ayat.focus(); return toast('Tuliskan cakupan ayat, misalnya "Ayat 1–20".', 'error'); }
    if (lulus === null) return toast('Pilih status hasil penilaian: lulus atau perlu diulang.', 'error');

    const payload = {
      id: edit ? edit.id : undefined,
      santriId: f.santri.value,
      surahNomor: Number(f.surah.value),
      tanggal: f.tanggal.value,
      skor: Math.round(skor),
      lulus: lulus,
      ayat: ayatMode === 'penuh' ? 'Surah penuh' : f.ayat.value.trim(),
      catatan: f.catatan.value.trim()
    };
    const btn = $('#btnSimpan');
    setBusy(btn, true);
    const r = await api.post('setoranSave', payload);
    setBusy(btn, false);
    if (!ensureOk(r)) return;
    toast('Peringkat dan progres hafalan santri sudah diperbarui.', 'ok', edit ? 'Setoran diperbarui' : 'Alhamdulillah, setoran tersimpan');
    if (edit) return go('#/setoran');
    if (!ctx.alive()) return; // pengguna sudah pindah halaman
    // Siap untuk setoran berikutnya
    f.skor.value = '';
    f.range.value = 0;
    f.catatan.value = '';
    $('#predChip').innerHTML = '';
    touchedLulus = false;
    touchedSurah = false;
    setLulus(null);
    lulus = null;
    updateCount();
    loadSide();
  });

  if (edit) setSkor(edit.skor, false);
  updateCount();
  loadSide();
}

// ============================================================
// DATA SANTRI (admin) / SANTRI BINAAN (ustad)
// ============================================================
async function pageSantri(ctx) {
  const isAdmin = ctx.user.role === 'admin';
  setCrumb(['Lembaga', isAdmin ? 'Data Santri' : 'Santri Binaan']);
  view(loadingState());
  const [res, uRes] = await Promise.all([api.post('santriList'), isAdmin ? api.post('userList') : Promise.resolve({ success: true, data: [] })]);
  if (!ctx.alive()) return;
  if (!res.success) return gagalMuat(res);
  if (!uRes.success) return gagalMuat(uRes);

  const all = res.data;
  const pengajar = uRes.data.filter(u => (u.role === 'ustad' || u.role === 'admin') && u.aktif);
  const aktif = all.filter(s => s.status === 'Aktif');
  const alumni = all.filter(s => s.status === 'Alumni');
  const rataProgres = aktif.length ? aktif.reduce((t, s) => t + s.progres, 0) / aktif.length : 0;
  const dinilai = aktif.filter(s => s.rataSkor !== null);
  const rataNilai = dinilai.length ? dinilai.reduce((t, s) => t + s.rataSkor, 0) / dinilai.length : null;
  const ustads = [...new Set(all.map(s => s.ustad))].sort((a, b) => a.localeCompare(b, 'id'));

  view(`
    <section class="page-head">
      <div><span class="eyebrow">${isAdmin ? 'Direktori santri' : 'Santri binaan saya'}</span>
        <h1>${isAdmin ? 'Data & Direktori Santri' : 'Santri Binaan'}</h1>
        <p class="lead">${isAdmin ? 'Kelola identitas santri, penetapan ustad pengajar, dan status keaktifan.' : 'Daftar santri yang Anda ajar beserta progres hafalannya.'}</p></div>
      <div class="row-gap">
        <button class="btn btn-ghost" type="button" id="snCsv">${icon('download', 18)} Ekspor CSV</button>
        ${isAdmin ? `<button class="btn btn-primary" type="button" id="snAdd">${icon('plusCircle', 18)} Tambah Santri</button>` : ''}
      </div>
    </section>

    <div class="grid grid-4">
      ${statCard({ label: 'Santri aktif', value: fmt(aktif.length), unit: 'Santri', iconName: 'checkCircle', foot: `${fmt(all.length)} santri terdaftar` })}
      ${statCard({ label: 'Alumni / khatam', value: fmt(alumni.length), unit: 'Santri', iconName: 'award', tone: 'gold', foot: 'Sudah menuntaskan Juz 30' })}
      ${isAdmin
        ? statCard({ label: 'Ustad pengajar', value: fmt(new Set(aktif.map(s => s.ustadId)).size), unit: 'Pengampu', iconName: 'grad', foot: `${fmt(pengajar.filter(p => p.role === 'ustad').length)} akun ustad aktif` })
        : statCard({ label: 'Rata-rata nilai', value: rataNilai === null ? '—' : fmt1(rataNilai), unit: '/100', iconName: 'award', foot: rataNilai === null ? 'Belum ada setoran' : badgePredikat(predikat(rataNilai)) })}
      ${statCard({ label: 'Rata-rata ketuntasan', value: fmt1(rataProgres) + '%', iconName: 'trend', foot: bar(rataProgres, 'strong') })}
    </div>

    <section class="card filter-bar mt-24">
      <div class="input-icon">${icon('search', 18)}<input class="input" id="snQ" type="search" placeholder="Cari nama, NIS, atau halaqah…" aria-label="Cari santri"></div>
      ${isAdmin ? `<select class="select" id="snUstad" aria-label="Filter ustad"><option value="">Semua ustad pengajar</option>${ustads.map(u => `<option>${esc(u)}</option>`).join('')}</select>` : ''}
      <select class="select" id="snStatus" aria-label="Filter status"><option value="">Semua status</option><option>Aktif</option><option>Nonaktif</option><option>Alumni</option></select>
      <select class="select" id="snProg" aria-label="Filter progres"><option value="">Semua progres</option><option value="hi">75% ke atas</option><option value="mid">50–75%</option><option value="lo">Di bawah 50%</option></select>
    </section>

    <section class="card table-card mt-16">
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Nama santri</th><th>NIS</th>${isAdmin ? '<th>Ustad pembimbing</th>' : ''}<th>Progres hafalan (Juz 30)</th><th>Status</th><th>Tgl masuk</th><th class="right">Aksi</th></tr></thead>
        <tbody id="snBody"></tbody>
      </table></div>
      <div class="table-foot" id="snFoot"></div>
    </section>
  `);

  let page = 1;
  const filtered = () => {
    const q = normalize($('#snQ').value);
    const us = isAdmin ? $('#snUstad').value : '';
    const st = $('#snStatus').value;
    const pr = $('#snProg').value;
    return all.filter(s =>
      (!q || normalize(s.nama).includes(q) || normalize(s.nis).includes(q) || normalize(s.halaqah).includes(q)) &&
      (!us || s.ustad === us) && (!st || s.status === st) &&
      (!pr || (pr === 'hi' ? s.progres >= 75 : pr === 'mid' ? s.progres >= 50 && s.progres < 75 : s.progres < 50)));
  };
  const draw = () => {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (page > pages) page = pages;
    const slice = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    $('#snBody').innerHTML = slice.length ? slice.map(s => `<tr>
      <td>${person(s.nama, s.halaqah ? esc(s.halaqah) : '', s.fotoId, 44)}</td>
      <td class="num">${esc(s.nis)}</td>
      ${isAdmin ? `<td>${esc(s.ustad)}</td>` : ''}
      <td><div class="progress-cell"><div class="top"><b>${s.jumlahSurah} / ${s.totalSurah} Surah</b><span>${fmt1(s.progres)}%</span></div>${bar(s.progres, s.progres >= 100 ? 'gold' : '')}
        <small class="faint" style="display:block;margin-top:6px">Terakhir: ${s.terakhir ? esc(s.terakhir.surahNama) + ' · ' + relTgl(s.terakhir.tanggal) : '—'}</small></div></td>
      <td>${statusSantriPill(s.status)}</td>
      <td>${tgl(s.tglMasuk)}</td>
      <td><div class="actions">
        <a class="icon-btn" href="#/santri/${encodeURIComponent(s.id)}" title="Lihat profil" aria-label="Lihat profil ${esc(s.nama)}">${icon('eye')}</a>
        ${isAdmin ? `<button class="icon-btn" type="button" data-edit="${esc(s.id)}" title="Ubah data" aria-label="Ubah data ${esc(s.nama)}">${icon('edit')}</button>` : ''}
      </div></td></tr>`).join('')
      : `<tr><td colspan="${isAdmin ? 7 : 6}">${emptyState(all.length ? 'Tidak ada santri yang cocok dengan filter.' : (isAdmin ? 'Belum ada santri. Klik "Tambah Santri" untuk memulai.' : 'Belum ada santri yang ditugaskan kepada Anda.'), 'users')}</td></tr>`;
    const foot = $('#snFoot');
    foot.innerHTML = pagerHtml(list.length, page);
    bindPager(foot, p => { page = p; draw(); });
    $$('[data-edit]', $('#snBody')).forEach(b => b.addEventListener('click', () => santriModal(all.find(s => s.id === b.dataset.edit), pengajar)));
  };
  $('#snQ').addEventListener('input', debounce(() => { page = 1; draw(); }));
  ['#snStatus', '#snProg'].concat(isAdmin ? ['#snUstad'] : []).forEach(s => $(s).addEventListener('change', () => { page = 1; draw(); }));
  if (isAdmin) $('#snAdd').addEventListener('click', () => santriModal(null, pengajar));
  $('#snCsv').addEventListener('click', () => {
    const list = filtered();
    if (!list.length) return toast('Tidak ada data untuk diekspor.', 'error');
    downloadCSV(`data-santri-${hariIni()}.csv`,
      ['NIS', 'Nama', 'Ustad', 'Halaqah', 'Tanggal Masuk', 'Status', 'Surah Lulus', 'Total Surah', 'Progres (%)', 'Rata-rata Skor'],
      list.map(s => [s.nis, s.nama, s.ustad, s.halaqah, s.tglMasuk, s.status, s.jumlahSurah, s.totalSurah, s.progres, s.rataSkor ?? '']));
  });
  draw();
}

function santriModal(s, pengajar) {
  if (!pengajar.length) return toast('Buat akun ustad terlebih dahulu di menu Kelola Akun.', 'error');
  const m = openModal({
    title: s ? 'Ubah Data Santri' : 'Tambah Santri Baru',
    subtitle: 'Setiap santri wajib memiliki satu ustad pengajar.',
    wide: true,
    body: `<form id="mSantri" class="stack" style="gap:18px" novalidate>
      <div class="upload">
        <div class="upload-preview" id="fotoPrev">${s && s.fotoId ? `<img src="${fotoUrl(s.fotoId, 200)}" alt="" referrerpolicy="no-referrer">` : icon('image', 30)}</div>
        <div>
          <label class="btn btn-ghost btn-sm" for="mFoto">${icon('upload', 16)} Pilih foto</label>
          <input type="file" id="mFoto" accept="image/jpeg,image/png,image/webp">
          ${s && s.fotoId ? '<button type="button" class="btn btn-text btn-sm" id="mHapusFoto">Hapus foto</button>' : ''}
          <p class="small faint mt-8">Opsional. Foto otomatis dikecilkan dan tampil di halaman peringkat publik.</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field full"><label for="mNama">Nama lengkap <span class="req">*</span></label><input class="input" id="mNama" maxlength="80" value="${esc(s ? s.nama : '')}" required></div>
        <div class="field"><label for="mNis">NIS <span class="req">*</span></label><input class="input" id="mNis" maxlength="30" value="${esc(s ? s.nis : '')}" required></div>
        <div class="field"><label for="mUstad">Ustad pengajar <span class="req">*</span></label>
          <select class="select" id="mUstad" required><option value="">— pilih ustad —</option>
          ${pengajar.map(p => `<option value="${esc(p.id)}" ${s && s.ustadId === p.id ? 'selected' : ''}>${esc(p.nama)}${p.role === 'admin' ? ' (admin)' : ''}</option>`).join('')}</select></div>
        <div class="field"><label for="mHalaqah">Halaqah / kelas</label><input class="input" id="mHalaqah" maxlength="60" placeholder="Contoh: Halaqah Abu Bakar" value="${esc(s ? s.halaqah : '')}"></div>
        <div class="field"><label for="mMasuk">Tanggal masuk</label><input class="input" type="date" id="mMasuk" value="${esc(s ? s.tglMasuk : '')}"></div>
        <div class="field"><label for="mStatus">Status</label><select class="select" id="mStatus">
          ${['Aktif', 'Nonaktif', 'Alumni'].map(o => `<option ${s && s.status === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" type="submit" id="mSimpan">Simpan</button></div>
    </form>`
  });
  let foto = null;
  let hapusFoto = false;
  $('#mFoto', m.el).addEventListener('change', async e => {
    try {
      foto = await readFilePayload(e.target.files[0], { maxDim: 480 });
      if (foto) { $('#fotoPrev', m.el).innerHTML = `<img src="${foto.preview}" alt="">`; hapusFoto = false; }
    } catch (err) { toast(err.message, 'error'); e.target.value = ''; }
  });
  const hb = $('#mHapusFoto', m.el);
  if (hb) hb.addEventListener('click', () => { hapusFoto = true; foto = null; $('#fotoPrev', m.el).innerHTML = icon('image', 30); });

  $('#mSantri', m.el).addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      id: s ? s.id : undefined,
      nama: $('#mNama', m.el).value.trim(), nis: $('#mNis', m.el).value.trim(),
      ustadId: $('#mUstad', m.el).value, halaqah: $('#mHalaqah', m.el).value.trim(),
      tglMasuk: $('#mMasuk', m.el).value, status: $('#mStatus', m.el).value,
      foto: foto ? { data: foto.data, mime: foto.mime } : undefined, hapusFoto
    };
    if (!payload.nama || !payload.nis || !payload.ustadId) return toast('Nama, NIS, dan ustad pengajar wajib diisi.', 'error');
    const btn = $('#mSimpan', m.el);
    setBusy(btn, true);
    const r = await api.post('santriSave', payload);
    setBusy(btn, false);
    if (!ensureOk(r)) return;
    m.close();
    toast(r.message);
    router();
  });
}

// ============================================================
// PROFIL SANTRI
// ============================================================
async function pageSantriDetail(ctx) {
  const u = ctx.user;
  const back = u.role === 'donatur' ? ['#/progres', 'Santri Binaan Saya'] : ['#/santri', u.role === 'admin' ? 'Data Santri' : 'Santri Binaan'];
  setCrumb([back[1], 'Profil Santri']);
  view(loadingState());
  const res = await api.post('santriDetail', { santriId: ctx.id });
  if (!ctx.alive()) return;
  if (!res.success) return gagalMuat(res);

  const { santri: s, rank, target, peta, setoran, donasi } = res.data;
  const belum = peta.filter(p => p.status !== 'lulus');
  const targetNo = (belum[0] || {}).nomor;
  const terakhir = setoran[0];
  const bisaCatat = (u.role === 'admin' || u.role === 'ustad') && s.status === 'Aktif';
  const nLulus = peta.filter(p => p.status === 'lulus').length;
  const nUlang = peta.filter(p => p.status === 'ulang').length;

  const tile = p => `<div class="tile ${p.status} ${p.nomor === targetNo ? 'target' : ''}" title="${esc(p.nomor + '. ' + p.nama)} — ${p.status === 'lulus' ? 'Lulus' : p.status === 'ulang' ? 'Perlu diulang' : 'Belum disetor'}">
      <div class="tile-top"><span>${p.nomor}</span><span class="st">${p.status === 'lulus' ? icon('checkCircle', 15) : p.status === 'ulang' ? icon('rotate', 15) : (p.nomor === targetNo ? '<span class="pill" style="height:18px;font-size:10px;padding:0 6px">TARGET</span>' : icon('lock', 13))}</span></div>
      ${arab(p.namaArab)}
      <div class="nm">${esc(p.nama)}</div>
      <div class="tile-bot"><span>${p.jumlahAyat} ayat</span><b>${p.skor ?? ''}</b></div>
    </div>`;

  const tlItem = x => `<article class="tl-item ${x.lulus ? '' : 'ulang'}">
      <div class="tl-head"><div class="left"><span class="tl-date">${tgl(x.tanggal)}</span><strong>${esc(x.surahNama)}</strong>${arab(x.namaArab)}<span class="faint small">${esc(x.ayat)}</span></div>
        <div class="row-gap" style="gap:8px">${scoreCell(x.skor, x.predikat)}${hasilPill(x.lulus)}</div></div>
      ${x.catatan ? `<p class="tl-note"><b>Catatan ${esc(x.ustad)}:</b> <i>"${esc(x.catatan)}"</i></p>` : `<p class="tl-note faint">Penguji: ${esc(x.ustad)}</p>`}
    </article>`;

  view(`
    <div class="page-head">
      <a class="btn btn-text" href="${back[0]}">${icon('arrowL', 18)} ${esc(back[1])}</a>
      <div class="row-gap">
        ${bisaCatat ? `<a class="btn btn-ghost" href="#/setoran/baru?santri=${encodeURIComponent(s.id)}">${icon('plusCircle', 18)} Catat setoran</a>` : ''}
        <button class="btn btn-primary" type="button" id="btnPdf">${icon('download', 18)} Unduh Laporan PDF</button>
      </div>
    </div>

    <section class="card profile-head">
      ${avatar(s.nama, s.fotoId, 104)}
      <div class="info">
        <div class="tags">${statusSantriPill(s.status)}${rank ? `<span class="pill p-gold">${icon('trophy', 13)} Peringkat #${rank} lembaga</span>` : ''}<span class="pill p-muted">NIS ${esc(s.nis)}</span></div>
        <h1>${esc(s.nama)}</h1>
        <div class="meta">
          <span>${icon('user', 16)} Ustad pembimbing: <b>${esc(s.ustad)}</b></span>
          ${s.halaqah ? `<span>${icon('users', 16)} ${esc(s.halaqah)}</span>` : ''}
          ${s.tglMasuk ? `<span>${icon('calendar', 16)} Bergabung ${tgl(s.tglMasuk)}</span>` : ''}
        </div>
      </div>
      <div class="profile-side"><div><span>Fase belajar</span><strong>Juz 30 ('Amma)</strong></div><div><span>Jumlah setoran</span><strong>${fmt(s.jumlahSetoran)} kali</strong></div></div>
    </section>

    <div class="grid grid-3 mt-24">
      <section class="card stat">
        <div class="stat-top"><span class="stat-label">Capaian surah</span>${ring(s.progres, 76, 8)}</div>
        <div class="stat-value">${s.jumlahSurah}<small>/ ${s.totalSurah} Surah</small></div>
        <div class="stat-foot">${belum.length ? `Tersisa ${belum.length} surah: ${belum.slice(0, 3).map(b => esc(b.nama)).join(', ')}${belum.length > 3 ? ', …' : ''}` : 'Alhamdulillah, khatam Juz 30'}</div>
      </section>
      <section class="card stat">
        <div class="stat-top"><span class="stat-label">Rata-rata penilaian</span>${badgePredikat(s.rataPredikat)}</div>
        <div class="stat-value">${s.rataSkor === null ? '—' : fmt1(s.rataSkor)}<small>/100</small></div>
        <div class="stat-foot" style="display:block">${bar(s.rataSkor || 0, 'strong')}<span class="small">Dari ${fmt(s.jumlahSetoran)} setoran · ${nUlang} surah perlu diulang</span></div>
      </section>
      <section class="card stat">
        <div class="stat-top"><span class="stat-label">Setoran terakhir</span><span class="stat-icon">${icon('checkCircle', 22)}</span></div>
        ${terakhir ? `<div><div style="font-size:20px;line-height:28px;font-weight:700">${terakhir.surahNomor}. ${esc(terakhir.surahNama)} ${arab(terakhir.namaArab)}</div>
          <p class="muted small">${tgl(terakhir.tanggal)} · ${esc(terakhir.ayat)}</p></div>
          <div class="stat-foot">${scoreCell(terakhir.skor, terakhir.predikat)}${hasilPill(terakhir.lulus)}</div>` : `<p class="muted">Belum ada setoran.</p>`}
      </section>
    </div>

    <section class="card mt-24">
      <div class="card-head">
        <div><h2>Peta Hafalan ${peta.length} Surah Juz 30</h2><p class="muted">Urutan hafalan dari An-Nas menuju An-Naba'. ${target ? 'Target berikutnya: <b>' + esc(target) + '</b>.' : ''}</p></div>
        <div class="legend">
          <span class="pill"><span class="sw" style="background:var(--primary)"></span> Lulus (${nLulus})</span>
          <span class="pill"><span class="sw" style="background:var(--gold)"></span> Perlu diulang (${nUlang})</span>
          <span class="pill"><span class="sw" style="background:#D5DDD8"></span> Belum disetor (${peta.length - nLulus - nUlang})</span>
        </div>
      </div>
      <div class="peta">${peta.map(tile).join('')}</div>
    </section>

    <div class="grid ${donasi ? 'grid-main' : ''} mt-24">
      <section class="card">
        <div class="card-head"><h2>Timeline Evaluasi & Setoran</h2><span class="faint small">${fmt(setoran.length)} catatan</span></div>
        ${setoran.length ? `<div class="timeline" id="tl"></div><button class="btn btn-soft btn-block mt-16" type="button" id="tlMore" hidden></button>` : emptyState('Belum ada setoran untuk santri ini.', 'book')}
      </section>
      ${donasi ? `<aside class="stack">
        <section class="card">
          <div class="card-head"><h3>${icon('handHeart', 18)} ${u.role === 'donatur' ? 'Kontribusi Anda' : 'Donatur / Orang Tua Asuh'}</h3></div>
          ${donasi.donatur.length ? `
            <div class="mini-stat"><span>Total kafalah tersalurkan</span><strong class="green">${rupiah(donasi.total)}</strong>${donasi.sejak ? `<span class="small">Sejak ${tgl(donasi.sejak)}</span>` : ''}</div>
            <div class="list mt-16">${donasi.donatur.map(dn => `<div class="list-item">${avatar(dn.nama, '', 36, 'gold')}<div class="grow"><strong>${esc(dn.nama)}</strong><small>${rupiah(dn.total)}</small></div></div>`).join('')}</div>`
            : emptyState('Belum ada donasi tercatat untuk santri ini.', 'handHeart')}
        </section>
        ${KUTIPAN}
      </aside>` : ''}
    </div>
  `);

  $('#btnPdf').addEventListener('click', e => unduhRapor(s.id, e.currentTarget));
  if (setoran.length) {
    let shown = 0;
    const more = () => {
      const next = setoran.slice(shown, shown + 5);
      $('#tl').insertAdjacentHTML('beforeend', next.map(tlItem).join(''));
      shown += next.length;
      const btn = $('#tlMore');
      btn.hidden = shown >= setoran.length;
      btn.textContent = `Muat ${Math.min(5, setoran.length - shown)} riwayat setoran sebelumnya`;
    };
    $('#tlMore').addEventListener('click', more);
    more();
  }
}

// ============================================================
// PROGRES DONATUR
// ============================================================
async function pageProgres(ctx) {
  setCrumb(['Beranda', 'Santri Binaan Saya']);
  view(loadingState());
  const res = await api.post('progresDonatur');
  if (!ctx.alive()) return;
  if (!res.success) return gagalMuat(res);
  const d = res.data;
  const rataSurah = d.jumlahSantri ? d.totalSurahDihafal / d.jumlahSantri : 0;

  const kartu = s => {
    const t = s.terakhir;
    const catatan = (t && t.catatan) || '';
    return `<article class="card santri-card">
      <div class="head">${avatar(s.nama, s.fotoId, 56)}
        <div class="txt"><h3>${esc(s.nama)} <span class="chip">Juz 30</span></h3><small>NIS ${esc(s.nis)} · Pembimbing: ${esc(s.ustad)}</small></div>
        ${t ? arab(t.namaArab) : ''}</div>
      <div class="block">
        <div class="top"><span>Progres hafalan Juz 30</span><b>${s.jumlahSurah} / ${s.totalSurah} Surah (${fmt1(s.progres)}%)</b></div>
        ${bar(s.progres, 'strong')}
        <div class="bot"><span>${s.target ? 'Target berikutnya: ' + esc(s.target) : 'Khatam Juz 30'}</span><span>${s.totalSurah - s.jumlahSurah} surah tersisa</span></div>
      </div>
      <div class="duo">
        <div><div class="lbl">Setoran terakhir</div>${t ? `<b>${esc(t.surahNama)}</b><div class="row-gap mt-8" style="gap:8px">${scoreCell(t.skor, t.predikat)}<span class="faint small">${tgl(t.tanggal)}</span></div>` : '<span class="faint">Belum ada setoran</span>'}</div>
        <div><div class="lbl">${icon('quote', 14)} Catatan ustad</div><div class="quote">${catatan ? '"' + esc(catatan) + '"' : '—'}</div>${t ? `<small class="faint">${esc(t.ustad)}</small>` : ''}</div>
      </div>
      <div class="foot">
        <a class="btn btn-soft" href="#/santri/${encodeURIComponent(s.id)}">${icon('eye', 16)} Lihat progres lengkap</a>
        <button class="btn btn-ghost" type="button" data-pdf="${esc(s.id)}" title="Unduh laporan PDF ${esc(s.nama)}" aria-label="Unduh laporan PDF">${icon('download', 18)} PDF</button>
      </div>
    </article>`;
  };

  view(`
    <section class="page-head">
      <div><span class="eyebrow">Amanah & transparansi</span><h1>Santri Binaan & Progres Donasi</h1>
        <p class="lead">Pantau perkembangan hafalan Al-Qur'an santri yang Anda dukung secara berkala dan transparan.</p></div>
    </section>

    <div class="grid grid-4">
      ${statCard({ label: 'Santri didukung', value: fmt(d.jumlahSantri), unit: 'Santri', iconName: 'users', foot: 'Aktif menghafal Juz 30' })}
      ${statCard({ label: 'Total kontribusi', value: `<span style="font-size:26px">${rupiah(d.totalDonasi)}</span>`, iconName: 'handHeart', tone: 'gold', foot: `${fmt(d.donasi.length)} transaksi tercatat` })}
      ${statCard({ label: 'Total surah tuntas', value: fmt(d.totalSurahDihafal), unit: 'Surah', iconName: 'book', foot: `Rata-rata ${fmt1(rataSurah)} surah per santri` })}
      ${statCard({ label: 'Setoran terakhir', value: `<span style="font-size:24px">${d.setoranTerakhir ? relTgl(d.setoranTerakhir) : '—'}</span>`, iconName: 'checkCircle', foot: !d.setoranTerakhir ? 'Belum ada setoran' : selisihHari(d.setoranTerakhir) < 7 ? tgl(d.setoranTerakhir) : 'Setoran terbaru santri binaan' })}
    </div>

    <div class="section-title"><h2>${icon('grad', 22)} Santri Binaan Anda</h2><span class="muted small">Memantau ${fmt(d.jumlahSantri)} santri</span></div>
    ${d.santri.length ? `<div class="grid grid-2">${d.santri.map(kartu).join('')}</div>`
      : `<div class="card">${emptyState('Belum ada santri yang tercatat dari donasi Anda. Hubungi admin lembaga bila ada yang terlewat.', 'users')}</div>`}

    <section class="card table-card mt-24">
      <div class="card-head" style="padding:24px 24px 0"><div><h2>Riwayat Donasi & Penyaluran</h2><p class="muted">Dana yang disalurkan untuk santri binaan Anda.</p></div></div>
      ${d.donasi.length ? `<div class="table-wrap"><table class="table">
        <thead><tr><th>Tanggal</th><th>Santri penerima</th><th>Alokasi program</th><th class="right">Jumlah</th><th>Bukti transfer</th></tr></thead>
        <tbody>${d.donasi.map(x => `<tr>
          <td>${tgl(x.tanggal)}</td>
          <td>${person(x.santri, '', x.fotoId, 32)}</td>
          <td>${pill(x.alokasi || '—', 'p-muted')}</td>
          <td class="right num"><b>${rupiah(x.jumlah)}</b></td>
          <td>${x.adaBukti ? `<button class="btn btn-text btn-sm" type="button" data-bukti="${esc(x.id)}">${icon('receipt', 16)} Lihat bukti</button>` : '<span class="faint">—</span>'}</td>
        </tr>`).join('')}</tbody></table></div>` : `<div style="padding:0 24px 24px">${emptyState('Belum ada donasi tercatat.', 'handHeart')}</div>`}
    </section>

    <div class="mt-24">${KUTIPAN.replace('Kutipan adab penghafal', 'Jazakumullahu khairan')}</div>
  `);

  $$('[data-pdf]').forEach(b => b.addEventListener('click', () => unduhRapor(b.dataset.pdf, b)));
  $$('[data-bukti]').forEach(b => b.addEventListener('click', () => lihatBukti(b.dataset.bukti, b)));
}

// ============================================================
// DATA DONASI (admin)
// ============================================================
const ALOKASI = ['Kafalah & SPP Tahfidz', 'Kafalah Kitab & Mushaf', 'Operasional Asrama', 'Paket Gizi & Kesehatan', 'Kafalah Santri Yatim', 'Lainnya'];

async function pageDonasi(ctx) {
  setCrumb(['Lembaga', 'Data Donasi']);
  view(loadingState());
  const [res, uRes, sRes] = await Promise.all([api.post('donasiList'), api.post('userList'), api.post('santriList')]);
  if (!ctx.alive()) return;
  for (const r of [res, uRes, sRes]) if (!r.success) return gagalMuat(r);

  const all = res.data;
  const donaturs = uRes.data.filter(u => u.role === 'donatur');
  const santris = sRes.data;
  const bulan = bulanIni();
  const [y, m] = bulan.split('-').map(Number);
  const bulanLalu = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
  const ini = all.filter(x => x.tanggal.slice(0, 7) === bulan);
  const lalu = all.filter(x => x.tanggal.slice(0, 7) === bulanLalu);
  const totalIni = ini.reduce((t, x) => t + x.jumlah, 0);
  const totalLalu = lalu.reduce((t, x) => t + x.jumlah, 0);
  const growth = totalLalu ? Math.round(((totalIni - totalLalu) / totalLalu) * 1000) / 10 : null;
  const aktif = santris.filter(s => s.status === 'Aktif');
  const tercover = new Set(all.map(x => x.santriId).filter(id => aktif.some(s => s.id === id))).size;
  const pctCover = aktif.length ? Math.round((tercover / aktif.length) * 100) : 0;

  view(`
    <section class="page-head">
      <div><span class="eyebrow">Amanah & transparansi</span><h1>Data Donasi & Kafalah Santri</h1>
        <p class="lead">Rekapitulasi donasi beasiswa tahfidz, kafalah santri, dan bukti penyalurannya.</p></div>
      <div class="row-gap">
        <button class="btn btn-ghost" type="button" id="dnCsv">${icon('download', 18)} Ekspor CSV</button>
        <button class="btn btn-primary" type="button" id="dnAdd">${icon('plusCircle', 18)} Catat Donasi</button>
      </div>
    </section>

    <div class="grid grid-3">
      ${statCard({ label: 'Donasi bulan ini', value: `<span style="font-size:28px">${rupiah(totalIni)}</span>`, iconName: 'wallet', foot: growth === null ? `${BULAN_PANJANG[m - 1]} ${y}` : `${icon('trend', 16)} ${growth >= 0 ? '+' : ''}${fmt1(growth)}% dari bulan lalu` })}
      ${statCard({ label: 'Transaksi bulan ini', value: fmt(ini.length), unit: 'Transaksi', iconName: 'receipt', foot: ini.length ? `Rata-rata <b>${rupiah(totalIni / ini.length)}</b> per transaksi` : 'Belum ada transaksi' })}
      ${statCard({ label: 'Santri tercover kafalah', value: fmt(tercover), unit: `/ ${fmt(aktif.length)} santri`, iconName: 'handHeart', tone: 'gold',
        foot: `<div style="width:100%"><div class="row-gap" style="justify-content:space-between;margin-bottom:6px"><span>Santri aktif dengan donatur</span><span class="pill p-ok">${pctCover}% tercukupi</span></div>${bar(pctCover, 'strong')}</div>` })}
    </div>

    <section class="card filter-bar mt-24">
      <div class="input-icon">${icon('search', 18)}<input class="input" id="dnQ" type="search" placeholder="Cari donatur, santri, atau alokasi…" aria-label="Cari donasi"></div>
      <select class="select" id="dnDonatur" aria-label="Filter donatur"><option value="">Semua donatur</option>${donaturs.map(d => `<option value="${esc(d.id)}">${esc(d.nama)}</option>`).join('')}</select>
      <select class="select" id="dnSantri" aria-label="Filter santri"><option value="">Semua santri</option>${santris.map(s => `<option value="${esc(s.id)}">${esc(s.nama)}</option>`).join('')}</select>
      <input class="input" type="month" id="dnBulan" aria-label="Filter bulan">
      <button class="btn btn-text" type="button" id="dnReset">${icon('refresh', 16)} Reset</button>
    </section>

    <section class="card table-card mt-16">
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Tanggal</th><th>Donatur</th><th>Santri penerima</th><th>Alokasi program</th><th class="right">Jumlah</th><th>Bukti transfer</th><th class="right">Aksi</th></tr></thead>
        <tbody id="dnBody"></tbody>
      </table></div>
      <div class="table-foot" id="dnFoot"></div>
    </section>
  `);

  let page = 1;
  const filtered = () => {
    const q = normalize($('#dnQ').value);
    const dn = $('#dnDonatur').value, sn = $('#dnSantri').value, bl = $('#dnBulan').value;
    return all.filter(x =>
      (!q || normalize(x.donatur).includes(q) || normalize(x.santri).includes(q) || normalize(x.alokasi).includes(q)) &&
      (!dn || x.donaturId === dn) && (!sn || x.santriId === sn) && (!bl || x.tanggal.slice(0, 7) === bl));
  };
  const draw = () => {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (page > pages) page = pages;
    const slice = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    $('#dnBody').innerHTML = slice.length ? slice.map(x => `<tr>
      <td><b>${tgl(x.tanggal)}</b><small class="faint" style="display:block">${jam(x.dibuat)}</small></td>
      <td>${person(x.donatur, '', '', 36).replace('class="av', 'class="av gold')}</td>
      <td><a href="#/santri/${encodeURIComponent(x.santriId)}">${icon('grad', 16)} ${esc(x.santri)}</a></td>
      <td>${pill(x.alokasi || '—', 'p-muted')}</td>
      <td class="right num"><b>${rupiah(x.jumlah)}</b></td>
      <td>${x.adaBukti ? `<button class="btn btn-text btn-sm" type="button" data-bukti="${esc(x.id)}">${icon('receipt', 16)} Lihat bukti</button>` : '<span class="faint">Belum ada</span>'}</td>
      <td><div class="actions">
        <button class="icon-btn" type="button" data-edit="${esc(x.id)}" title="Ubah" aria-label="Ubah donasi">${icon('edit')}</button>
        <button class="icon-btn danger" type="button" data-del="${esc(x.id)}" title="Hapus" aria-label="Hapus donasi">${icon('trash')}</button>
      </div></td></tr>`).join('')
      : `<tr><td colspan="7">${emptyState(all.length ? 'Tidak ada donasi yang cocok dengan filter.' : 'Belum ada donasi. Klik "Catat Donasi" untuk menambahkan.', 'handHeart')}</td></tr>`;
    const foot = $('#dnFoot');
    foot.innerHTML = pagerHtml(list.length, page);
    bindPager(foot, p => { page = p; draw(); });
    $$('[data-bukti]', $('#dnBody')).forEach(b => b.addEventListener('click', () => lihatBukti(b.dataset.bukti, b)));
    $$('[data-edit]', $('#dnBody')).forEach(b => b.addEventListener('click', () => donasiModal(all.find(x => x.id === b.dataset.edit), donaturs, santris)));
    $$('[data-del]', $('#dnBody')).forEach(b => b.addEventListener('click', async () => {
      const x = all.find(v => v.id === b.dataset.del);
      if (!await confirmBox(`Hapus donasi ${rupiah(x.jumlah)} dari ${x.donatur} untuk ${x.santri}? Bukti transfer di Drive ikut dipindahkan ke sampah.`, { title: 'Hapus data donasi?', okText: 'Hapus' })) return;
      const r = await api.post('donasiDelete', { id: x.id });
      if (!ensureOk(r)) return;
      toast(r.message);
      router();
    }));
  };
  $('#dnQ').addEventListener('input', debounce(() => { page = 1; draw(); }));
  ['#dnDonatur', '#dnSantri', '#dnBulan'].forEach(s => $(s).addEventListener('change', () => { page = 1; draw(); }));
  $('#dnReset').addEventListener('click', () => { ['#dnQ', '#dnDonatur', '#dnSantri', '#dnBulan'].forEach(s => { $(s).value = ''; }); page = 1; draw(); });
  $('#dnAdd').addEventListener('click', () => donasiModal(null, donaturs, santris));
  $('#dnCsv').addEventListener('click', () => {
    const list = filtered();
    if (!list.length) return toast('Tidak ada data untuk diekspor.', 'error');
    downloadCSV(`data-donasi-${hariIni()}.csv`, ['Tanggal', 'Donatur', 'Santri', 'Alokasi', 'Jumlah (Rp)', 'Ada Bukti'],
      list.map(x => [x.tanggal, x.donatur, x.santri, x.alokasi, x.jumlah, x.adaBukti ? 'Ya' : 'Tidak']));
  });
  draw();
}

function donasiModal(x, donaturs, santris) {
  const aktifDonatur = donaturs.filter(d => d.aktif || (x && d.id === x.donaturId));
  if (!aktifDonatur.length) return toast('Buat akun donatur terlebih dahulu di menu Kelola Akun.', 'error');
  if (!santris.length) return toast('Tambahkan data santri terlebih dahulu.', 'error');
  const m = openModal({
    title: x ? 'Ubah Data Donasi' : 'Catat Donasi Baru',
    subtitle: 'Donasi yang tercatat akan terlihat oleh donatur di halaman progres mereka.',
    wide: true,
    body: `<form id="mDonasi" class="stack" style="gap:18px" novalidate>
      <div class="form-grid">
        <div class="field"><label for="mdDonatur">Donatur <span class="req">*</span></label><select class="select" id="mdDonatur"><option value="">— pilih donatur —</option>
          ${aktifDonatur.map(d => `<option value="${esc(d.id)}" ${x && x.donaturId === d.id ? 'selected' : ''}>${esc(d.nama)}</option>`).join('')}</select></div>
        <div class="field"><label for="mdSantri">Santri penerima <span class="req">*</span></label><select class="select" id="mdSantri"><option value="">— pilih santri —</option>
          ${santris.map(s => `<option value="${esc(s.id)}" ${x && x.santriId === s.id ? 'selected' : ''}>${esc(s.nama)} (${esc(s.nis)})</option>`).join('')}</select></div>
        <div class="field"><label for="mdJumlah">Jumlah (Rp) <span class="req">*</span></label><input class="input" type="number" min="1" step="1" inputmode="numeric" id="mdJumlah" value="${x ? x.jumlah : ''}" placeholder="Contoh: 1200000"><span class="hint" id="mdJumlahHint"></span></div>
        <div class="field"><label for="mdTanggal">Tanggal <span class="req">*</span></label><input class="input" type="date" id="mdTanggal" max="${hariIni()}" value="${x ? esc(x.tanggal) : hariIni()}"></div>
        <div class="field full"><label for="mdAlokasi">Alokasi program</label><input class="input" id="mdAlokasi" list="alokasiList" maxlength="60" value="${esc(x ? x.alokasi : ALOKASI[0])}">
          <datalist id="alokasiList">${ALOKASI.map(a => `<option value="${esc(a)}">`).join('')}</datalist></div>
        <div class="field full"><span class="label">Bukti transfer ${x && x.adaBukti ? '<span class="faint">(sudah ada — unggah lagi untuk mengganti)</span>' : ''}</span>
          <div class="upload"><label class="btn btn-ghost btn-sm" for="mdBukti">${icon('upload', 16)} Pilih berkas</label><input type="file" id="mdBukti" accept="image/jpeg,image/png,image/webp,application/pdf"><span class="small muted" id="mdBuktiName">JPG, PNG, atau PDF, maksimal 2 MB. Disimpan privat di Drive.</span></div></div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" type="submit" id="mdSimpan">Simpan donasi</button></div>
    </form>`
  });
  let bukti = null;
  const jumlah = $('#mdJumlah', m.el);
  const hint = () => { $('#mdJumlahHint', m.el).textContent = jumlah.value ? rupiah(jumlah.value) : ''; };
  jumlah.addEventListener('input', hint);
  hint();
  $('#mdBukti', m.el).addEventListener('change', async e => {
    const file = e.target.files[0];
    try {
      bukti = await readFilePayload(file, { maxDim: 1400, quality: 0.85, allowPdf: true });
      $('#mdBuktiName', m.el).textContent = file ? file.name : '';
    } catch (err) { toast(err.message, 'error'); e.target.value = ''; bukti = null; }
  });
  $('#mDonasi', m.el).addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      id: x ? x.id : undefined,
      donaturId: $('#mdDonatur', m.el).value, santriId: $('#mdSantri', m.el).value,
      jumlah: Number(jumlah.value), tanggal: $('#mdTanggal', m.el).value,
      alokasi: $('#mdAlokasi', m.el).value.trim(),
      bukti: bukti ? { data: bukti.data, mime: bukti.mime } : undefined
    };
    if (!payload.donaturId || !payload.santriId) return toast('Pilih donatur dan santri penerima.', 'error');
    if (!(payload.jumlah > 0)) return toast('Jumlah donasi harus lebih dari 0.', 'error');
    if (!payload.tanggal) return toast('Isi tanggal donasi.', 'error');
    const btn = $('#mdSimpan', m.el);
    setBusy(btn, true);
    const r = await api.post('donasiSave', payload);
    setBusy(btn, false);
    if (!ensureOk(r)) return;
    m.close();
    toast(r.message);
    router();
  });
}

// ============================================================
// KELOLA AKUN (admin)
// ============================================================
async function pageAkun(ctx) {
  setCrumb(['Lembaga', 'Kelola Akun']);
  view(loadingState());
  const res = await api.post('userList');
  if (!ctx.alive()) return;
  if (!res.success) return gagalMuat(res);
  const all = res.data;
  const me = ctx.user;
  const count = r => all.filter(u => u.role === r).length;
  const nAktif = all.filter(u => u.aktif).length;
  const tab = ['admin', 'ustad', 'donatur'].includes(ctx.query.tab) ? ctx.query.tab : '';

  view(`
    <section class="page-head">
      <div><span class="eyebrow">Otoritas sistem</span><h1>Kelola Akun Pengguna</h1>
        <p class="lead">Akun ustad dan donatur dibuat serta diatur sepenuhnya oleh admin. Password tersimpan terenkripsi dan tidak bisa dilihat kembali.</p></div>
      <button class="btn btn-primary" type="button" id="akAdd">${icon('plusCircle', 18)} Buat Akun Baru</button>
    </section>

    <div class="grid grid-4">
      ${statCard({ label: 'Total akun', value: fmt(all.length), iconName: 'shieldUser', foot: `${count('admin')} admin` })}
      ${statCard({ label: 'Ustad pengampu', value: fmt(count('ustad')), iconName: 'book', foot: 'Pencatat setoran hafalan' })}
      ${statCard({ label: 'Donatur terdaftar', value: fmt(count('donatur')), iconName: 'handHeart', tone: 'gold', foot: 'Pemantau progres santri' })}
      ${statCard({ label: 'Status keaktifan', value: fmt(nAktif), unit: `/ ${fmt(all.length)} aktif`, iconName: 'checkCircle', valueTone: '', foot: all.length - nAktif ? `<span style="color:var(--danger)">${icon('alert', 14)} ${all.length - nAktif} akun dinonaktifkan</span>` : 'Semua akun aktif' })}
    </div>

    <section class="card filter-bar mt-24" style="justify-content:space-between">
      <div class="segmented light" id="akTabs" role="tablist">
        ${[['', 'Semua', all.length], ['admin', 'Admin', count('admin')], ['ustad', 'Ustad', count('ustad')], ['donatur', 'Donatur', count('donatur')]]
          .map(([v, t, n]) => `<button type="button" data-tab="${v}" aria-pressed="${v === tab}">${t} <span class="count">${n}</span></button>`).join('')}
      </div>
      <div class="row-gap" style="flex:1;justify-content:flex-end">
        <div class="input-icon" style="flex:1 1 220px;max-width:340px">${icon('search', 18)}<input class="input" id="akQ" type="search" placeholder="Cari nama, username, kontak…" aria-label="Cari akun"></div>
        <select class="select" id="akStatus" aria-label="Filter status"><option value="">Semua status</option><option value="1">Aktif</option><option value="0">Nonaktif</option></select>
      </div>
    </section>

    <section class="card table-card mt-16">
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Pengguna</th><th>Username</th><th>Peran</th><th>Kontak</th><th>Status</th><th>Terakhir masuk</th><th class="right">Aksi</th></tr></thead>
        <tbody id="akBody"></tbody>
      </table></div>
      <div class="table-foot"><span>Akun yang dinonaktifkan tidak bisa masuk, tetapi riwayat setoran dan donasinya tetap tersimpan.</span><span>${icon('lock', 14)} Password tersimpan sebagai hash</span></div>
    </section>
  `);

  let curTab = tab;
  const draw = () => {
    const q = normalize($('#akQ').value);
    const st = $('#akStatus').value;
    const list = all.filter(u =>
      (!curTab || u.role === curTab) && (st === '' || String(u.aktif ? 1 : 0) === st) &&
      (!q || normalize(u.nama).includes(q) || normalize(u.username).includes(q) || normalize(u.kontak).includes(q)));
    $('#akBody').innerHTML = list.length ? list.map(u => `<tr>
      <td><div class="person">${avatar(u.nama, '', 40, u.role === 'donatur' ? 'gold round' : 'round')}<div class="txt"><strong>${esc(u.nama)}${u.id === me.id ? ' <span class="faint">(Anda)</span>' : ''}</strong>
        <small style="color:${u.aktif ? 'var(--primary)' : 'var(--danger)'}">${u.aktif ? '● Aktif' : '● Akses ditangguhkan'}</small></div></div></td>
      <td class="num">@${esc(u.username)}</td>
      <td>${rolePill(u.role)}</td>
      <td class="small">${u.kontak ? esc(u.kontak) : '<span class="faint">—</span>'}</td>
      <td><button class="switch" type="button" role="switch" aria-checked="${u.aktif}" data-toggle="${esc(u.id)}" aria-label="${u.aktif ? 'Nonaktifkan' : 'Aktifkan'} akun ${esc(u.nama)}" ${u.id === me.id ? 'disabled title="Tidak bisa menonaktifkan akun sendiri"' : ''}></button></td>
      <td class="small">${u.lastLogin ? `${relTgl(u.lastLogin)}<br><span class="faint">${jam(u.lastLogin)}</span>` : '<span class="faint">Belum pernah</span>'}</td>
      <td><div class="actions">
        <button class="icon-btn" type="button" data-edit="${esc(u.id)}" title="Ubah akun" aria-label="Ubah akun ${esc(u.nama)}">${icon('edit')}</button>
        <button class="icon-btn" type="button" data-reset="${esc(u.id)}" title="Atur ulang password" aria-label="Atur ulang password ${esc(u.nama)}">${icon('lock')}</button>
      </div></td></tr>`).join('')
      : `<tr><td colspan="7">${emptyState('Tidak ada akun yang cocok.', 'shieldUser')}</td></tr>`;

    $$('[data-edit]', $('#akBody')).forEach(b => b.addEventListener('click', () => akunModal(all.find(u => u.id === b.dataset.edit), me)));
    $$('[data-reset]', $('#akBody')).forEach(b => b.addEventListener('click', () => resetPwModal(all.find(u => u.id === b.dataset.reset))));
    $$('[data-toggle]', $('#akBody')).forEach(b => b.addEventListener('click', async () => {
      const u = all.find(x => x.id === b.dataset.toggle);
      const jadi = !u.aktif;
      if (!jadi && !await confirmBox(`Nonaktifkan akun ${u.nama}? Pengguna ini tidak bisa masuk lagi sampai diaktifkan kembali. Datanya tetap tersimpan.`, { title: 'Nonaktifkan akun?', okText: 'Nonaktifkan' })) return;
      b.disabled = true;
      const r = await api.post('userSave', { id: u.id, nama: u.nama, username: u.username, role: u.role, kontak: u.kontak, aktif: jadi });
      b.disabled = false;
      if (!ensureOk(r)) return;
      u.aktif = jadi;
      toast(`Akun ${u.nama} ${jadi ? 'diaktifkan' : 'dinonaktifkan'}.`);
      draw();
    }));
  };
  $$('#akTabs button').forEach(b => b.addEventListener('click', () => {
    curTab = b.dataset.tab;
    $$('#akTabs button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  }));
  $('#akQ').addEventListener('input', debounce(draw));
  $('#akStatus').addEventListener('change', draw);
  $('#akAdd').addEventListener('click', () => akunModal(null, me));
  draw();
}

function akunModal(u, me) {
  const self = u && u.id === me.id;
  const m = openModal({
    title: u ? 'Ubah Akun' : 'Buat Akun Pengguna Baru',
    subtitle: u ? `@${esc(u.username)}` : 'Berikan username dan password awal kepada pengguna secara langsung.',
    body: `<form id="mAkun" class="stack" style="gap:16px" novalidate>
      <div class="field"><label for="maNama">Nama lengkap <span class="req">*</span></label><input class="input" id="maNama" maxlength="80" value="${esc(u ? u.nama : '')}" placeholder="Contoh: Ustad Ahmad Fauzi"></div>
      <div class="form-grid">
        <div class="field"><label for="maUser">Username <span class="req">*</span></label>
          <div class="input-icon">${icon('user', 18)}<input class="input" id="maUser" maxlength="30" autocapitalize="none" spellcheck="false" value="${esc(u ? u.username : '')}" placeholder="ustad.fauzi"></div>
          <span class="hint">Huruf kecil, angka, titik, strip, garis bawah (3–30)</span></div>
        <div class="field"><label for="maRole">Peran <span class="req">*</span></label>
          <select class="select" id="maRole" ${self ? 'disabled' : ''}>${[['ustad', 'Ustad pengajar'], ['donatur', 'Donatur'], ['admin', 'Admin']].map(([v, t]) => `<option value="${v}" ${u && u.role === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label for="maKontak">Kontak (email / telepon)</label><input class="input" id="maKontak" maxlength="120" value="${esc(u ? u.kontak : '')}" placeholder="Opsional"></div>
      ${u ? '' : `<div class="field"><label for="maPass">Password awal <span class="req">*</span></label>
        <div class="input-icon has-toggle">${icon('lock', 18)}<input class="input" id="maPass" type="password" autocomplete="new-password" placeholder="Minimal 8 karakter, huruf dan angka">
        <button class="icon-btn toggle-pw" type="button" id="maEye" aria-label="Tampilkan password">${icon('eye', 18)}</button></div></div>
        <p class="note">${icon('info', 18)} Password disimpan dalam bentuk hash terenkripsi dan tidak bisa dilihat kembali oleh siapa pun, termasuk admin.</p>`}
      <label class="check"><input type="checkbox" id="maAktif" ${!u || u.aktif ? 'checked' : ''} ${self ? 'disabled' : ''}> Akun langsung aktif</label>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" type="submit" id="maSimpan">${u ? 'Simpan perubahan' : 'Simpan akun baru'}</button></div>
    </form>`
  });
  const eye = $('#maEye', m.el);
  if (eye) eye.addEventListener('click', () => {
    const p = $('#maPass', m.el);
    p.type = p.type === 'password' ? 'text' : 'password';
    eye.innerHTML = icon(p.type === 'password' ? 'eye' : 'eyeOff', 18);
  });
  $('#mAkun', m.el).addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      id: u ? u.id : undefined,
      nama: $('#maNama', m.el).value.trim(),
      username: $('#maUser', m.el).value.trim().toLowerCase(),
      role: self ? 'admin' : $('#maRole', m.el).value,
      kontak: $('#maKontak', m.el).value.trim(),
      aktif: self ? true : $('#maAktif', m.el).checked
    };
    if (!u) payload.password = $('#maPass', m.el).value;
    if (!payload.nama) return toast('Nama wajib diisi.', 'error');
    if (!/^[a-z0-9._-]{3,30}$/.test(payload.username)) return toast('Username 3–30 karakter: huruf kecil, angka, titik, strip, atau garis bawah.', 'error');
    if (!u && (payload.password.length < 8 || !/[a-zA-Z]/.test(payload.password) || !/\d/.test(payload.password))) return toast('Password minimal 8 karakter dan berisi huruf serta angka.', 'error');
    const btn = $('#maSimpan', m.el);
    setBusy(btn, true);
    const r = await api.post('userSave', payload);
    setBusy(btn, false);
    if (!ensureOk(r)) return;
    if (self) {
      Session.save(Session.token(), Object.assign({}, Session.user(), { nama: payload.nama, username: payload.username }));
    }
    m.close();
    toast(r.message);
    router();
  });
}

function resetPwModal(u) {
  const m = openModal({
    title: `Atur Ulang Password`,
    subtitle: `Untuk akun <b>@${esc(u.username)}</b> (${esc(u.nama)})`,
    body: `<form id="mReset" class="stack" style="gap:16px" novalidate>
      <div class="field"><label for="mrPass">Password baru <span class="req">*</span></label><input class="input" id="mrPass" type="password" autocomplete="new-password"></div>
      <div class="field"><label for="mrPass2">Konfirmasi password baru <span class="req">*</span></label><input class="input" id="mrPass2" type="password" autocomplete="new-password"></div>
      <div class="note" id="mrRules">${icon('info', 18)}<span>Minimal 8 karakter dengan kombinasi huruf dan angka.</span></div>
      <p class="note warn">${icon('alert', 18)} Pengguna akan keluar dari semua perangkat dan perlu masuk ulang dengan password baru.</p>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" type="submit" id="mrSimpan">Simpan password baru</button></div>
    </form>`
  });
  $('#mReset', m.el).addEventListener('submit', async e => {
    e.preventDefault();
    const p1 = $('#mrPass', m.el).value, p2 = $('#mrPass2', m.el).value;
    if (p1.length < 8 || !/[a-zA-Z]/.test(p1) || !/\d/.test(p1)) return toast('Password minimal 8 karakter dan berisi huruf serta angka.', 'error');
    if (p1 !== p2) return toast('Konfirmasi password tidak sama.', 'error');
    const btn = $('#mrSimpan', m.el);
    setBusy(btn, true);
    const r = await api.post('userResetPassword', { id: u.id, password: p1 });
    setBusy(btn, false);
    if (!ensureOk(r)) return;
    m.close();
    toast(r.message);
  });
}

// ============================================================
// PENGATURAN (admin): identitas lembaga & master surah
// ============================================================
async function pagePengaturan(ctx) {
  setCrumb(['Lembaga', 'Pengaturan']);
  view(loadingState());
  const [sRes, cRes] = await Promise.all([api.post('surahList'), api.get('pengaturanPublik')]);
  if (!ctx.alive()) return;
  if (!sRes.success) return gagalMuat(sRes);
  if (cRes.success) applySettings(cRes.data);
  state.surah = sRes.data;
  const surah = sRes.data;
  const tab = ctx.query.tab === 'surah' ? 'surah' : 'identitas';
  const S = state.settings;
  const aktif = surah.filter(s => s.aktif);
  const totalAyat = aktif.reduce((t, s) => t + s.jumlahAyat, 0);
  const totalSetoran = surah.reduce((t, s) => t + s.dipakai, 0);
  const maxPakai = Math.max(1, ...surah.map(s => s.dipakai));

  view(`
    <section class="page-head">
      <div><span class="eyebrow">Administrasi sistem</span><h1>Pengaturan Sistem & Master Data</h1>
        <p class="lead">Kelola profil lembaga dan daftar surah pendek yang dipakai di formulir setoran.</p></div>
    </section>
    <div class="tabs" role="tablist">
      <button type="button" role="tab" aria-selected="${tab === 'identitas'}" data-tab="identitas">${icon('home', 16)} Identitas lembaga</button>
      <button type="button" role="tab" aria-selected="${tab === 'surah'}" data-tab="surah">${icon('book', 16)} Master surah pendek <span class="pill">${surah.length}</span></button>
    </div>

    <div class="mt-24" id="tabIdentitas" ${tab === 'identitas' ? '' : 'hidden'}>
      <form class="card" id="fLembaga" novalidate>
        <div class="card-head"><div><h2>Identitas Lembaga & Branding</h2><p class="muted">Tampil di halaman publik, halaman masuk, dan kop rapor PDF.</p></div></div>
        <div class="grid" style="grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:28px" id="lembagaGrid">
          <div class="field">
            <span class="label">Logo resmi lembaga</span>
            <div class="upload" style="flex-direction:column;align-items:flex-start">
              <div class="upload-preview" id="logoPrev" style="width:140px;height:140px">${S.LOGO_ID ? `<img src="${fotoUrl(S.LOGO_ID, 300)}" alt="" referrerpolicy="no-referrer">` : icon('image', 34)}</div>
              <div class="row-gap"><label class="btn btn-ghost btn-sm" for="fLogo">${icon('upload', 16)} Ganti logo</label><input type="file" id="fLogo" accept="image/png,image/jpeg,image/webp">
                ${S.LOGO_ID ? `<button type="button" class="icon-btn danger" id="hapusLogo" title="Hapus logo" aria-label="Hapus logo">${icon('trash')}</button>` : ''}</div>
              <p class="small faint">Rasio 1:1, PNG atau JPG.</p>
            </div>
          </div>
          <div class="form-grid">
            <div class="field full"><label for="cNama">Nama lembaga <span class="req">*</span></label><input class="input" id="cNama" maxlength="120" value="${esc(S.NAMA_LEMBAGA)}"></div>
            <div class="field full"><label for="cSlogan">Slogan / visi singkat</label><input class="input" id="cSlogan" maxlength="200" value="${esc(S.SLOGAN)}"></div>
            <div class="field"><label for="cTahun">Tahun ajaran</label><input class="input" id="cTahun" maxlength="20" placeholder="2026/2027" value="${esc(S.TAHUN_AJARAN)}"></div>
            <div class="field"><label for="cReg">Nomor registrasi lembaga</label><input class="input" id="cReg" maxlength="80" value="${esc(S.NO_REGISTRASI)}" placeholder="Opsional"></div>
            <div class="field full"><label for="cMudir">Penanggung jawab utama (mudir)</label><input class="input" id="cMudir" maxlength="80" value="${esc(S.MUDIR)}" placeholder="Nama tampil di kolom tanda tangan rapor"></div>
          </div>
        </div>
        <div class="form-actions"><button class="btn btn-primary" type="submit" id="cSimpan">${icon('checkCircle', 18)} Simpan perubahan</button></div>
      </form>
    </div>

    <div class="mt-24" id="tabSurah" ${tab === 'surah' ? '' : 'hidden'}>
      <div class="grid grid-3">
        ${statCard({ label: 'Surah aktif', value: fmt(aktif.length), unit: `/ ${surah.length}`, iconName: 'checkCircle', foot: 'Tersedia di formulir setoran' })}
        ${statCard({ label: 'Total ayat surah aktif', value: fmt(totalAyat), iconName: 'layers', foot: aktif.length ? `Rata-rata ${fmt1(totalAyat / aktif.length)} ayat per surah` : '—' })}
        ${statCard({ label: 'Aktivitas setoran', value: fmt(totalSetoran), iconName: 'trend', foot: 'Baris setoran tercatat' })}
      </div>
      <section class="card table-card mt-24">
        <div class="card-head" style="padding:24px 24px 16px;margin:0">
          <div><h2>Master Surah Pendek</h2><p class="muted">Nomor surah tidak boleh kembar. Surah yang sudah dipakai dalam setoran hanya bisa dinonaktifkan.</p></div>
          <div class="row-gap">
            <div class="input-icon">${icon('search', 18)}<input class="input" id="srQ" type="search" placeholder="Cari surah latin atau Arab…" aria-label="Cari surah"></div>
            <button class="btn btn-primary" type="button" id="srAdd">${icon('plus', 18)} Tambah surah</button>
          </div>
        </div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>No.</th><th>Nama latin</th><th class="right">Nama Arab</th><th>Jumlah ayat</th><th>Frekuensi setoran</th><th>Status</th><th class="right">Aksi</th></tr></thead>
          <tbody id="srBody"></tbody>
        </table></div>
      </section>
    </div>
  `);

  // Tab
  $$('.tabs [data-tab]').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.tab;
    $$('.tabs [data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $('#tabIdentitas').hidden = t !== 'identitas';
    $('#tabSurah').hidden = t !== 'surah';
    history.replaceState(null, '', '#/pengaturan?tab=' + t);
  }));
  if (window.matchMedia('(max-width: 767px)').matches) $('#lembagaGrid').style.gridTemplateColumns = 'minmax(0,1fr)';

  // Identitas
  let logo = null, hapusLogo = false;
  $('#fLogo').addEventListener('change', async e => {
    try {
      logo = await readFilePayload(e.target.files[0], { maxDim: 400, quality: 0.9 });
      if (logo) { $('#logoPrev').innerHTML = `<img src="${logo.preview}" alt="">`; hapusLogo = false; }
    } catch (err) { toast(err.message, 'error'); e.target.value = ''; }
  });
  const hl = $('#hapusLogo');
  if (hl) hl.addEventListener('click', () => { hapusLogo = true; logo = null; $('#logoPrev').innerHTML = icon('image', 34); });
  $('#fLembaga').addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      NAMA_LEMBAGA: $('#cNama').value.trim(), SLOGAN: $('#cSlogan').value.trim(), TAHUN_AJARAN: $('#cTahun').value.trim(),
      NO_REGISTRASI: $('#cReg').value.trim(), MUDIR: $('#cMudir').value.trim(),
      logo: logo ? { data: logo.data, mime: logo.mime } : undefined, hapusLogo
    };
    if (!payload.NAMA_LEMBAGA) return toast('Nama lembaga wajib diisi.', 'error');
    const btn = $('#cSimpan');
    setBusy(btn, true);
    const r = await api.post('pengaturanSave', payload);
    setBusy(btn, false);
    if (!ensureOk(r)) return;
    applySettings(r.data);
    toast(r.message);
    logo = null; hapusLogo = false;
  });

  // Surah
  const drawSurah = () => {
    const q = normalize($('#srQ').value);
    const list = surah.filter(s => !q || normalize(s.nama).includes(q) || s.namaArab.includes($('#srQ').value.trim()) || String(s.nomor) === q);
    $('#srBody').innerHTML = list.length ? list.map(s => `<tr>
      <td><span class="rank-num">${s.nomor}</span></td>
      <td><strong>${esc(s.nama)}</strong></td>
      <td class="right">${arab(s.namaArab) || '<span class="faint">—</span>'}</td>
      <td>${pill(s.jumlahAyat + ' ayat', 'p-muted')}</td>
      <td><div class="row-gap" style="flex-wrap:nowrap;gap:10px"><div style="width:110px">${bar((s.dipakai / maxPakai) * 100)}</div><span class="small muted">Dipakai ${s.dipakai} kali</span></div></td>
      <td>${s.aktif ? pill('Aktif', 'p-ok', true) : pill('Nonaktif', 'p-muted', true)}</td>
      <td><div class="actions">
        <button class="btn btn-text btn-sm" type="button" data-toggle="${s.nomor}">${s.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>
        <button class="icon-btn" type="button" data-edit="${s.nomor}" title="Ubah" aria-label="Ubah surah ${esc(s.nama)}">${icon('edit')}</button>
        ${s.dipakai ? '' : `<button class="icon-btn danger" type="button" data-del="${s.nomor}" title="Hapus" aria-label="Hapus surah ${esc(s.nama)}">${icon('trash')}</button>`}
      </div></td></tr>`).join('') : `<tr><td colspan="7">${emptyState('Surah tidak ditemukan.', 'book')}</td></tr>`;

    $$('[data-edit]', $('#srBody')).forEach(b => b.addEventListener('click', () => surahModal(surah.find(s => s.nomor === Number(b.dataset.edit)))));
    $$('[data-toggle]', $('#srBody')).forEach(b => b.addEventListener('click', async () => {
      const s = surah.find(x => x.nomor === Number(b.dataset.toggle));
      setBusy(b, true, '');
      const r = await api.post('surahSave', { mode: 'edit', nomorLama: s.nomor, nomor: s.nomor, nama: s.nama, namaArab: s.namaArab, jumlahAyat: s.jumlahAyat, aktif: !s.aktif });
      setBusy(b, false);
      if (!ensureOk(r)) return;
      toast(`${s.nama} ${s.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`);
      s.aktif = !s.aktif;
      drawSurah();
    }));
    $$('[data-del]', $('#srBody')).forEach(b => b.addEventListener('click', async () => {
      const s = surah.find(x => x.nomor === Number(b.dataset.del));
      if (!await confirmBox(`Hapus surah ${s.nomor}. ${s.nama} dari daftar?`, { title: 'Hapus surah?', okText: 'Hapus' })) return;
      const r = await api.post('surahDelete', { nomor: s.nomor });
      if (!ensureOk(r)) return;
      toast(r.message);
      router();
    }));
  };
  $('#srQ').addEventListener('input', debounce(drawSurah));
  $('#srAdd').addEventListener('click', () => surahModal(null));
  drawSurah();
}

function surahModal(s) {
  const m = openModal({
    title: s ? 'Ubah Surah' : 'Tambah Surah Pendek Baru',
    subtitle: s && s.dipakai ? 'Nomor surah yang sudah dipakai dalam setoran tidak bisa diubah.' : 'Nomor urut sesuai mushaf (1–114).',
    body: `<form id="mSurah" class="stack" style="gap:16px" novalidate>
      <div class="form-grid">
        <div class="field"><label for="msNo">Nomor urut <span class="req">*</span></label><input class="input" id="msNo" type="number" min="1" max="114" value="${s ? s.nomor : ''}" ${s && s.dipakai ? 'readonly' : ''}></div>
        <div class="field"><label for="msAyat">Jumlah ayat <span class="req">*</span></label><input class="input" id="msAyat" type="number" min="1" max="286" value="${s ? s.jumlahAyat : ''}"></div>
        <div class="field"><label for="msNama">Nama latin <span class="req">*</span></label><input class="input" id="msNama" maxlength="40" value="${esc(s ? s.nama : '')}" placeholder="Contoh: Al-Kafirun"></div>
        <div class="field"><label for="msArab">Nama Arab</label><input class="input ar" id="msArab" dir="rtl" lang="ar" maxlength="40" value="${esc(s ? s.namaArab : '')}" placeholder="الكافرون" style="font-size:18px"></div>
      </div>
      <label class="check"><input type="checkbox" id="msAktif" ${!s || s.aktif ? 'checked' : ''}> Aktif (langsung tersedia di formulir setoran)</label>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" type="submit" id="msSimpan">Simpan surah</button></div>
    </form>`
  });
  $('#mSurah', m.el).addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      mode: s ? 'edit' : 'add', nomorLama: s ? s.nomor : undefined,
      nomor: Number($('#msNo', m.el).value), jumlahAyat: Number($('#msAyat', m.el).value),
      nama: $('#msNama', m.el).value.trim(), namaArab: $('#msArab', m.el).value.trim(),
      aktif: $('#msAktif', m.el).checked
    };
    if (!Number.isInteger(payload.nomor) || payload.nomor < 1 || payload.nomor > 114) return toast('Nomor surah harus 1 sampai 114.', 'error');
    if (!Number.isInteger(payload.jumlahAyat) || payload.jumlahAyat < 1) return toast('Isi jumlah ayat dengan benar.', 'error');
    if (!payload.nama) return toast('Nama latin wajib diisi.', 'error');
    const btn = $('#msSimpan', m.el);
    setBusy(btn, true);
    const r = await api.post('surahSave', payload);
    setBusy(btn, false);
    if (!ensureOk(r)) return;
    m.close();
    toast(r.message);
    state.surah = [];
    go('#/pengaturan?tab=surah');
  });
}
