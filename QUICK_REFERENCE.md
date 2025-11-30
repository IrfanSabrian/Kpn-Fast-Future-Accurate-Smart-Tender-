# 📚 Quick Reference - Setup Guides

Panduan cepat untuk semua file dokumentasi setup KPN FAST.

---

## 🗂️ File Structure

```
KPN-FAST/
├── 📖 GOOGLE_CLOUD_SETUP.md          ← Panduan lengkap setup Google Cloud APIs
├── 📋 SETUP_CHECKLIST.md             ← Checklist keseluruhan setup
├── README.md                         ← Project overview
└── backend/
    ├── 🔐 ENV_SETUP_GUIDE.md         ← Cara mengisi file .env
    ├── 🧪 test-google-sheets.js      ← Test script koneksi Google Sheets
    ├── .env.example                  ← Template environment variables
    └── credentials/
        ├── README.md                 ← Info tentang credentials folder
        ├── .gitignore                ← Protection untuk credentials
        └── service-account.json      ← (DOWNLOAD dari Google Cloud)
```

---

## 🎯 Setup Flow (Urutan yang Disarankan)

### Phase 1: Google Cloud Setup
1. **Baca:** `GOOGLE_CLOUD_SETUP.md`
2. **Kerjakan:**
   - Create Google Cloud Project
   - Enable 4 APIs (Gemini, Sheets, Docs, Drive)
   - Generate Gemini API Key
   - Create Service Account
   - Download Service Account JSON
3. **Simpan:** `service-account.json` → `backend/credentials/`

### Phase 2: Google Sheets Database
1. **Baca:** `GOOGLE_CLOUD_SETUP.md` - Step 4
2. **Kerjakan:**
   - Create Sheet 1: Data Profil Perusahaan
   - Create Sheet 2: Data Personil
   - Isi data dari dokumen tender sebelumnya
   - Share kedua sheets dengan Service Account email
3. **Copy:** Sheet IDs dari URL

### Phase 3: Environment Variables
1. **Baca:** `backend/ENV_SETUP_GUIDE.md`
2. **Kerjakan:**
   ```bash
   cd backend
   cp .env.example .env
   ```
3. **Isi:** Values di file `.env`:
   - GOOGLE_GEMINI_API_KEY
   - GOOGLE_SHEET_ID_PROFIL
   - GOOGLE_SHEET_ID_PERSONIL
   - JWT_SECRET (generate dengan command di guide)

### Phase 4: Test Connection
1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```
2. **Run test:**
   ```bash
   node test-google-sheets.js
   ```
3. **Expected:** Semua test ✅ PASSED

---

## 📖 Panduan Per Use Case

### "Saya baru mulai setup"
→ Mulai dari: `SETUP_CHECKLIST.md`

### "Saya mau setup Google Cloud APIs"
→ Baca: `GOOGLE_CLOUD_SETUP.md`

### "Saya sudah download service account, sekarang apa?"
→ Baca: `backend/credentials/README.md`

### "Saya mau isi file .env"
→ Baca: `backend/ENV_SETUP_GUIDE.md`

### "Saya mau test koneksi Google Sheets"
→ Run: `backend/test-google-sheets.js`

### "Error saat test koneksi"
→ Check:
1. Service account JSON file exists?
2. Google Sheets sudah di-share?
3. Sheet IDs benar di .env?
4. Lihat error messages di test output

---

## ✅ Verification Checklist

Setelah selesai semua setup, pastikan:

- [ ] File `backend/credentials/service-account.json` exists
- [ ] File `backend/.env` exists dan terisi lengkap
- [ ] 2 Google Sheets sudah dibuat dan terisi data
- [ ] Kedua sheets sudah di-share dengan Service Account email
- [ ] `npm install` di backend sudah dijalankan
- [ ] Test script `node test-google-sheets.js` passed ✅

---

## 🆘 Troubleshooting

### Error: "Permission denied" saat test
**Solusi:**
- Buka Google Sheets → Share → tambahkan service account email
- Permission: Editor
- Uncheck "Notify people"

### Error: "File not found: service-account.json"
**Solusi:**
- Download ulang dari Google Cloud Console
- Rename menjadi `service-account.json`
- Simpan di `backend/credentials/`

### Error: "API Key not valid"
**Solusi:**
- Generate ulang di Google Cloud Console
- Copy dan paste dengan hati-hati (no spasi)
- Update di `.env`

### Error: "Sheet not found"
**Solusi:**
- Check Sheet ID di URL benar?
- Paste hanya ID-nya (tanpa full URL)
- Update di `.env`

---

## 📞 Need Help?

1. **Check dokumentasi:**
   - GOOGLE_CLOUD_SETUP.md untuk setup APIs
   - ENV_SETUP_GUIDE.md untuk .env
   - SETUP_CHECKLIST.md untuk overview

2. **Run test script:**
   ```bash
   cd backend
   node test-google-sheets.js
   ```
   Error messages biasanya sangat jelas!

3. **Verify manually:**
   - Service account file exists?
   - .env file terisi lengkap?
   - Google Sheets accessible?

---

## 🎉 Next Steps After Setup

Setelah semua setup selesai:

1. **Test koneksi** (harus passed!)
2. **Mulai development:**
   - Implement Google Sheets service
   - Build PDF/Excel parser
   - Create template engine
   - Integrate Gemini AI
   - Build frontend

3. **Follow roadmap di:** `SETUP_CHECKLIST.md` bagian "Checklist Prioritas Implementasi"

---

**Last Updated:** 2025-11-30
**Version:** 1.0
