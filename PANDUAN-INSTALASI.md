# Panduan Instalasi — Rindang Santri

Ada dua bagian yang dipasang terpisah:

| Bagian | Berkas | Dipasang di |
|---|---|---|
| Backend | `Kode.gs` | Google Apps Script (akun Google Anda) |
| Frontend | `rindang-santri.zip` | GitHub Pages |

Kerjakan **Bagian A dulu**, karena frontend membutuhkan URL dari backend.

---

## Bagian A — Backend (Google Apps Script)

### A1. Buat proyek
1. Buka https://script.google.com → **Proyek baru**.
2. Beri nama proyek, misalnya `Rindang Santri API`.
3. Hapus isi `Code.gs`, lalu **tempel seluruh isi `Kode.gs`**. Simpan (Ctrl+S).

### A2. Atur zona waktu proyek (disarankan)
Buka **Project Settings** (ikon roda gigi), lalu pada **Time zone** pilih `(GMT+08:00) Makassar`. Kode sudah memakai WITA, tetapi pengaturan ini menyamakan log dan riwayat versi.

### A3. Isi password admin awal (WAJIB sebelum setup)
1. Masih di **Project Settings**, gulir ke **Script Properties** → **Add script property**.
2. Tambahkan:
   - `ADMIN_INIT_PASSWORD` → password awal admin, **minimal 8 karakter berisi huruf dan angka**. Catat di tempat aman.
   - `ADMIN_USERNAME` → opsional. Jika tidak diisi, username admin adalah `admin`.
3. Klik **Save script properties**.

### A4. Jalankan setup — SATU KALI saja
1. Kembali ke **Editor**, pilih fungsi **`setupAppEnvironment`** di menu tarik-turun, lalu klik **▶ Run**.
2. Saat diminta izin: **Review permissions** → pilih akun Anda → **Advanced** → **Go to Rindang Santri API (unsafe)** → **Allow**.
   Peringatan "unsafe" muncul karena skrip ini buatan sendiri dan belum diverifikasi Google. Ini normal.
3. Buka **Execution log**, lalu pastikan muncul `✅ Setup selesai!`.
4. Di Google Drive kini ada folder **📁 Rindang Santri** berisi spreadsheet database dan tiga folder: Foto Santri, Bukti Donasi, Laporan PDF.

> ⚠️ Jangan jalankan `setupAppEnvironment` dua kali. Jika dicoba, skrip akan menolak dengan pesan "Setup sudah pernah dijalankan".

### A5. Deploy sebagai Web App
1. **Deploy** → **New deployment** → ikon roda gigi → **Web app**.
2. Isi:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
3. Klik **Deploy**, lalu **salin URL yang berakhiran `/exec`**.
4. Uji cepat: buka `URL-ANDA/exec?action=ranking` di browser. Jika muncul teks `{"success":true,...}`, backend sudah berjalan.

> Setiap kali `Kode.gs` diubah: **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. URL tetap sama.

### Lupa password admin?
Isi lagi `ADMIN_INIT_PASSWORD` di Script Properties dengan password baru, lalu jalankan fungsi **`resetPasswordAdmin`** dari editor. Setelah berhasil, hapus kembali property tersebut.

---

## Bagian B — Frontend (GitHub Pages)

### B1. Ekstrak ZIP dan isi URL backend
1. Ekstrak `rindang-santri.zip`. Hasilnya folder **`rindang-santri`**.
2. Buka `rindang-santri/js/config.js` dengan Notepad.
3. Ganti baris ini:
   ```javascript
   const GAS_URL = 'https://script.google.com/macros/s/XXXX/exec';
   ```
   dengan URL `/exec` dari langkah A5. Simpan.

### B2. Periksa folder yang akan diunggah
Folder **`rindang-santri`** adalah folder yang nanti di-`git init`. Isinya harus langsung seperti ini:
```
rindang-santri/
├── index.html      ← wajib di paling atas
├── css/style.css
├── js/config.js
├── js/api.js
├── js/ui.js
├── js/pages.js
├── js/app.js
├── README.md
└── PANDUAN-INSTALASI.md
```
`Kode.gs` **tidak** ikut diunggah ke GitHub.

