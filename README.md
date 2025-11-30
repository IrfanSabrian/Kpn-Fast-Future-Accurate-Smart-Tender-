<div align="center">

# 🚀 KPN FAST

**Fast And Smart Technology**  
*Sistem Automasi Dokumen Pengadaan Berbasis AI*

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Nuxt.js](https://img.shields.io/badge/Nuxt.js-3.x-00DC82.svg)](https://nuxt.com/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![Google Sheets](https://img.shields.io/badge/Database-Google%20Sheets-34A853.svg)](https://www.google.com/sheets/about/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [API Docs](./backend/API_DOCUMENTATION.md) • [Roadmap](#-roadmap)

</div>

---

## 📋 **Overview**

**KPN FAST** adalah aplikasi web yang mengotomatisasi proses pembuatan dokumen pengadaan (tender) menggunakan teknologi AI. Sistem ini membantu kontraktor dan konsultan dalam menyusun dokumen tender secara cepat, akurat, dan konsisten.

### **Problem Statement**
- Pembuatan dokumen tender manual memakan waktu 3-7 hari
- Tingkat kesalahan tinggi dalam input data
- Inkonsistensi format antar dokumen
- Duplikasi data personil dan profil perusahaan

### **Solution**
- ⚡ **Automasi 90%** proses pembuatan dokumen
- 🤖 **AI-powered** content generation dengan Google Gemini
- 📊 **Centralized data** menggunakan Google Sheets
- 📄 **One-click** document export ke Google Docs & PDF

---

## ✨ **Features**

### **🏢 Company Profile Management**
- Multi-company support
- CRUD operations via REST API
- Real-time sync dengan Google Sheets
- Auto-generated company IDs

### **👥 Personnel Management**
- Manage tenaga ahli/SDM
- Track pengalaman & sertifikasi
- Reusable across multiple tenders
- Search & filter capabilities

### **📄 Document Generation** *(Coming Soon)*
- Upload KAK (PDF) & HPS (Excel)
- Auto-extract data menggunakan AI
- Generate 10+ dokumen tender otomatis
- Export ke Google Docs & PDF

### **🤖 AI Integration** *(Coming Soon)*
- Google Gemini 1.5 Flash
- Smart content generation
- Context-aware responses
- Template customization

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                      Nuxt.js + Vue 3                        │
│                    Tailwind CSS + Pinia                     │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│                    Node.js + Express                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Company    │  │   Personnel  │  │   Document   │    │
│  │  Controller  │  │  Controller  │  │  Controller  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │             │
│  ┌──────▼─────────────────▼──────────────────▼───────┐   │
│  │         Google Sheets Service                      │   │
│  │         Gemini AI Service                          │   │
│  │         Document Parser Service                    │   │
│  └────────────────────────┬───────────────────────────┘   │
└───────────────────────────┼───────────────────────────────┘
                            │
            ┌───────────────┴────────────────┐
            │                                │
    ┌───────▼────────┐            ┌─────────▼──────┐
    │ Google Sheets  │            │  Google Gemini  │
    │   (Database)   │            │   (AI Engine)   │
    └────────────────┘            └─────────────────┘
            │                                │
    ┌───────▼────────┐            ┌─────────▼──────┐
    │  Google Docs   │            │  Google Drive   │
    │   (Output)     │            │   (Storage)     │
    └────────────────┘            └─────────────────┘
```

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Framework:** Nuxt.js 3.x (Vue 3)
- **Styling:** Tailwind CSS
- **State Management:** Pinia
- **HTTP Client:** Axios / Fetch API

### **Backend**
- **Runtime:** Node.js 18.x
- **Framework:** Express.js 4.x
- **Database:** Google Sheets API
- **AI Engine:** Google Gemini 1.5 Flash
- **File Processing:** PDF-parse, ExcelJS
- **Authentication:** JWT *(Coming Soon)*

### **Infrastructure**
- **Cloud Platform:** Google Cloud Platform
- **APIs:**
  - Google Sheets API
  - Google Docs API
  - Google Drive API
  - Google Gemini API
- **Authentication:** Service Account (OAuth 2.0)

---

## 📦 **Installation**

### **Prerequisites**
- Node.js 18.x or higher
- npm or yarn
- Google Cloud Account
- Google Sheets dengan service account access

### **1. Clone Repository**
```bash
git clone https://github.com/your-username/kpn-fast.git
cd kpn-fast
```

### **2. Backend Setup**

```bash
cd backend
npm install
```

**Configure Environment:**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and fill in your credentials
# See backend/.env.example for details
```

**Required Environment Variables:**
- `GOOGLE_GEMINI_API_KEY` - From Google AI Studio
- `GOOGLE_SHEET_ID_PROFIL` - Company profiles sheet
- `GOOGLE_SHEET_ID_PERSONIL` - Personnel sheet
- `GOOGLE_SERVICE_ACCOUNT_PATH` - Path to service account JSON
- `JWT_SECRET` - Random 32+ character string

**Test Connection:**
```bash
node test-google-sheets.js
```

**Start Backend Server:**
```bash
npm run dev
```

Server running at: `http://localhost:5000`

### **3. Frontend Setup**

```bash
cd frontend
npm install
```

**Configure Environment:**
```bash
# Copy .env.example to .env
cp .env.example .env

# Default values should work for local development
```

**Start Frontend Server:**
```bash
npm run dev
```

Frontend running at: `http://localhost:3000`

---

## 📚 **Documentation**

- **[API Endpoints](./backend/API_ENDPOINTS.md)** - Quick API reference
- **[Development Roadmap](./ROADMAP.md)** - Feature timeline & milestones
- **[Environment Setup](./backend/.env.example)** - Configuration guide
- **[Test Scripts](./backend/scripts/README.md)** - Testing utilities

---

## 🚀 **Usage**

### **API Endpoints**

#### **Company Profiles**
```bash
GET    /api/company          # Get all companies
GET    /api/company/:id      # Get company by ID
POST   /api/company          # Add new company
PUT    /api/company/:id      # Update company
DELETE /api/company/:id      # Delete company
```

#### **Personnel**
```bash
GET    /api/personnel        # Get all personnel
GET    /api/personnel/:id    # Get personnel by ID
POST   /api/personnel        # Add new personnel
PUT    /api/personnel/:id    # Update personnel
DELETE /api/personnel/:id    # Delete personnel
```

**See [API Documentation](./backend/API_DOCUMENTATION.md) for detailed examples.**

---

## 🗺️ **Roadmap**

### **✅ Phase 1: Foundation (COMPLETED)**
- [x] Project structure setup
- [x] Google Cloud APIs integration
- [x] Google Sheets as database
- [x] Company profile CRUD
- [x] Personnel CRUD
- [x] REST API implementation

### **🔄 Phase 2: Document Processing (IN PROGRESS)**
- [ ] PDF parser (KAK extraction)
- [ ] Excel parser (HPS/RAB extraction)
- [ ] Data validation & cleaning
- [ ] Template engine

### **📋 Phase 3: AI Integration**
- [ ] Gemini AI service
- [ ] Prompt engineering
- [ ] Content generation
- [ ] Usulan teknis automation

### **🎨 Phase 4: Frontend Development**
- [ ] Dashboard UI
- [ ] Company management page
- [ ] Personnel management page
- [ ] Document upload interface
- [ ] Generated documents preview

### **🚀 Phase 5: Deployment**
- [ ] Production environment setup
- [ ] CI/CD pipeline
- [ ] Monitoring & logging
- [ ] Performance optimization

**See [ROADMAP.md](./ROADMAP.md) for detailed timeline.**

---

## 🧪 **Testing**

### **Backend Tests**
```bash
cd backend

# Test Google Sheets connection
node test-google-sheets.js

# Run all tests (when implemented)
npm test
```

### **API Testing with cURL**
```bash
# Get all companies
curl http://localhost:5000/api/company

# Add new company
curl -X POST http://localhost:5000/api/company \
  -H "Content-Type: application/json" \
  -d '{"nama_perusahaan":"PT ABC","npwp":"12.345.678.9-012.000"}'
```

---

## 🤝 **Contributing**

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Developer**

**CV Karya Profesional Nusantara**
- Website: [kpn.co.id](https://kpn.co.id)
- Email: info@kpn.co.id

---

## 🙏 **Acknowledgments**

- Google Cloud Platform for cloud infrastructure
- Google Gemini for AI capabilities
- Nuxt.js & Vue.js community
- Express.js community

---

<div align="center">

**Made with ❤️ by CV Karya Profesional Nusantara**

</div>
