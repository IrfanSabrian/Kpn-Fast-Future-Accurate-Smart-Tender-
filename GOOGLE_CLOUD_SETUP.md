# 🔧 Panduan Setup Google Cloud APIs - KPN FAST

Panduan lengkap untuk setup semua Google Cloud APIs yang dibutuhkan oleh KPN FAST.

---

## 📋 Overview

Anda akan setup 4 APIs:
1. **Google Gemini API** - Untuk AI generation (usulan teknis)
2. **Google Sheets API** - Untuk database (profil perusahaan & personil)
3. **Google Docs API** - Untuk generate dokumen output
4. **Google Drive API** - Untuk create folder & manage files

---

## 🚀 Step 1: Create Google Cloud Project

### 1.1 Buka Google Cloud Console
- Kunjungi: [https://console.cloud.google.com](https://console.cloud.google.com)
- Login dengan Google Account Anda

### 1.2 Create New Project
1. Klik dropdown **"Select a project"** di bagian atas
2. Klik **"New Project"**
3. Isi form:
   - **Project Name**: `KPN-FAST` (atau nama yang Anda mau)
   - **Location**: Organization (jika ada) atau No organization
4. Klik **"Create"**
5. Tunggu beberapa detik, lalu pilih project yang baru dibuat

---

## 🔌 Step 2: Enable APIs

### 2.1 Enable Google Gemini API (Generative AI)

1. Di Google Cloud Console, buka menu **"APIs & Services"** > **"Library"**
2. Search: `Generative Language API` atau `Gemini API`
3. Klik pada **"Generative Language API"**
4. Klik tombol **"Enable"**
5. Tunggu hingga proses enable selesai

**Catatan:** Jika Anda melihat "Gemini API" atau "Vertex AI API", gunakan **Generative Language API** untuk lebih mudah.

### 2.2 Enable Google Sheets API

1. Kembali ke **"APIs & Services"** > **"Library"**
2. Search: `Google Sheets API`
3. Klik pada **"Google Sheets API"**
4. Klik tombol **"Enable"**

### 2.3 Enable Google Docs API

1. Kembali ke **"APIs & Services"** > **"Library"**
2. Search: `Google Docs API`
3. Klik pada **"Google Docs API"**
4. Klik tombol **"Enable"**

### 2.4 Enable Google Drive API

1. Kembali ke **"APIs & Services"** > **"Library"**
2. Search: `Google Drive API`
3. Klik pada **"Google Drive API"**
4. Klik tombol **"Enable"**

✅ **Checklist:** Pastikan semua 4 APIs sudah enabled!

---

## 🔑 Step 3: Generate API Credentials

Ada 2 jenis credentials yang dibutuhkan:

### 3.1 API Key untuk Gemini (via Google AI Studio) ⭐ CARA TERMUDAH

**Gemini API Key TIDAK didapat dari Google Cloud Console biasa, tapi dari Google AI Studio!**

#### Cara Mendapatkan Gemini API Key:

1. **Buka Google AI Studio:**
   - URL: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Atau kunjungi: [https://ai.google.dev](https://ai.google.dev) → klik "Get API Key"

2. **Login dengan Google Account Anda**
   - Gunakan akun yang sama dengan Google Cloud Project

3. **Create API Key:**
   - Klik tombol **"Create API Key"**
   
4. **Pilih Google Cloud Project:**
   - Jika sudah punya project (dari Step 1): Pilih **"Create API key in existing project"**
   - Pilih project: **"KPN-FAST"** (atau nama project Anda)
   - Klik **"Create"**
   
   - Jika belum punya project: Pilih **"Create API key in new project"**
   - Google akan auto-create project untuk Anda

5. **Copy API Key:**
   - API Key akan muncul, contoh: `AIzaSyABC123def456GHI789jkl012MNO345pqr`
   - **Klik "Copy"** dan simpan di tempat aman
   - ⚠️ **PENTING:** API key hanya muncul sekali! Simpan sekarang!

6. **Test API Key (Optional):**
   - Di Google AI Studio, ada playground untuk test
   - Bisa langsung coba generate text

**Simpan API Key ini untuk `.env` nanti:**
```env
GOOGLE_GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
```

**Screenshot Reference:**
```
Google AI Studio → Get API Key → Create API Key
┌─────────────────────────────────────────────┐
│  Create API key                             │
├─────────────────────────────────────────────┤
│  ○ Create API key in new project           │
│  ● Create API key in existing project      │
│    Select project: [KPN-FAST ▼]            │
│                                              │
│  [Cancel]  [Create]                         │
└─────────────────────────────────────────────┘
```

**Alternative - Jika Tidak Muncul:**

Jika tombol "Create API Key" tidak muncul atau error:

1. **Enable Generative Language API dulu:**
   - Kembali ke [Google Cloud Console](https://console.cloud.google.com)
   - Pilih project KPN-FAST
   - **APIs & Services** > **Library**
   - Search: **"Generative Language API"**
   - Klik dan enable
   
2. **Retry di Google AI Studio:**
   - Kembali ke [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Klik "Create API Key" lagi

### 3.2 Service Account untuk Sheets, Docs, Drive (Server-to-Server)

Service Account digunakan agar aplikasi Node.js bisa akses Google Sheets, Docs, dan Drive secara otomatis.

#### A. Create Service Account

1. Buka **"APIs & Services"** > **"Credentials"**
2. Klik **"Create Credentials"** > **"Service Account"**

3. **Isi Service Account Details:**
   - **Service account name**: `kpn-fast-service`
   - **Service account ID**: `kpn-fast-service` (auto-generate)
   - **Description**: `Service account for KPN FAST automation`
   - Klik **"Create and Continue"**

4. **Grant Access to Project:**
   - Klik dropdown **"Select a role"**
   - Pilih: **"Editor"** (di bawah **Project**)
   - Klik **"Continue"**

5. **Grant Users Access (Optional):**
   - **Lewati saja** (jangan isi apa-apa)
   - Klik **"Done"**

✅ **Service Account berhasil dibuat!**

#### B. Generate Service Account Key (JSON)

1. Di halaman **"Credentials"**, scroll ke bagian **"Service Accounts"**
2. Klik pada service account yang baru dibuat (`kpn-fast-service@...`)
3. Klik tab **"Keys"**
4. Klik **"Add Key"** > **"Create new key"**
5. Pilih format: **"JSON"**
6. Klik **"Create"**
7. File JSON akan otomatis terdownload ke komputer Anda

**File JSON yang terdownload namanya seperti:**
```
kpn-fast-[project-id]-[hash].json
```

#### C. Simpan Service Account JSON

1. Rename file menjadi: `service-account.json`
2. Pindahkan ke folder project:
   ```
   d:\Project\CV KPN\Kpn-Fast(Future Accurate Smart Tender)\backend\credentials\service-account.json
   ```

**⚠️ PENTING:** File ini berisi private key, jangan commit ke Git!

#### D. Catat Service Account Email

Buka file `service-account.json`, cari field `client_email`:
```json
{
  "type": "service_account",
  "project_id": "kpn-fast-123456",
  "client_email": "kpn-fast-service@kpn-fast-123456.iam.gserviceaccount.com",
  ...
}
```

**Copy email ini**, Anda akan butuh untuk share Google Sheets nanti!

---

## 📊 Step 4: Setup Google Sheets Database

### 4.1 Create Google Sheets

#### Sheet 1: Data Profil Perusahaan

1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **"Blank"** untuk create new sheet
3. Rename sheet menjadi: `KPN FAST - Data Profil Perusahaan`
4. Buat header di baris 1:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| nama_perusahaan | npwp | alamat | telepon | email | direktur | bidang_usaha | tahun_berdiri | sertifikat_sbu |

5. Isi data perusahaan Anda di baris 2 (sesuai dokumen tender sebelumnya)

6. **Share dengan Service Account:**
   - Klik tombol **"Share"** di kanan atas
   - Paste email Service Account: `kpn-fast-service@...iam.gserviceaccount.com`
   - Permission: **"Editor"**
   - **UNCHECK** "Notify people" (karena ini bukan email manusia)
   - Klik **"Share"**

7. **Copy Sheet ID dari URL:**
   ```
   https://docs.google.com/spreadsheets/d/1ABC...xyz/edit
                                              ^^^^^^^^
                                              Ini Sheet ID
   ```

#### Sheet 2: Data Personil/Tenaga Ahli

1. Create new Google Sheet
2. Rename: `KPN FAST - Data Personil`
3. Buat header di baris 1:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| id_personil | nama | posisi | pendidikan | pengalaman_tahun | sertifikat | email | telepon | cv_file_url |

4. Isi data tenaga ahli (dari dokumen tender sebelumnya)
5. **Share dengan Service Account** (sama seperti Sheet 1)
6. **Copy Sheet ID**

### 4.2 Test Access (Opsional)

Untuk memastikan Service Account bisa akses:
1. Buka Google Sheets
2. Klik **"File"** > **"Share"** > **"Share with others"**
3. Pastikan email Service Account ada di list dengan permission "Editor"

---

## 🔐 Step 5: Update Environment Variables

### 5.1 Buat File `.env` di Backend

File: `backend/.env`

```env
# ======================
# Server Configuration
# ======================
NODE_ENV=development
PORT=5000

# ======================
# Google APIs
# ======================

# Gemini API (untuk AI generation)
GOOGLE_GEMINI_API_KEY=AIzaSyABC123...xyz

# Google Sheets IDs (copy dari URL sheets)
GOOGLE_SHEET_ID_PROFIL=1ABC...xyz
GOOGLE_SHEET_ID_PERSONIL=1DEF...xyz

# Service Account - Path ke JSON file
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/service-account.json

# ======================
# Google Drive Output Folder
# ======================
# Folder ID di Google Drive tempat output akan disimpan
# Biarkan kosong dulu, nanti akan dibuat otomatis
GOOGLE_DRIVE_OUTPUT_FOLDER_ID=

# ======================
# JWT Secret (untuk authentication)
# ======================
# Generate random string, bisa pakai: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_random_secret_key_here_min_32_characters

# ======================
# Frontend URL (untuk CORS)
# ======================
FRONTEND_URL=http://localhost:3000
```

### 5.2 Cara Mengisi Values

1. **GOOGLE_GEMINI_API_KEY**: Paste API Key dari Step 3.1
2. **GOOGLE_SHEET_ID_PROFIL**: Paste Sheet ID dari URL Sheet 1
3. **GOOGLE_SHEET_ID_PERSONIL**: Paste Sheet ID dari URL Sheet 2
4. **GOOGLE_SERVICE_ACCOUNT_PATH**: Biarkan `./credentials/service-account.json`
5. **JWT_SECRET**: Generate random string dengan command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

## ✅ Step 6: Verify Setup

### 6.1 Check Files

Pastikan struktur folder seperti ini:
```
backend/
├── credentials/
│   ├── service-account.json  ✅ (ada)
│   └── .gitignore            ✅ (agar tidak ke-commit)
├── .env                      ✅ (ada)
├── .env.example              ✅ (template)
└── ...
```

### 6.2 Verify .env Variables

Buka terminal di folder `backend/`, jalankan:
```bash
node -e "require('dotenv').config(); console.log('Gemini API:', process.env.GOOGLE_GEMINI_API_KEY ? '✅ OK' : '❌ Missing'); console.log('Sheet Profil:', process.env.GOOGLE_SHEET_ID_PROFIL ? '✅ OK' : '❌ Missing'); console.log('Sheet Personil:', process.env.GOOGLE_SHEET_ID_PERSONIL ? '✅ OK' : '❌ Missing')"
```

Output yang diharapkan:
```
Gemini API: ✅ OK
Sheet Profil: ✅ OK
Sheet Personil: ✅ OK
```

### 6.3 Test Google Sheets Connection

Saya akan buatkan test script untuk verify koneksi ke Google Sheets.

---

## 🎯 Next Steps

Setelah setup ini selesai:
1. ✅ APIs sudah enabled
2. ✅ Credentials sudah dibuat
3. ✅ Google Sheets database sudah ready
4. ✅ `.env` sudah terisi

**Selanjutnya:**
- Saya akan buatkan service untuk fetch data dari Google Sheets
- Test koneksi end-to-end
- Mulai implement PDF/Excel parser

---

## ❓ Troubleshooting

### Error: "The caller does not have permission"
- Pastikan Service Account email sudah di-share ke Google Sheets
- Check permission minimal "Editor"

### Error: "API Key not valid"
- Pastikan API Key copied dengan benar (tidak ada spasi)
- Check API restrictions di Google Cloud Console

### Error: "File not found: service-account.json"
- Pastikan file JSON ada di `backend/credentials/service-account.json`
- Check path di `.env` sesuai dengan lokasi file

---

## 📚 Resources

- [Google Cloud Console](https://console.cloud.google.com)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Docs API Documentation](https://developers.google.com/docs/api)
- [Google Gemini API Documentation](https://ai.google.dev/docs)

---

**🎉 Selamat! Setup Google Cloud APIs selesai!**

Jika ada error atau pertanyaan, silakan beritahu saya!
