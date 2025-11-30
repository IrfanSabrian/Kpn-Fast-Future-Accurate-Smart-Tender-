# 📋 Environment Variables Cheat Sheet

Quick reference untuk semua environment variables yang dibutuhkan.

---

## 🎯 Quick Overview

```
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (.env)                         │
├─────────────────────────────────────────────────────────┤
│ ✅ WAJIB diisi:                                         │
│   - GOOGLE_GEMINI_API_KEY                               │
│   - GOOGLE_SHEET_ID_PROFIL                              │
│   - GOOGLE_SHEET_ID_PERSONIL                            │
│   - JWT_SECRET                                          │
│                                                          │
│ ✅ Sudah default (jangan diubah):                       │
│   - NODE_ENV=development                                │
│   - PORT=5000                                           │
│   - GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/...       │
│   - MAX_FILE_SIZE=52428800                              │
│   - UPLOAD_PATH=./uploads                               │
│   - FRONTEND_URL=http://localhost:3000                  │
│                                                          │
│ ⚪ Optional (biarkan kosong):                           │
│   - GOOGLE_DRIVE_OUTPUT_FOLDER_ID                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (.env)                        │
├─────────────────────────────────────────────────────────┤
│ ✅ Sudah default (biasanya TIDAK perlu diubah):         │
│   - NUXT_PUBLIC_API_BASE_URL=http://localhost:5000/api  │
│   - NUXT_PUBLIC_APP_NAME=KPN FAST                       │
│   - NUXT_PUBLIC_APP_VERSION=1.0.0                       │
│   - NUXT_PUBLIC_GDRIVE_VIEWER_URL=...                   │
│                                                          │
│ ⚪ Optional (bisa di-customize):                        │
│   - NUXT_PUBLIC_DEFAULT_THEME                           │
│   - NUXT_PUBLIC_PRIMARY_COLOR                           │
│   - NUXT_PUBLIC_DEBUG_MODE                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Values yang WAJIB Diisi - Backend

### 1. GOOGLE_GEMINI_API_KEY
```env
GOOGLE_GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
```

**Cara mendapatkan:**
1. Buka: https://console.cloud.google.com
2. Pilih project → APIs & Services → Credentials
3. Create Credentials → API Key
4. Copy dan paste

---

### 2. GOOGLE_SHEET_ID_PROFIL
```env
GOOGLE_SHEET_ID_PROFIL=1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

**Cara mendapatkan:**
1. Buka Google Sheet: Data Profil Perusahaan
2. Lihat URL browser:
   ```
   https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                           Ini yang di-copy
   ```
3. Copy dan paste

**⚠️ PENTING:** Pastikan sheet sudah di-share dengan Service Account!

---

### 3. GOOGLE_SHEET_ID_PERSONIL
```env
GOOGLE_SHEET_ID_PERSONIL=1ZyXwVuTsRqPoNmLkJiHgFeDcBa0987654321
```

**Cara mendapatkan:** Sama seperti Sheet ID Profil (lihat di atas)

**⚠️ PENTING:** Pastikan sheet sudah di-share dengan Service Account!

---

### 4. JWT_SECRET
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Cara generate:**

**PowerShell / Terminal:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output contoh:**
```
8f3d2e9c1b7a6f5e4d3c2b1a0987654321fedcba9876543210abcdef
```

Copy output dan paste sebagai JWT_SECRET.

**⚠️ PENTING:** 
- Minimal 32 karakter
- Jangan pakai contoh di atas, generate yang baru!
- Simpan dengan aman (gunanya untuk security)

---

## 📝 Contoh File .env yang Sudah Diisi

### Backend (.env)
```env
# ========================================
# 1. SERVER CONFIGURATION
# ========================================
NODE_ENV=development
PORT=5000

# ========================================
# 2. GOOGLE GEMINI API
# ========================================
GOOGLE_GEMINI_API_KEY=AIzaSyDExampleKey123456789abcdefghijklmnop

# ========================================
# 3. GOOGLE SHEETS DATABASE
# ========================================
GOOGLE_SHEET_ID_PROFIL=1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
GOOGLE_SHEET_ID_PERSONIL=1ZyXwVuTsRqPoNmLkJiHgFeDcBa0987654321

# ========================================
# 4. SERVICE ACCOUNT
# ========================================
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/service-account.json

# ========================================
# 5. GOOGLE DRIVE OUTPUT
# ========================================
GOOGLE_DRIVE_OUTPUT_FOLDER_ID=

# ========================================
# 6. JWT AUTHENTICATION
# ========================================
JWT_SECRET=8f3d2e9c1b7a6f5e4d3c2b1a0987654321fedcba
JWT_EXPIRES_IN=7d

# ========================================
# 7. FILE UPLOAD
# ========================================
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# ========================================
# 8. FRONTEND URL
# ========================================
FRONTEND_URL=http://localhost:3000

# ========================================
# 9. OPTIONAL
# ========================================
LOG_LEVEL=debug
ENABLE_API_LOGGING=true
```

---

