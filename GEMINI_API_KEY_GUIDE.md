# 🔑 Quick Guide - Mendapatkan Gemini API Key

Panduan singkat untuk mendapatkan Google Gemini API Key dengan benar.

---

## ⚠️ **PENTING: Gemini API Key ≠ Google Cloud Console Credentials**

**Gemini API Key TIDAK didapat dari:**
- ❌ Google Cloud Console → APIs & Services → Credentials
- ❌ "Create Credentials" → "API Key" (yang di Console)

**Gemini API Key didapat dari:**
- ✅ **Google AI Studio** (platform terpisah)
- ✅ URL: https://aistudio.google.com/app/apikey

---

## 🚀 **Langkah-Langkah (5 Menit)**

### **Step 1: Buka Google AI Studio**

**Direct Link:**
- 🔗 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

Atau alternate:
- 🔗 [https://ai.google.dev](https://ai.google.dev) → Klik "Get API Key"

---

### **Step 2: Login**

- Login dengan **Google Account** Anda
- Gunakan akun yang sama yang dipakai untuk Google Cloud Project
- Atau akun Google biasa (personal/workspace)

---

### **Step 3: Create API Key**

Anda akan melihat halaman seperti ini:

```
┌──────────────────────────────────────────┐
│  Get an API key                          │
│                                          │
│  To use Gemini API in your app, you'll  │
│  need an API key.                        │
│                                          │
│  [Create API Key]                        │
└──────────────────────────────────────────┘
```

**Klik tombol:** **"Create API Key"**

---

### **Step 4: Pilih Project**

Setelah klik, akan muncul popup:

```
┌─────────────────────────────────────────────┐
│  Create API key                             │
├─────────────────────────────────────────────┤
│                                              │
│  ○ Create API key in new project           │
│                                              │
│  ● Create API key in existing project      │
│    Select project: [KPN-FAST ▼]            │
│                                              │
│  [Cancel]  [Create]                         │
└─────────────────────────────────────────────┘
```

**Pilih:**
- Jika sudah buat Google Cloud Project: ● **"Create API key in existing project"**
  - Pilih project: **KPN-FAST** (atau nama project Anda)
- Jika belum punya project: ○ **"Create API key in new project"**

**Klik:** **"Create"**

---

### **Step 5: Copy API Key**

API Key akan langsung muncul:

```
┌─────────────────────────────────────────────┐
│  Your API key                               │
├─────────────────────────────────────────────┤
│                                              │
│  AIzaSyABC123def456GHI789jkl012MNO345pqr   │
│                                              │
│  [Copy]  [Close]                            │
│                                              │
│  ⚠️ Save this key in a secure place.       │
│  For security reasons, we can only show     │
│  it to you once.                            │
└─────────────────────────────────────────────┘
```

**PENTING:**
- ✅ **Klik "Copy"** dan simpan di tempat aman
- ⚠️ API key **hanya muncul sekali**, tidak bisa dilihat lagi
- 📝 Simpan di notepad/notes sebelum close popup

---

### **Step 6: Paste ke .env**

Buka file: `backend\.env`

Paste API key:
```env
GOOGLE_GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
```

**Jangan lupa save file!**

---

## 🧪 **Test API Key (Optional)**

Di Google AI Studio, ada **Prompt Playground** untuk test:

1. Klik menu **"Prompt"** atau kembali ke homepage
2. Tulis prompt sederhana: "Halo, siapa namamu?"
3. Klik **"Run"**
4. Jika berhasil, AI akan respond

**Ini membuktikan API key Anda valid!** ✅

---

## ❓ **Troubleshooting**

### **Problem 1: Tidak ada tombol "Create API Key"**

**Solusi:**
1. Pastikan Anda sudah login
2. Coba refresh browser (F5)
3. Clear cache browser dan login ulang
4. Coba browser lain (Chrome/Edge/Firefox)

---

### **Problem 2: Error "You need to enable billing"**

**Penjelasan:**
- Gemini API ada **FREE tier** (1M tokens/month)
- Tapi butuh enable billing (credit card)
- **Tidak akan di-charge** selama di bawah limit free tier

**Solusi:**
1. Di popup, klik link "Enable billing"
2. Add credit card di Google Cloud Console
3. Atau skip dulu, bisa pakai later

**Alternative - Tanpa Credit Card:**
- Pakai Gemini API via Google AI Studio playground dulu (test)
- Untuk production, harus enable billing

---

### **Problem 3: API Key tidak muncul/hilang**

**Solusi:**
1. Jika sudah close popup dan belum copy:
   - **Re-create API key** (buat yang baru)
   - API key lama tetap valid, tapi tidak bisa dilihat lagi
   
2. Jika ingin delete API key lama:
   - Google Cloud Console → APIs & Services → Credentials
   - Lihat list API keys, delete yang tidak terpakai

---

### **Problem 4: "API key not valid" saat test**

**Check:**
1. Copy API key dengan benar (tidak ada spasi di awal/akhir)
2. Format API key benar: `AIzaSy...` (selalu dimulai dengan "AIzaSy")
3. Google Cloud Project sudah enable "Generative Language API"

**Fix:**
1. Enable API di Google Cloud Console:
   - APIs & Services → Library
   - Search: "Generative Language API"
   - Enable
2. Retry dengan API key yang sama

---

## 📋 **Checklist**

Sebelum lanjut, pastikan:
- [ ] Sudah dapat API Key dari Google AI Studio
- [ ] API Key sudah di-copy dan disimpan
- [ ] API Key sudah di-paste ke `backend\.env`
- [ ] File `.env` sudah di-save
- [ ] (Optional) Sudah test di AI Studio playground

---

## 🔐 **Security Tips**

1. **Jangan share API key** ke orang lain
2. **Jangan commit ke Git** (sudah protected by .gitignore)
3. **Jangan upload ke internet** (forum, screenshot, dll)
4. **Restrict API key** (optional, di Google Cloud Console):
   - APIs & Services → Credentials
   - Edit API key
   - Set restrictions:
     - Application restrictions: None (untuk development)
     - API restrictions: Generative Language API only

---

## 🆓 **Free Tier Limits**

**Gemini 1.5 Flash (Recommended):**
- ✅ 15 requests per minute
- ✅ 1,500 requests per day
- ✅ 1 million tokens per month

**FREE - No credit card needed sampai exceed limits!**

**Untuk convert ke bayar (jika butuh lebih):**
- Pay-as-you-go: ~$0.075 per 1M input tokens
- Sangat murah untuk usage normal

---

## 📚 **References**

- 🔗 [Google AI Studio](https://aistudio.google.com)
- 🔗 [Gemini API Documentation](https://ai.google.dev/docs)
- 🔗 [Pricing](https://ai.google.dev/pricing)

---

## ✅ **Next Step**

Setelah dapat API key:
1. ✅ Paste ke `backend\.env`
2. ✅ Lanjut setup Service Account untuk Google Sheets
3. ✅ Lihat: [GOOGLE_CLOUD_SETUP.md - Step 3.2](./GOOGLE_CLOUD_SETUP.md)

---

**Last Updated:** 2025-11-30  
**Quick Tip:** Bookmark Google AI Studio untuk manage API keys! 🔖
