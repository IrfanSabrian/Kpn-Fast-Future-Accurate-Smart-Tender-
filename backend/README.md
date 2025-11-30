# KPN FAST - Backend Server

Backend API server untuk sistem automasi dokumen pengadaan KPN FAST (Fast And Smart Technology).

## 🚀 Teknologi

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Google Gemini AI** - AI text generation
- **Google Docs API** - Document generation
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

## 📝 API Documentation

API documentation akan dibuat setelah routes selesai diimplementasi.

## 🔐 Security

- Helmet.js untuk security headers
- CORS enabled
- JWT untuk authentication
- bcrypt untuk password hashing
- Input validation dengan express-validator
