# KPN FAST - Development Setup Checklist

## ✅ Setup Selesai

### Backend ✅
- [x] Project structure
- [x] package.json dengan dependencies lengkap
- [x] Express.js server setup
- [x] PostgreSQL database configuration
- [x] Database schema (semua tabel)
- [x] Environment variables template
- [x] README dengan instruksi

### Frontend ✅
- [x] Nuxt.js 4 installation
- [x] Tailwind CSS setup
- [x] Pinia stores (auth, project)
- [x] Design system (colors, components)
- [x] Global CSS dengan utilities
- [x] Environment variables template
- [x] README dengan instruksi

## 📋 Yang Harus Disiapkan Selanjutnya

### ✅ 1. Google Cloud Setup (READY - Lihat Panduan)
**Untuk fitur AI, Google Sheets Database, dan Google Drive:**

📖 **PANDUAN LENGKAP:** [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)

- [ ] Buat/gunakan Google Cloud Project
- [ ] Enable APIs:
  - [ ] Google Gemini API (untuk AI generation)
  - [ ] Google Sheets API (untuk database)
  - [ ] Google Docs API (untuk output dokumen)
  - [ ] Google Drive API (untuk folder management)
- [ ] Generate credentials:
  - [ ] Gemini API Key
  - [ ] Service Account Key (JSON file)
- [ ] Download Service Account JSON
- [ ] Simpan ke: `backend/credentials/service-account.json`

**📚 Resources:**
- Setup Guide: `GOOGLE_CLOUD_SETUP.md`
- Env Guide: `backend/ENV_SETUP_GUIDE.md`
- Test Script: `backend/test-google-sheets.js`

### ✅ 2. Google Sheets Database Setup (Menggantikan PostgreSQL)
**Google Sheets sebagai database untuk data statis:**

📖 **PANDUAN:** [GOOGLE_CLOUD_SETUP.md - Step 4](./GOOGLE_CLOUD_SETUP.md)

- [ ] Buat Google Sheet 1: **Data Profil Perusahaan**
  - Kolom: nama_perusahaan, npwp, alamat, telepon, email, direktur, bidang_usaha, tahun_berdiri, sertifikat_sbu
  - Isi data dari dokumen tender sebelumnya
  - Share dengan Service Account email (permission: Editor)
  - Copy Sheet ID dari URL
  
- [ ] Buat Google Sheet 2: **Data Personil/Tenaga Ahli**
  - Kolom: id_personil, nama, posisi, pendidikan, pengalaman_tahun, sertifikat, email, telepon, cv_file_url
  - Isi data tenaga ahli dari dokumen tender sebelumnya
  - Share dengan Service Account email (permission: Editor)
  - Copy Sheet ID dari URL

### 3. Environment Variables Setup

📖 **PANDUAN:** [backend/ENV_SETUP_GUIDE.md](./backend/ENV_SETUP_GUIDE.md)

**Backend** (`backend/.env`)

Cara setup:
```bash
# Copy template
cd backend
cp .env.example .env
```

Lalu isi values berikut di file `.env`:

```env
# Yang HARUS diisi:
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_SHEET_ID_PROFIL=your_sheet_id_here
GOOGLE_SHEET_ID_PERSONIL=your_sheet_id_here
JWT_SECRET=generate_random_string_32_chars

# Sudah default (tidak perlu diubah):
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/service-account.json
NODE_ENV=development
PORT=5000
```

**Frontend** (`frontend/.env`)
```env
# Biasanya cukup default:
NUXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

**Test koneksi:**
```bash
cd backend
node test-google-sheets.js
```

### 4. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 5. Data Awal (Seed Data)

**✅ Data disimpan di Google Sheets (bukan SQL):**
- [ ] Isi data profil perusahaan di Google Sheet 1
  - Ambil dari dokumen tender sebelumnya
  - Minimal 1 row data perusahaan lengkap
  
- [ ] Isi data personil di Google Sheet 2
  - Ambil dari dokumen tender sebelumnya  
  - Minimal 3-5 tenaga ahli
  - Include: nama, posisi, pendidikan, pengalaman

**Tidak perlu SQL seeder**, cukup isi langsung di Google Sheets!

## 🚦 Checklist Prioritas Implementasi

### Phase 1: Authentication & Core Setup (PRIORITY)
- [ ] Backend: Auth routes (register, login, logout)
- [ ] Backend: Auth middleware (JWT verification)
- [ ] Frontend: Login page
- [ ] Frontend: Dashboard layout dengan navbar
- [ ] Test: Login flow end-to-end

### Phase 2: Data Management
- [ ] Backend: Company profile CRUD
- [ ] Backend: Personnel CRUD
- [ ] Frontend: Company profile page
- [ ] Frontend: Personnel management page

### Phase 3: Project Management
- [ ] Backend: Project CRUD routes
- [ ] Backend: File upload handling (multer)
- [ ] Frontend: Project list page
- [ ] Frontend: Create project page dengan upload

### Phase 4: Document Processing (Core Feature)
- [ ] Backend: PDF parser service
- [ ] Backend: Excel parser service
- [ ] Backend: Template engine service
- [ ] Backend: Calculation utilities (penawaran, terbilang)

### Phase 5: AI Integration
- [ ] Backend: Google Gemini service
- [ ] Frontend: AI review interface
- [ ] Backend: AI generation routes
- [ ] Test: AI generation flow

### Phase 6: Google Drive Integration
- [ ] Backend: Google Docs API service
- [ ] Backend: Google Drive folder creation
- [ ] Backend: Document generation to GDocs
- [ ] Frontend: View generated documents

### Phase 7: Polish & Testing
- [ ] Error handling improvement
- [ ] Loading states
- [ ] Validation messages
- [ ] Responsive design testing
- [ ] End-to-end testing

## ❓ Yang Saya Butuhkan Dari Anda

Untuk melanjutkan development, saya perlu tahu:

### 1. **Google Cloud Credentials**
Apakah sudah punya:
- Google Gemini API key?
- Google OAuth credentials?
- Atau perlu panduan cara mendapatkannya?

### 2. **Database**
- PostgreSQL sudah terinstall?
- Perlu bantuan setup database?
- Ada preferensi untuk database name/user?

### 3. **Data Perusahaan**
Untuk data company profile & personil:
- Ada data yang sudah siap?
- Atau pakai dummy data untuk testing dulu?

### 4. **Prioritas Fitur**
Fitur mana yang ingin dikerjakan dulu?
- Option A: Mulai dari auth & basic CRUD
- Option B: Langsung ke upload & parsing
- Option C: Fokus ke AI integration dulu
- Option D: Sesuai checklist di atas (recommended)

### 5. **Template Dokumen**
- Sudah ada template Google Docs?
- Atau perlu buat template baru?
- Format dokumen seperti apa?

### 6. **Testing Data**
Untuk testing:
- Ada contoh PDF KAK?
- Ada contoh Excel HPS/RAB?
- Atau bisa pakai dummy?

---

**Silakan beritahu apa yang sudah Anda miliki dan apa yang perlu saya bantu setup lebih dulu!**