### B3. Siapkan Git dan akun GitHub
1. Pasang Git: https://git-scm.com/download/win (pengaturan default).
2. Daftar akun di https://github.com jika belum punya.
3. Buka folder `rindang-santri` di File Explorer, klik address bar, ketik `powershell`, lalu Enter.
4. Jalankan `dir`. **Pastikan `index.html` terlihat.** Jika yang terlihat folder lain, Anda berada di folder yang salah.

### B4. Buat repository
Di github.com: **+** → **New repository** → nama `rindang-santri` → **Public** → **jangan** centang README/.gitignore/license → **Create repository**.

### B5. Unggah pertama kali (jalankan satu per satu di PowerShell)
```powershell
git config --global user.name "Nama Anda"
git config --global user.email "email-akun-github@contoh.com"
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/rindang-santri.git
git push -u origin main
```
Ganti `USERNAME` dengan username GitHub Anda. Perhatikan **titik** di akhir `git add .`

Saat diminta login:
- **Username**: username GitHub.
- **Password**: **Personal Access Token**, bukan password akun. Buat di https://github.com/settings/tokens → *Generate new token (classic)* → centang **repo** → *Generate* → salin token `ghp_...`.
- Saat menempel token, layar terlihat kosong. Itu normal. Tekan Enter.

Berhasil bila muncul `Writing objects: 100%` dan `* [new branch] main -> main`.

### B6. Aktifkan GitHub Pages
Repository → **Settings** → **Pages** → Source **Deploy from a branch** → Branch **main** / **(root)** → **Save**.
Tunggu 1–2 menit. Situs tersedia di `https://USERNAME.github.io/rindang-santri/`.

### B7. Memperbarui situs
```powershell
git add .
git commit -m "Deskripsi perubahan"
git push
```
Jika tampilan belum berubah, tekan **Ctrl+Shift+R**.

---

## Bagian C — Mulai memakai

1. Buka situs → **Masuk** dengan username admin dan `ADMIN_INIT_PASSWORD`. Setelah berhasil, hapus property itu dari Script Properties.
2. **Pengaturan** → isi nama lembaga, tahun ajaran, nama mudir, dan logo.
3. **Kelola Akun** → buat akun ustad dan donatur. Berikan username dan password awal kepada mereka secara langsung.
4. **Data Santri** → tambahkan santri dan pilih ustad pengajarnya.
5. **Data Donasi** → catat donasi agar donatur bisa melihat santri yang didukungnya.
6. Ustad masuk → **Catat Setoran Baru** setiap pekan.

---

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Banner kuning "belum terhubung ke backend" | `GAS_URL` belum diisi | Ikuti B1, lalu push ulang (B7) |
| "Tidak dapat terhubung ke server" | URL salah, atau Web App belum di-deploy untuk *Anyone* | Cek ulang A5 |
| Situs 404 | `index.html` tidak di root repository | Pastikan `git init` dijalankan di folder `rindang-santri` |
| Halaman tanpa warna/tata letak | Folder `css/` atau `js/` tidak ikut | Cek B2, lalu push ulang |
| "Sesi berakhir" | Sesi 6 jam habis, password diganti, atau akun dinonaktifkan | Masuk ulang |
| "Terlalu banyak percobaan gagal" | 5 kali salah password | Tunggu 15 menit, atau admin mengatur ulang password |
| Peringkat belum berubah | Cache 5 menit untuk halaman publik | Tunggu sebentar lalu muat ulang |
| Foto santri tidak tampil | Akun Google Workspace membatasi berbagi tautan | Minta admin Workspace mengizinkan berbagi "anyone with the link", atau biarkan tanpa foto |
| `Password authentication is not supported` | Git meminta password akun | Gunakan Personal Access Token (B5) |

## Catatan privasi
- Foto santri dan logo dibagikan lewat tautan agar bisa tampil di halaman publik. Foto bersifat opsional, jadi mintalah izin wali sebelum mengunggah foto anak.
- Bukti transfer donasi tetap privat dan hanya bisa dibuka oleh admin atau donatur yang bersangkutan.
- Buat salinan spreadsheet database secara berkala (File → Make a copy).
