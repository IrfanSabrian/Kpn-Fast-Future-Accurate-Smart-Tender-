# Strategi Multi-AI Provider KPN FAST

## Diperbarui: 6 Januari 2026

Dokumen ini menjelaskan strategi penggunaan berbagai AI provider untuk memaksimalkan efisiensi, ketersediaan, dan biaya operasional sistem KPN FAST.

---

## 🎯 Ringkasan Strategi

### Alokasi Tugas Per Provider:

| Provider       | Fungsi Utama                                     | Alasan Pemilihan                                |
| -------------- | ------------------------------------------------ | ----------------------------------------------- |
| **Mistral AI** | Scan dokumen PDF (KTP, NPWP, Ijazah, CV, dll)    | ✅ Native PDF, ✅ "Unlimited" (Rate Limit)      |
| **Gemini**     | Analisis data, berpikir kritis, usulan teknis    | ✅ Paling pintar, ✅ Reasoning kuat, ✅ 3 Model |
| **Groq**       | Generate teks cepat (deskripsi job, dokumentasi) | ✅ Tercepat, ✅ Limit tinggi                    |

---

## 📊 Detail Provider

### 1. Mistral AI - Scan Dokumen PDF

**Status**: ✅ Provider Utama untuk Scanning

**Fungsi**:

- Scan KTP (ekstrak NIK, nama, alamat, dll)
- Scan NPWP (ekstrak nomor NPWP, nama, alamat)
- Scan Ijazah (ekstrak nama, institusi, tahun lulus)
- Scan CV dan dokumen personel lainnya

**Keunggulan**:

- ✅ **Native PDF** - Bisa baca file PDF langsung tanpa konversi ke gambar
- ✅ **"Unlimited"** - Dibatasi oleh kecepatan (Rate Limit), bukan kuota harian
- ✅ **Akurasi Tinggi** - Model OCR khusus dokumen

**Keterbatasan**:

- ⚠️ **Rate Limit** - 1 request/detik (tidak masalah untuk penggunaan per-perangkat)

**Model yang Digunakan**:

- `mistral-ocr-latest`

**Cara Kerja**:

1. User upload PDF dokumen (misal KTP)
2. System kirim PDF langsung ke Mistral OCR API
3. Terima hasil ekstraksi JSON
4. Tampilkan ke user untuk validasi

---

### 2. Gemini - Analisis & Usulan Teknis (Critical Thinking)

**Status**: ✅ Provider untuk Kecerdasan Tinggi & Analisis

**Fungsi**:

- Analisis data tender (KAK, HPS)
- Generate usulan teknis yang kompleks
- Reasoning tasks yang butuh pemahaman mendalam
- Menjawab pertanyaan analitis dari user

**Strategi Rotasi Model (Total 60 req/hari):**

Kami menggunakan strategi rotasi 3 model Gemini untuk memaksimalkan kuota gratis. Semua model direset jam **3 Sore (15:00 WIB)**.

1.  **Prioritas 1: Gemini 3 Flash** (Latest)
    - Limit: 20 request/hari
    - Digunakan pertama kali untuk tugas terberat.
2.  **Prioritas 2: Gemini 2.5 Flash** (Stable)
    - Limit: 20 request/hari
    - Digunakan saat Gemini 3 habis.
3.  **Prioritas 3: Gemini 2.5 Flash-Lite** (Fast)
    - Limit: 20 request/hari
    - Digunakan saat Gemini 2.5 habis.

**Keunggulan**:

- ✅ **GRATIS** - Total 60 request per akun per hari
- ✅ **PALING PINTAR** - Terbaik untuk reasoning & berpikir kritis
- ✅ **MULTI-MODAL** - Support input teks panjang

**Keterbatasan**:

- ⚠️ **Quota Ketat** - Reset setiap 24 jam (Jam 3 Sore)

