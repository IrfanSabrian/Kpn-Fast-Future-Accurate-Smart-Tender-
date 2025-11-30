# 🚀 Quick Start - Copy Environment Files

Panduan cepat untuk copy file `.env` dari template.

---

## 📋 Cara Copy .env Files

### **Method 1: Manual Copy (Windows Explorer)**

#### Backend:
1. Buka folder: `backend/`
2. Copy file: `.env.example`
3. Paste di folder yang sama
4. Rename hasil paste menjadi: `.env`

#### Frontend:
1. Buka folder: `frontend/`
2. Copy file: `.env.example`
3. Paste di folder yang sama
4. Rename hasil paste menjadi: `.env`

---

### **Method 2: PowerShell Commands**

Buka PowerShell di root folder project, lalu jalankan:

```powershell
# Copy backend .env
Copy-Item -Path "backend\.env.example" -Destination "backend\.env"

# Copy frontend .env
Copy-Item -Path "frontend\.env.example" -Destination "frontend\.env"

# Verify files created
Get-ChildItem -Path "backend\.env", "frontend\.env"
```

Expected output:
```
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---          11/30/2025  5:00 PM           5432 .env
-a---          11/30/2025  5:00 PM           2876 .env
```

---

### **Method 3: Git Bash / WSL**

Jika menggunakan Git Bash atau WSL:

```bash
# Copy backend .env
cp backend/.env.example backend/.env

# Copy frontend .env
cp frontend/.env.example frontend/.env

# Verify files created
ls -la backend/.env frontend/.env
```

---

## ✅ Verification

Setelah copy, pastikan file `.env` sudah ada:

```powershell
# Check backend .env
Test-Path "backend\.env"
# Output: True

# Check frontend .env
Test-Path "frontend\.env"
# Output: True
```

Atau manual check:
- ✅ File `backend\.env` exists
- ✅ File `frontend\.env` exists

---

## 📝 Next Steps

### **1. Edit Backend .env**

Buka file: `backend\.env` dengan text editor (VSCode/Notepad++)

Isi values berikut (lihat panduan: [ENV_SETUP_GUIDE.md](./backend/ENV_SETUP_GUIDE.md)):

```env
GOOGLE_GEMINI_API_KEY=AIzaSy...       # ← Paste API Key dari Google Cloud
GOOGLE_SHEET_ID_PROFIL=1AbCdE...      # ← Paste Sheet ID 1
GOOGLE_SHEET_ID_PERSONIL=1FgHiJ...    # ← Paste Sheet ID 2
JWT_SECRET=a1b2c3d4e5f6...            # ← Generate dengan command
```

Generate JWT_SECRET:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **2. Edit Frontend .env (Optional)**

Buka file: `frontend\.env`

**Default values sudah OK**, biasanya TIDAK perlu diubah kecuali:
- Backend ada di server lain (bukan localhost)
- Ingin custom app name/theme

---

## 🧪 Test Setup

Setelah mengisi `backend\.env`, test koneksi:

```powershell
cd backend
npm install
node test-google-sheets.js
```

Expected output:
```
🎉 ALL TESTS PASSED!
✅ Your Google Sheets connection is working perfectly!
```

---

## ⚠️ Important Notes

### **Security:**
- ✅ File `.env` sudah di-gitignore (tidak akan ter-commit)
- ❌ JANGAN share file `.env` ke orang lain
- ❌ JANGAN commit file `.env` ke Git
- ❌ JANGAN upload file `.env` ke internet

### **Backup:**
- Simpan copy `.env` di tempat aman (gunakan password manager)
- Jika work di tim, tiap orang buat `.env` sendiri

### **Production:**
Untuk deployment production:
- Update `NODE_ENV=production`
- Update `FRONTEND_URL` dengan domain production
- Update `NUXT_PUBLIC_API_BASE_URL` di frontend `.env`

---

## 🆘 Troubleshooting

### Error: "File .env not found"
**Solusi:**
- Pastikan copy dari `.env.example` (dengan dot di depan)
- Enable "Show hidden files" di Windows Explorer
- Check di VSCode file explorer (hidden files muncul)

### Error: "Permission denied" saat copy
**Solusi:**
- Run PowerShell as Administrator
- Atau copy manual via Windows Explorer

### File .env kosong setelah copy?
**Solusi:**
- Pastikan `.env.example` tidak kosong
- Re-copy dengan method lain

---

## 📚 Related Guides

- 📖 [Backend ENV Setup Guide](./backend/ENV_SETUP_GUIDE.md)
- 🔐 [Google Cloud Setup](./GOOGLE_CLOUD_SETUP.md)
- 🧪 [Test Google Sheets Connection](./backend/test-google-sheets.js)
- 📋 [Setup Checklist](./SETUP_CHECKLIST.md)

---

**Quick Command Summary:**

```powershell
# 1. Copy both .env files
Copy-Item -Path "backend\.env.example" -Destination "backend\.env"
Copy-Item -Path "frontend\.env.example" -Destination "frontend\.env"

# 2. Edit backend .env (with text editor)
code backend\.env

# 3. Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Test connection
cd backend
npm install
node test-google-sheets.js
```

---

**Status:** 📝 Ready to setup environment variables
