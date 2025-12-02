# KPN FAST - Backend Server

Backend API server untuk sistem automasi dokumen pengadaan KPN FAST (Fast And Smart Technology).

## 🚀 Teknologi

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Google Gemini AI** - AI text generation
- **Google Docs API** - Document generation
- **Google Sheets API** - Database storage
- **Google Drive API** - Folder management & file storage
- **PDF Parse** - PDF extraction
- **XLSX** - Excel parsing

## 📋 Prerequisites

- Node.js v18+ 
- PostgreSQL v14+
- Google Cloud Project dengan Gemini API & Google Docs API enabled

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` dan isi semua konfigurasi yang dibutuhkan

4. Setup database PostgreSQL:
```bash
# Buat database baru
createdb kpn_fast_db

# Run schema
psql -d kpn_fast_db -f src/database/schema.sql
```

## 🏃 Running

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📁 Struktur Folder

```
backend/
├── src/
│   ├── server.js              # Main server file
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── database/
│   │   └── schema.sql         # Database schema
│   ├── routes/                # API routes (akan dibuat)
│   ├── controllers/           # Request handlers (akan dibuat)
│   ├── services/              # Business logic (akan dibuat)
│   ├── middlewares/           # Express middlewares (akan dibuat)
│   └── utils/                 # Utility functions (akan dibuat)
├── uploads/                   # Uploaded files
├── .env                       # Environment variables
├── .env.example              # Environment template
└── package.json              # Dependencies
```

## 🔑 Environment Variables

Lihat file `.env.example` untuk daftar lengkap environment variables yang dibutuhkan.

Variabel penting untuk Google Drive:
- `GOOGLE_DRIVE_PARENT_FOLDER_ID` - (Optional) ID folder parent di Google Drive untuk menyimpan folder perusahaan

## ✨ Fitur Utama

### Auto-Create Folder untuk Perusahaan Baru

Saat menambahkan perusahaan baru melalui API, sistem akan **otomatis membuat folder** di Google Drive dengan format:

```
01.(Nama Perusahaan)
02.(Nama Perusahaan)
03.(Nama Perusahaan)
...
```

Nomor urut di-generate otomatis berdasarkan jumlah perusahaan yang sudah ada.

**Contoh:**
- Perusahaan pertama: `01.(CV Karya Profesional Nusantara)`
- Perusahaan kedua: `02.(PT Teknologi Maju)`
- Perusahaan ketiga: `03.(CV Digital Solution)`

Folder dibuat di lokasi yang ditentukan oleh `GOOGLE_DRIVE_PARENT_FOLDER_ID` (jika diset), atau di root Drive jika tidak diset.

### Auto-Rename Folder saat Nama Perusahaan Berubah

Saat nama perusahaan diubah melalui API, sistem akan **otomatis mengubah nama folder** di Google Drive sambil mempertahankan nomor urutnya.

**Contoh:**
- Sebelum: `01.(CV Karya Profesional Nusantara)`
- Setelah diubah menjadi "CV KPN Digital": `01.(CV KPN Digital)`

**Fitur:**
- ✅ Deteksi otomatis perubahan nama
- ✅ Nomor urut tetap sama
- ✅ Error handling: Jika rename folder gagal, data perusahaan tetap tersimpan
- ✅ Log detail untuk debugging

### Auto-Delete Folder saat Perusahaan Dihapus

Saat perusahaan dihapus melalui API, sistem akan **otomatis menghapus folder** terkait di Google Drive.

**Contoh:**
- Menghapus perusahaan "CV Karya Profesional Nusantara"
- Folder `01.(CV Karya Profesional Nusantara)` otomatis terhapus dari Drive

**Fitur:**
- ✅ Auto-delete folder saat hapus perusahaan
- ✅ Cascade delete: Folder beserta isinya terhapus
- ✅ Error handling: Jika delete folder gagal, data perusahaan tetap terhapus dari Sheets
- ✅ Log detail untuk tracking

**Catatan Penting:**
- ⚠️ Folder yang dihapus akan masuk ke **Trash** di Google Drive (dapat dipulihkan dalam 30 hari)
- ⚠️ Untuk penghapusan permanen, hapus dari Trash secara manual

### Auto-Manage Folder Project di Dalam Folder Perusahaan

Saat mengelola project perusahaan, sistem akan **otomatis mengelola subfolder project** di dalam folder perusahaan.

**Struktur Folder:**
```
01.(CV Karya Profesional Nusantara)/
  ├── 01.(Proyek Jalan Raya A)
  ├── 02.(Proyek Jembatan B)
  └── 03.(Proyek Gedung C)

02.(PT Teknologi Maju)/
  ├── 01.(Website Company Profile)
  └── 02.(Sistem ERP)
```

**Fitur CREATE Project:**
- ✅ Auto-create subfolder di dalam folder perusahaan
- ✅ Nomor urut berdasarkan jumlah project perusahaan
- ✅ Format: `[nomor].(Nama Project)`

**Fitur UPDATE Project (Edit Nama):**
- ✅ Auto-rename folder project
- ✅ Nomor urut tetap sama
- ✅ Tetap di dalam folder perusahaan yang sama

**Fitur DELETE Project:**
- ✅ Auto-delete subfolder project
- ✅ Masuk ke Trash (dapat dipulihkan)

**Contoh Workflow:**
```
1. Buat Project Baru:
   Input: "Proyek Jalan Raya A" untuk CV KPN
   Hasil: 01.(CV KPN)/01.(Proyek Jalan Raya A)

2. Edit Nama Project:
   Input: Ubah jadi "Proyek Jalan Tol A"
   Hasil: 01.(CV KPN)/01.(Proyek Jalan Tol A)

3. Hapus Project:
   Hasil: Folder 01.(Proyek Jalan Tol A) masuk Trash
```

## 📝 API Documentation

API documentation akan dibuat setelah routes selesai diimplementasi.

## 🔐 Security

- Helmet.js untuk security headers
- CORS enabled
- JWT untuk authentication
- bcrypt untuk password hashing
- Input validation dengan express-validator
