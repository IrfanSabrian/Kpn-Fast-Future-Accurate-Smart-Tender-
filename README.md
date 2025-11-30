# 🚀 KPN FAST - Fast And Smart Technology

**Sistem Automasi Dokumen Pengadaan dengan AI**

Sistem ini mengotomasi pembuatan dokumen-dokumen pengadaan dengan memanfaatkan AI (Google Gemini) dan integrasi Google Drive. Upload PDF KAK dan Excel HPS/RAB, biarkan sistem menggenerate semua dokumen yang dibutuhkan secara otomatis.

## 📊 Arsitektur Sistem

```
┌─────────────────────┐
│   Frontend (Nuxt)   │
│   Port: 3000        │
└──────────┬──────────┘
           │
           │ HTTP/REST API
           │
┌──────────▼──────────┐      ┌──────────────────────┐
│  Backend (Node.js)  │◄────►│  Google Sheets DB    │
│   Port: 5000        │      │  (Profil + Personil) │
└──────────┬──────────┘      └──────────────────────┘
           │
           ├────► Google Gemini API (AI Generation)
           │
           ├────► Google Docs API (Document Creation)
           │
           └────► Google Drive API (Output Storage)
                        │
                        ▼
                  Google Drive
                  (Hasil Dokumen)
```

## 📦 Struktur Project

```
Kpn-Fast/
├── 📖 GOOGLE_CLOUD_SETUP.md     # Panduan setup Google Cloud APIs
├── 📋 SETUP_CHECKLIST.md        # Checklist setup keseluruhan
├── 🗺️ ROADMAP.md                # Roadmap development
├── 📗 QUICK_REFERENCE.md        # Quick reference semua panduan
├── README.md                    # This file
│
├── backend/                     # Node.js Backend Server
│   ├── 🔐 ENV_SETUP_GUIDE.md   # Panduan mengisi .env
│   ├── 🧪 test-google-sheets.js # Test script koneksi
│   ├── credentials/
│   │   ├── service-account.json # Google Service Account (DOWNLOAD)
│   │   ├── README.md
│   │   └── .gitignore
│   ├── src/
│   │   ├── server.js            # Main server
│   │   ├── routes/              # API routes (akan dibuat)
│   │   ├── controllers/         # Request handlers (akan dibuat)
│   │   ├── services/            # Business logic (akan dibuat)
│   │   │   ├── googleSheets.js  # Google Sheets integration
│   │   │   ├── pdf-parser.js    # PDF extraction
│   │   │   ├── excel-parser.js  # Excel parsing
│   │   │   ├── gemini.js        # AI integration
│   │   │   └── gdocs.js         # Google Docs API
│   │   ├── middlewares/         # Middlewares (akan dibuat)
│   │   └── utils/               # Utilities (akan dibuat)
│   ├── uploads/                 # Temporary uploads
│   ├── .env                     # Environment variables
│   ├── .env.example             # Template .env
│   └── package.json
│
├── frontend/                    # Nuxt.js Frontend
│   ├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css         # Global styles
│   ├── components/              # Vue components (akan dibuat)
│   ├── layouts/                 # Layouts (akan dibuat)
│   ├── pages/                   # Pages/Routes (akan dibuat)
│   ├── stores/                  # Pinia stores
│   │   ├── auth.js
│   │   └── project.js
│   ├── .env                     # Environment variables
│   └── package.json
```

## 🎯 Fitur Utama

### 1. **Upload & Parsing**
- Upload PDF KAK (Kerangka Acuan Kerja)
- Upload Excel HPS/RAB (Harga Perkiraan Sendiri / Rencana Anggaran Biaya)
- Otomatis extract informasi penting

### 2. **Jalur Automasi Statis (Admin)**
- Template-based document generation
- Kalkulasi penawaran otomatis
- Konversi angka ke terbilang
- Generate dokumen Cover, SPK, Surat Penawaran

### 3. **Jalur AI GenAI (Usulan Teknis)**
- Google Gemini AI untuk generate konten
- Role: Tenaga Ahli Profesional
- User review & revisi draft AI
- Generate Metodologi Teknis, CV & Ijazah

### 4. **Integrasi Google Drive**
- Otomatis create folder project terstruktur (00-14)
- Generate dokumen langsung ke Google Docs
- Folder structure:
  - 00. COVER & SPK
  - 02. PENAWARAN
  - 04. USULAN TEKNIS
  - 05. TENAGA AHLI
  - 06-14. Dan folder lainnya...

### 5. **Google Sheets Database**
- **Data Profil Perusahaan**: Legalitas, NPWP, alamat, dll
- **Data Personil**: Tenaga ahli, sertifikat, pengalaman
- **Mudah di-update**: Langsung edit di Google Sheets
- **Tidak perlu PostgreSQL**: Database cloud-based

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: ✨ Google Sheets API (cloud-based)
- **AI**: Google Gemini API
- **Document**: Google Docs API
- **Storage**: Google Drive API
- **PDF Parser**: pdf-parse
- **Excel Parser**: xlsx
- **Security**: helmet, bcrypt, JWT

### Frontend
- **Framework**: Nuxt.js 4
- **UI**: Vue 3 + Tailwind CSS
- **State**: Pinia
- **HTTP**: Axios
- **Utils**: VueUse

## 🚀 Quick Start

### 📖 **PANDUAN LENGKAP: Lihat File-File Berikut**