**Strategi Penggunaan**:
Gunakan Gemini **HANYA** untuk tugas yang butuh "Mikir" (Analisis KAK, Buat Usulan Teknis). Jangan pakai untuk scan dokumen sederhana.

---

### 3. Groq - Text Generation Cepat

**Status**: ✅ Provider untuk Kecepatan & Fallback

**Fungsi**:

- Generate job description personel
- Generate deskripsi teknis pekerjaan sederhana
- Generate dokumentasi tender standar
- **Fallback** jika semua kuota Gemini habis

**Keunggulan**:

- ✅ **GRATIS** - Free tier
- ✅ **SANGAT CEPAT** - 1-2 detik average
- ✅ **LIMIT TINGGI** - 14,400 request/hari
- ✅ **RELIABLE** - 99% success rate

**Keterbatasan**:

- ⚠️ **Text Only** - Tidak bisa lihat gambar/PDF
- ⚠️ **Kurang Pintar** - Untuk reasoning sangat dalam, Gemini lebih baik

---

## 🎯 Workflow Implementasi

### A. Scan Dokumen (KTP, NPWP, NIB, dll)

**Provider**: Mistral AI (Primary)

**Alur Kerja**:

```
1. User upload PDF/Image
   ↓
2. Upload & OCR di Mistral
   ↓
3. Extract JSON dengan Mistral Chat
   ↓
4. Tampilkan hasil
```

---

### B. Generate Usulan Teknis & Analisis

**Provider**: Gemini (Rotation 3 Model) → Groq (Fallback)

**Alur Kerja**:

```
1. User pilih tender & perintahkan analisis
   ↓
2. Cek Quota Gemini 3 Flash (Sisa > 0?)
   → YA: Gunakan Gemini 3 Flash
   → TIDAK: Cek Gemini 2.5 Flash (Sisa > 0?)
       → YA: Gunakan Gemini 2.5 Flash
       → TIDAK: Cek Gemini 2.5 Flash-Lite
           → YA: Gunakan Gemini 2.5 Flash-Lite
           → TIDAK: Gunakan Groq (Fallback)
   ↓
3. Generate analisis/usulan teknis
   ↓
4. Tampilkan hasil
```

**Kapasitas**: ~60 Dokumen Analisis per hari (Gratis)
**Reset**: Jam 15:00 WIB

---

### C. Generate Deskripsi & Dokumentasi Rutin

**Provider**: Groq (Primary)

**Alur Kerja**:

```
1. User request generate job desc
   ↓
2. Kirim ke Groq (Llama 3 / Mixtral)
   ↓
3. Tampilkan hasil instan (< 2 detik)
```

---

## 📉 Analisis Efisiensi

### Perbandingan Skenario:

1.  **Scanning**:
    - **Lama**: Pakai OpenRouter (Harus convert PDF -> PNG, lambat & ribet).
    - **Baru**: Pakai Mistral (Native PDF support, langsung kirim buffer).
    - **Hasil**: Proses scanning lebih cepat dan sederhana.

2.  **Analisis/Berpikir**:
    - **Lama**: Pakai 1 Gemini (Limit 20x).
    - **Baru**: Rotasi 3 Gemini (Limit 60x).
    - **Hasil**: Kapasitas analisis naik **300%**.

### Kesimpulan:

Dengan memindahkan tugas **Scanning** ke **Mistral** dan memecah tugas **Analisis** ke **3 Model Gemini**, sistem KPN FAST menjadi jauh lebih _robust_ (tahan banting) dan tetap **100% GRATIS**.

---

## � Rencana Implementasi

1.  ✅ **Update Strategy**: Dokumen ini diperbarui.
2.  ⏳ **Setup Mistral**: Register & Get API Key.
3.  ⏳ **Implement Backend**:
    - Buat `MistralService` untuk OCR.
    - Update `GeminiService` untuk logic rotasi 3 model.
4.  ⏳ **Testing**: Validasi alur baru.
