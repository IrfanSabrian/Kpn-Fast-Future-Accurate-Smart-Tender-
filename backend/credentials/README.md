# 🔐 Credentials Folder

Folder ini berisi file credentials untuk Google Cloud APIs.

## 📁 Files yang Harus Ada

Setelah mengikuti `GOOGLE_CLOUD_SETUP.md`, folder ini harus berisi:

```
credentials/
├── service-account.json  ← Google Service Account key (WAJIB)
├── .gitignore           ← Protection agar credentials tidak ke-commit
└── README.md            ← File ini
```

## ⚠️ PENTING!

- **File `service-account.json` berisi private key**
- **JANGAN share atau commit ke Git!**
- **JANGAN upload ke GitHub/GitLab!**
- File ini sudah di-protect oleh `.gitignore`

## 🔑 Cara Mendapatkan service-account.json

Ikuti panduan di file: `../GOOGLE_CLOUD_SETUP.md` bagian **Step 3.2**

Atau singkatnya:
1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Pilih project KPN-FAST
3. Buka **APIs & Services** > **Credentials**
4. Create **Service Account**
5. Generate **JSON Key**
6. Download dan rename menjadi `service-account.json`
7. Pindahkan ke folder ini

## 📊 Service Account Email

Setelah create service account, catat email-nya (format: `xxx@xxx.iam.gserviceaccount.com`).

**Email ini digunakan untuk:**
- Share Google Sheets database
- Share Google Drive output folder
- Akses Google Docs API

## ✅ Verification

Untuk memastikan file sudah benar, buka `service-account.json` dan pastikan ada field:
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "...@....iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

## 🆘 Troubleshooting

### File tidak ada setelah download?
- Check folder **Downloads** di Windows
- Rename dari nama panjang menjadi `service-account.json`
- Pindahkan ke folder ini

### Error "permission denied" saat akses Google Sheets?
- Pastikan Google Sheets sudah di-share dengan `client_email` dari JSON
- Permission minimal: **Editor**

---

**Untuk panduan lengkap, baca:** [GOOGLE_CLOUD_SETUP.md](../../GOOGLE_CLOUD_SETUP.md)
