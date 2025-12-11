# 📊 STRUKTUR DATABASE PERSONEL SPREADSHEET

## Spreadsheet ID
`GOOGLE_SHEET_ID_PERSONEL` atau `GOOGLE_SHEET_ID_PERSONIL` (dari .env)

---

## 📋 **SHEETS (5 Tabs)**

### 1. **db_personel** (Master Personnel Data)
**Kolom (7):**
```
1.  id_personel              - Primary Key, Auto-generated (PRS001, PRS002, ...)
2.  nama_lengkap             - Full Name
3.  tempat_lahir             - Place of Birth
4.  tanggal_lahir            - Date of Birth
5.  alamat_domisili          - Current Address
6.  no_hp                    - Phone Number
7.  tanggal_input            - Timestamp (YYYY-MM-DD HH:MM:SS)
```

**Contoh Data:**
```
PRS001 | KAMARULLAH | PARIT BUGIS | 23-01-1992 | JL. ... | 08123456789 | 2024-01-15 10:00:00
PRS002 | RUKIAH     | NIBUNG      | 05-07-1998 | JL. ... | 08198765432 | 2024-01-15 10:00:00
```

---

### 2. **db_ktp** (KTP/ID Card Documents)
**Kolom (22):**
```
1.  id_ktp                   - Primary Key, Auto-generated (KTP001, KTP002, ...)
2.  id_personel              - Foreign Key → db_personel.id_personel
3.  nik                      - 16-digit National ID Number
4.  nama_ktp                 - Name on KTP
5.  tempat_lahir_ktp         - Place of Birth on KTP
6.  tanggal_lahir_ktp        - Date of Birth on KTP
7.  jenis_kelamin            - Gender (LAKI-LAKI / PEREMPUAN)
8.  golongan_darah           - Blood Type (A, B, AB, O)
9.  alamat_ktp               - Address on KTP
10. rt_rw                    - RT/RW
11. kelurahan_desa           - Village/Kelurahan
12. kecamatan                - District
13. kota_kabupaten           - City/Regency
14. provinsi                 - Province
15. agama                    - Religion
16. status_perkawinan        - Marital Status
17. pekerjaan                - Occupation
18. kewarganegaraan          - Citizenship (WNI/WNA)
19. berlaku_hingga           - Valid Until (or "SEUMUR HIDUP")
20. tanggal_terbit_ktp       - Issue Date
21. file_ktp_url             - Google Drive URL
22. tanggal_input            - Timestamp
```

**Contoh Data:**
```
KTP001 | PRS001 | 6102152301920001 | KAMARULLAH | PARIT BUGIS | 23-01-1992 | LAKI-LAKI | O | JL. PROF. M. YAMIN... | 001/014 | AKCAYA | PONTIANAK SELATAN | PONTIANAK | KALIMANTAN BARAT | ISLAM | KAWIN | WIRASWASTA | WNI | SEUMUR HIDUP | 25-03-2021 | https://drive.google.com/... | 2024-01-15 10:00:00
```

---

### 3. **db_npwp_personel** (NPWP Tax Documents)
**Kolom (15):**
```
1.  id_npwp_personel         - Primary Key, Auto-generated (NPWPP001, NPWPP002, ...)
2.  id_personel              - Foreign Key → db_personel.id_personel
3.  nomor_npwp_personel      - NPWP Number (15 digits with dots)
4.  nik_npwp_personel        - NIK on NPWP
5.  nama_npwp_personel       - Name on NPWP
6.  alamat_npwp_personel     - Address on NPWP
7.  kelurahan_npwp_personel  - Village/Kelurahan on NPWP
8.  kecamatan_npwp_personel  - District on NPWP
9.  kota_npwp_personel       - City on NPWP
10. provinsi_npwp_personel   - Province on NPWP
11. kode_pos_npwp_personel   - Postal Code
12. kpp_npwp_personel        - KPP (Tax Office)
13. tanggal_terdaftar_npwp_personel - Registration Date
14. file_npwp_personel_url   - Google Drive URL
15. tanggal_input            - Timestamp
```

**Contoh Data:**
```
NPWPP001 | PRS001 | 70.423.877.7-704.000 | 6102152301320001 | KAMARULLAH | JL. PARIT BUGIS NO RT 08 RW 04 | PARIT BUGIS | SEGEDONG | PONTIANAK | KALIMANTAN BARAT | | KPP PRATAMA MEMPAWAH | | https://drive.google.com/... | 2024-01-15 10:00:00
```

---

### 4. **db_ijazah** (Education Certificate Documents)
**Kolom (13):**
```
1.  id_ijazah                - Primary Key, Auto-generated (IJAZAH001, IJAZAH002, ...)
2.  id_personel              - Foreign Key → db_personel.id_personel
3.  jenjang_pendidikan       - Education Level (SD, SMP, SMA, D3, S1, S2, S3)
4.  nama_institusi_pendidikan - Institution Name
5.  fakultas                 - Faculty
6.  program_studi            - Study Program/Major
7.  nomor_ijazah             - Certificate Number
8.  tahun_masuk              - Entry Year
9.  tahun_lulus              - Graduation Year
10. gelar_akademik           - Academic Degree (S.T., S.Kom., M.T., etc.)
11. ipk                      - GPA
12. file_ijazah_url          - Google Drive URL
13. tanggal_input            - Timestamp
```