### Frontend (.env)
```env
# ========================================
# 1. BACKEND API
# ========================================
NUXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# ========================================
# 2. APPLICATION INFO
# ========================================
NUXT_PUBLIC_APP_NAME=KPN FAST
NUXT_PUBLIC_APP_VERSION=1.0.0
NUXT_PUBLIC_APP_DESCRIPTION=Fast And Smart Technology - Sistem Automasi Dokumen Pengadaan

# ========================================
# 3. GOOGLE DRIVE
# ========================================
NUXT_PUBLIC_GDRIVE_VIEWER_URL=https://drive.google.com/file/d/
NUXT_PUBLIC_GDRIVE_FOLDER_URL=https://drive.google.com/drive/folders/

# ========================================
# 4. FEATURE FLAGS
# ========================================
NUXT_PUBLIC_ENABLE_AI_FEATURES=true
NUXT_PUBLIC_ENABLE_DOCUMENT_PREVIEW=true
NUXT_PUBLIC_DEBUG_MODE=true

# ========================================
# 5. UI CONFIG
# ========================================
NUXT_PUBLIC_DEFAULT_THEME=light
NUXT_PUBLIC_PRIMARY_COLOR=3b82f6

# ========================================
# 6. FILE UPLOAD
# ========================================
NUXT_PUBLIC_MAX_FILE_SIZE_MB=50
NUXT_PUBLIC_ALLOWED_PDF_EXTENSIONS=.pdf
NUXT_PUBLIC_ALLOWED_EXCEL_EXTENSIONS=.xlsx,.xls
```

---

## ✅ Checklist - Apa yang Harus Diisi?

### Backend .env
- [ ] `GOOGLE_GEMINI_API_KEY` ← **WAJIB**
- [ ] `GOOGLE_SHEET_ID_PROFIL` ← **WAJIB**
- [ ] `GOOGLE_SHEET_ID_PERSONIL` ← **WAJIB**
- [ ] `JWT_SECRET` ← **WAJIB**
- [x] `GOOGLE_SERVICE_ACCOUNT_PATH` ← Sudah default (jangan diubah)
- [x] `NODE_ENV` ← Sudah default
- [x] `PORT` ← Sudah default
- [x] `MAX_FILE_SIZE` ← Sudah default
- [x] `UPLOAD_PATH` ← Sudah default
- [x] `FRONTEND_URL` ← Sudah default

### Frontend .env
- [x] **SEMUA sudah default** - copy saja, tidak perlu diubah

---

## ⚡ Quick Copy Template

Jika ingin cepat, copy template di bawah dan replace values:

```env
# Backend .env - MINIMAL VERSION (isi yang WAJIB saja)

NODE_ENV=development
PORT=5000

GOOGLE_GEMINI_API_KEY=PASTE_API_KEY_DI_SINI
GOOGLE_SHEET_ID_PROFIL=PASTE_SHEET_ID_1_DI_SINI
GOOGLE_SHEET_ID_PERSONIL=PASTE_SHEET_ID_2_DI_SINI

GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/service-account.json
GOOGLE_DRIVE_OUTPUT_FOLDER_ID=

JWT_SECRET=PASTE_GENERATED_SECRET_DI_SINI
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3000

LOG_LEVEL=debug
ENABLE_API_LOGGING=true
```

**Replace:**
1. `PASTE_API_KEY_DI_SINI` → Gemini API Key
2. `PASTE_SHEET_ID_1_DI_SINI` → Sheet ID Profil
3. `PASTE_SHEET_ID_2_DI_SINI` → Sheet ID Personil
4. `PASTE_GENERATED_SECRET_DI_SINI` → Generated JWT Secret

---

## 🧪 Verification Command

Setelah isi semua values, verify dengan:

```powershell
cd backend
node -e "require('dotenv').config(); console.log('✅ Gemini API:', process.env.GOOGLE_GEMINI_API_KEY ? 'OK' : '❌ MISSING'); console.log('✅ Sheet Profil:', process.env.GOOGLE_SHEET_ID_PROFIL ? 'OK' : '❌ MISSING'); console.log('✅ Sheet Personil:', process.env.GOOGLE_SHEET_ID_PERSONIL ? 'OK' : '❌ MISSING'); console.log('✅ JWT Secret:', process.env.JWT_SECRET ? 'OK' : '❌ MISSING');"
```

**Expected output:**
```
✅ Gemini API: OK
✅ Sheet Profil: OK
✅ Sheet Personil: OK
✅ JWT Secret: OK
```

Jika ada yang MISSING, berarti value belum diisi!

---

## 🆘 Common Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| Lupa copy `.env.example` ke `.env` | File tidak ada | `cp .env.example .env` |
| Copy Sheet ID tapi include full URL | Format salah | Copy hanya ID-nya (bagian di tengah URL) |
| JWT_SECRET terlalu pendek | Security risk | Minimal 32 karakter, pakai generated |
| Sheet belum di-share | Permission error | Share dengan Service Account email |
| API Key salah/expired | 403 error | Generate ulang di Google Cloud |

---

## 📚 Related Guides

- 📖 [Full ENV Setup Guide](./backend/ENV_SETUP_GUIDE.md)
- 🔐 [Google Cloud Setup](./GOOGLE_CLOUD_SETUP.md)
- 📋 [Copy ENV Guide](./COPY_ENV_GUIDE.md)
- 🧪 [Test Connection](./backend/test-google-sheets.js)

---

**Last Updated:** 2025-11-30  
**Quick Tip:** Simpan file ini untuk reference cepat saat setup! 📌