| File | Deskripsi |
|------|-----------|
| **[GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)** | Setup Google Cloud APIs (Gemini, Sheets, Docs, Drive) |
| **[ENV_SETUP_GUIDE.md](./backend/ENV_SETUP_GUIDE.md)** | Cara mengisi file `.env` |
| **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** | Checklist setup keseluruhan |
| **[ROADMAP.md](./ROADMAP.md)** | Roadmap development lengkap |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Quick reference semua panduan |

---

### 1. Prerequisites

Pastikan sudah terinstall:
- ✅ **Node.js v18+**
- ✅ **Google Cloud Project** dengan APIs enabled:
  - Google Gemini API
  - Google Sheets API
  - Google Docs API
  - Google Drive API
- ✅ **Service Account credentials** (JSON file)
- ✅ **2 Google Sheets** untuk database:
  - Sheet 1: Data Profil Perusahaan
  - Sheet 2: Data Personil

### 2. Setup Backend

📖 **Ikuti panduan lengkap:** [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env - isi dengan values dari Google Cloud Console
# Lihat panduan: backend/ENV_SETUP_GUIDE.md

# Test koneksi ke Google Sheets
node test-google-sheets.js
# Harus output: 🎉 ALL TESTS PASSED!

# Run server
npm run dev
```

Backend akan berjalan di: `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env jika perlu (default sudah OK)

# Run development server
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

## ⚙️ Konfigurasi

### Backend Environment Variables

📖 **Panduan lengkap:** [backend/ENV_SETUP_GUIDE.md](./backend/ENV_SETUP_GUIDE.md)

Edit file `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Google Sheets Database
GOOGLE_SHEET_ID_PROFIL=your_profil_sheet_id_here
GOOGLE_SHEET_ID_PERSONIL=your_personil_sheet_id_here

# Service Account
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/service-account.json

# JWT Authentication
JWT_SECRET=your_random_secret_32_chars
JWT_EXPIRES_IN=7d

# Upload Config
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Edit file `frontend/.env`:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NUXT_PUBLIC_APP_NAME=KPN FAST
```

## 📚 Google Sheets Database Structure

Database menggunakan Google Sheets dengan 2 sheets:

### Sheet 1: Data Profil Perusahaan
| Kolom | Deskripsi |
|-------|-----------|
| nama_perusahaan | Nama lengkap perusahaan |
| npwp | Nomor NPWP |
| alamat | Alamat kantor |
| telepon | Nomor telepon |
| email | Email perusahaan |
| direktur | Nama direktur |
| bidang_usaha | Bidang usaha |
| tahun_berdiri | Tahun pendirian |
| sertifikat_sbu | Nomor sertifikat |

### Sheet 2: Data Personil/Tenaga Ahli
| Kolom | Deskripsi |
|-------|-----------|
| id_personil | ID unik personil |
| nama | Nama lengkap |
| posisi | Jabatan/keahlian |
| pendidikan | Pendidikan terakhir |
| pengalaman_tahun | Lama pengalaman (tahun) |
| sertifikat | Sertifikat yang dimiliki |
| email | Email |
| telepon | Nomor telepon |
| cv_file_url | Link Google Drive ke CV |

📖 **Panduan setup:** [GOOGLE_CLOUD_SETUP.md - Step 4](./GOOGLE_CLOUD_SETUP.md)

## 🔄 Development Flow

1. **User Upload** → PDF KAK & Excel HPS/RAB
2. **Backend Parse** → Extract informasi
3. **Routing**:
   - Data Admin → Template Engine → Kalkulasi → Google Docs
   - Teks KAK → Gemini AI → User Review → Google Docs
4. **Output** → Dokumen tersimpan di Google Drive

## 📝 Next Steps (Yang Perlu Dibuat)

### Backend:
- [ ] Routes (auth, projects, documents, personnel, company)
- [ ] Controllers untuk handle requests
- [ ] Services:
  - [ ] PDF parser service
  - [ ] Excel parser service
  - [ ] Gemini AI service
  - [ ] Google Docs API service
  - [ ] Template engine
  - [ ] Calculation utilities
- [ ] Middlewares (auth, validation, upload)
- [ ] Model/Repository pattern untuk database

### Frontend:
- [ ] Layouts (default, dashboard)
- [ ] Pages:
  - [ ] Login/Register
  - [ ] Dashboard
  - [ ] Projects list & detail
  - [ ] Upload files
  - [ ] Document generation interface
  - [ ] AI review interface
  - [ ] Company & Personnel management
- [ ] Components:
  - [ ] Navigation
  - [ ] File uploader
  - [ ] Document viewer
  - [ ] AI editor
  - [ ] Tables & forms
- [ ] Composables untuk API calls
- [ ] Middleware untuk auth guard

## 🎨 Design Principles

- **Modern UI**: Gradient colors, glass effects, smooth animations
- **Responsive**: Mobile-first design
- **User-Friendly**: Intuitive interface untuk upload dan review
- **Professional**: Sesuai untuk aplikasi bisnis

## 🔐 Security

- JWT authentication
- Password hashing dengan bcrypt
- Input validation
- SQL injection protection
- XSS prevention
- CORS configuration
- Helmet security headers

## 📄 License

Proprietary - KPN (Konsultan Perencanaan Nusantara)

## 👨‍💻 Developer

Dibuat untuk CV KPN oleh Tim Development

---

**Status**: 🟡 Setup Complete - Ready for Development

Struktur project sudah siap, sekarang tinggal implementasi fitur-fitur utama.