**Contoh Data:**
```
IJAZAH001 | PRS001 | S1 | Universitas Tanjungpura | Teknik | Teknik Sipil | 123456 | 2010 | 2014 | S.T. | 3.45 | https://drive.google.com/... | 2024-01-15 10:00:00
```

---

### 5. **db_cv** (Curriculum Vitae Documents)
**Kolom (11):**
```
1.  id_cv                    - Primary Key, Auto-generated (CV001, CV002, ...)
2.  id_personel              - Foreign Key → db_personel.id_personel
3.  nama_lengkap_cv          - Full Name on CV
4.  ringkasan_profil         - Profile Summary
5.  keahlian_utama           - Main Skills
6.  total_pengalaman_tahun   - Total Years of Experience
7.  pengalaman_kerja_terakhir - Last Work Experience
8.  sertifikasi_profesional  - Professional Certifications
9.  bahasa_dikuasai          - Languages Mastered
10. file_cv_url              - Google Drive URL
11. tanggal_input            - Timestamp
```

**Contoh Data:**
```
CV001 | PRS001 | KAMARULLAH | Profesional dengan 10 tahun pengalaman... | Project Management, Leadership | 10 | PT ABC Indonesia - Project Manager | PMP, PRINCE2 | Indonesia, English | https://drive.google.com/... | 2024-01-15 10:00:00
```

---

## 🔗 **RELATIONSHIPS**

```
db_personel (1) ──┬── (0..1) db_ktp
                  ├── (0..1) db_npwp_personel
                  ├── (0..n) db_ijazah
                  └── (0..1) db_cv
```

**Keterangan:**
- Satu personel bisa punya **1 KTP** (atau tidak ada)
- Satu personel bisa punya **1 NPWP** (atau tidak ada)
- Satu personel bisa punya **banyak Ijazah** (SD, SMP, SMA, S1, S2, dst)
- Satu personel bisa punya **1 CV** (atau tidak ada)

---

## 🗂️ **GOOGLE DRIVE FOLDER STRUCTURE**

```
Data/
└── 02. Personel/
    └── [nama_lengkap]/
        ├── 01. Kartu Tanda Penduduk/
        │   └── KTP [nama_lengkap].pdf
        ├── 02. NPWP/
        │   └── NPWP [nama_lengkap].pdf
        ├── 03. Ijazah/
        │   └── Ijazah [nama_lengkap].pdf
        └── 04. Daftar Riwayat Hidup/
            └── Daftar Riwayat Hidup [nama_lengkap].pdf
```

**Contoh:**
```
Data/
└── 02. Personel/
    └── KAMARULLAH/
        ├── 01. Kartu Tanda Penduduk/
        │   └── KTP KAMARULLAH.pdf
        ├── 02. NPWP/
        │   └── NPWP KAMARULLAH.pdf
        ├── 03. Ijazah/
        │   └── Ijazah KAMARULLAH.pdf
        └── 04. Daftar Riwayat Hidup/
            └── Daftar Riwayat Hidup KAMARULLAH.pdf
```

---

## ⚡ **AUTO-GENERATION RULES**

### ID Generation:
- **id_personel**: `PRS001`, `PRS002`, `PRS003`, ...
- **id_ktp**: `KTP001`, `KTP002`, `KTP003`, ...
- **id_npwp_personel**: `NPWPP001`, `NPWPP002`, `NPWPP003`, ...
- **id_ijazah**: `IJAZAH001`, `IJAZAH002`, `IJAZAH003`, ...
- **id_cv**: `CV001`, `CV002`, `CV003`, ...

### Timestamp Format:
```
YYYY-MM-DD HH:MM:SS
Contoh: 2025-12-11 15:22:27
```

---

## 🗑️ **CASCADE DELETE**

Saat **DELETE PERSONEL** (PRS003):

1. ✅ Delete dari `db_ktp` WHERE `id_personel = 'PRS003'`
2. ✅ Delete file KTP dari Google Drive
3. ✅ Delete dari `db_npwp_personel` WHERE `id_personel = 'PRS003'`
4. ✅ Delete file NPWP dari Google Drive
5. ✅ Delete dari `db_ijazah` WHERE `id_personel = 'PRS003'`
6. ✅ Delete file Ijazah dari Google Drive
7. ✅ Delete dari `db_cv` WHERE `id_personel = 'PRS003'`
8. ✅ Delete file CV dari Google Drive
9. ✅ Delete folder `Data/02. Personel/[nama_lengkap]/` dari Google Drive
10. ✅ Delete dari `db_personel` WHERE `id_personel = 'PRS003'`

---

## ✅ **DATA VALIDATION**

### Required Fields (Minimum):
- **db_personel**: `nama_lengkap` (required)
- **db_ktp**: `id_personel`, `file_ktp_url` (required)
- **db_npwp_personel**: `id_personel`, `file_npwp_personel_url` (required)
- **db_ijazah**: `id_personel`, `file_ijazah_url` (required)
- **db_cv**: `id_personel`, `file_cv_url` (required)

### File Constraints:
- **Format**: PDF only
- **Max Size**: 10MB
- **Permissions**: Public (Anyone with link can view)

---

**Dokumentasi ini sudah sesuai dengan implementasi kode terbaru! ✅**
