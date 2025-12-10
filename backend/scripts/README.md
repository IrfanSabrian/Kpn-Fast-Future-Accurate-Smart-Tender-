# 🧪 Scripts - Testing & Utilities

Folder untuk test scripts dan utility tools.

---

## 📁 **Files**

### **test-google-sheets.js**
Test koneksi ke Google Sheets API dan verify setup.

**Usage:**
```bash
cd backend
node scripts/test-google-sheets.js
```

**What it does:**
- ✅ Check environment variables
- ✅ Verify service account file
- ✅ Test Google Sheets connection
- ✅ Read sample data dari Profil & Personel sheets

**Expected output:**
```
🎉 ALL TESTS PASSED!
✅ Your Google Sheets connection is working perfectly!
```

---

### **debug-sheets.js**
Debug script untuk troubleshoot Google Sheets issues.

**Usage:**
```bash
cd backend
node scripts/debug-sheets.js
```

**What it does:**
- 🔍 Display raw data dari Google Sheets
- 🔍 Show row counts
- 🔍 Debug API responses

---

## 🚀 **How to Run**

All scripts harus dijalankan dari **backend directory**:

```bash
# Navigate to backend
cd d:\Project\CV KPN\Kpn-Fast(Future Accurate Smart Tender)\backend

# Run test
node scripts/test-google-sheets.js

# Run debug
node scripts/debug-sheets.js
```

---

## 📝 **Adding New Scripts**

Simpan script baru di folder ini dengan format:
- `test-*.js` - untuk testing
- `debug-*.js` - untuk debugging
- `seed-*.js` - untuk seed data
- `migrate-*.js` - untuk migrations

---

**Last Updated:** 2025-11-30
