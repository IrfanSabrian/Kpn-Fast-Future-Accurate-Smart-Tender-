# 🔐 Panduan Cepat Setup File .env

File ini adalah panduan singkat untuk setup file `.env` di folder `backend/`.

## 📝 Step-by-Step

### 1. Copy Template
```bash
# Di folder backend/
cp .env.example .env
```

Atau jika command tidak jalan, copy manual:
- Source: `.env.example`
- Destination: `.env` (di folder yang sama)

### 2. Isi Values di File .env

Buka file `.env` dengan text editor (VSCode/Notepad++), lalu isi nilai-nilai berikut:

---

#### 🔑 A. GOOGLE_GEMINI_API_KEY

**Cara mendapatkan:**
1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Pilih project KPN-FAST
3. **APIs & Services** > **Credentials**
4. **Create Credentials** > **API Key**
5. Copy API key yang dibuat

**Paste di .env:**
```env
GOOGLE_GEMINI_API_KEY=AIzaSyABC123...xyz
```

---

#### 📊 B. GOOGLE_SHEET_ID_PROFIL & GOOGLE_SHEET_ID_PERSONIL

**Cara mendapatkan:**
1. Buka Google Sheets yang sudah dibuat:
   - Sheet 1: Data Profil Perusahaan
   - Sheet 2: Data Personil
2. Copy ID dari URL:
   ```
   https://docs.google.com/spreadsheets/d/1ABC...xyz/edit
                                              ^^^^^^^^
                                              Ini Sheet ID
   ```

**Paste di .env:**
```env
GOOGLE_SHEET_ID_PROFIL=1ABC...xyz
GOOGLE_SHEET_ID_PERSONIL=1DEF...xyz
```

**⚠️ PENTING:** Pastikan kedua sheets sudah di-share dengan Service Account email!

---

#### 🔐 C. GOOGLE_SERVICE_ACCOUNT_PATH

**Cara setup:**
1. Download Service Account JSON dari Google Cloud Console
2. Rename menjadi: `service-account.json`
3. Pindahkan ke: `backend/credentials/service-account.json`

**Di .env, value-nya sudah default:**
```env
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/service-account.json
```

**Jangan ganti** kecuali Anda simpan file di lokasi lain.

---

#### 🔑 D. JWT_SECRET

**Cara generate:**

Buka terminal/PowerShell, jalankan:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output contoh:
```
a1b2c3d4e5f6...
```

**Paste di .env:**
```env
JWT_SECRET=a1b2c3d4e5f6...
```

---

#### ⚙️ E. Values Lain (Optional)

Biarkan default, sudah OK:
```env
NODE_ENV=development
PORT=5000
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3000
```

**GOOGLE_DRIVE_OUTPUT_FOLDER_ID:** Biarkan kosong, akan auto-create.

---

## ✅ Contoh File .env yang Sudah Lengkap

```env
# ======================
# Server Configuration
# ======================
NODE_ENV=development
PORT=5000

# ======================
# Google APIs
# ======================

# Gemini API
GOOGLE_GEMINI_API_KEY=AIzaSyDExampleKey123456789abcdefgh

# Google Sheets Database
GOOGLE_SHEET_ID_PROFIL=1AbCdEfGhIjKlMnOpQrStUvWxYz
GOOGLE_SHEET_ID_PERSONIL=1ZyXwVuTsRqPoNmLkJiHgFeDcBa

# Service Account
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/service-account.json

# ======================
# Google Drive Output
# ======================
GOOGLE_DRIVE_OUTPUT_FOLDER_ID=

# ======================
# JWT Authentication
# ======================
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
JWT_EXPIRES_IN=7d

# ======================
# Upload Configuration
# ======================
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# ======================
# Frontend Configuration
# ======================
FRONTEND_URL=http://localhost:3000
```

---

## 🔍 Verifikasi Setup

Setelah file `.env` selesai diisi, verify dengan:

```bash
# Di folder backend/
node -e "require('dotenv').config(); console.log('✅ Gemini API:', process.env.GOOGLE_GEMINI_API_KEY ? 'OK' : 'MISSING'); console.log('✅ Sheet Profil:', process.env.GOOGLE_SHEET_ID_PROFIL ? 'OK' : 'MISSING'); console.log('✅ Sheet Personil:', process.env.GOOGLE_SHEET_ID_PERSONIL ? 'OK' : 'MISSING'); console.log('✅ JWT Secret:', process.env.JWT_SECRET ? 'OK' : 'MISSING');"
```

**Expected output:**
```
✅ Gemini API: OK
✅ Sheet Profil: OK
✅ Sheet Personil: OK
✅ JWT Secret: OK
```

Jika ada yang "MISSING", berarti value belum diisi!

---

## 📚 Panduan Lengkap

Untuk panduan lengkap setup Google Cloud APIs, lihat:
**[GOOGLE_CLOUD_SETUP.md](../../GOOGLE_CLOUD_SETUP.md)**

---

## ❓ Troubleshooting

### Error: "Cannot find module 'dotenv'"
```bash
npm install
```

### File .env tidak ada setelah copy
- Pastikan copy dari `.env.example` ke `.env` (dengan titik di depan)
- Di Windows, enable "Show hidden files"

### Values masih kosong setelah diisi
- Pastikan save file setelah edit
- Restart terminal/IDE setelah edit .env

---

**✨ Selamat! File .env sudah ready!**

Next step: Test koneksi ke Google Sheets (saya akan buatkan test script).
