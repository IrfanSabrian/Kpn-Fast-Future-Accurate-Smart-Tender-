/**
 * Setup Google Sheets - Auto Create Tables & Insert Dummy Data
 *
 * UPDATED: Support KBLI Many-to-Many
 *
 * Script ini akan:
 * 1. Create sheets/tabs di spreadsheet
 * 2. Insert headers (kolom)
 * 3. Insert dummy data dengan multiple KBLI per perusahaan
 *
 * Usage: node setup-spreadsheet.js
 */

import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Spreadsheet IDs from .env
const SPREADSHEET_PERUSAHAAN = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
const SPREADSHEET_PERSONIL = process.env.GOOGLE_SHEET_ID_PERSONEL;
const SPREADSHEET_KBLI =
  process.env.GOOGLE_SHEET_ID_KBLI || process.env.GOOGLE_SHEET_ID_KLBI;

// Initialize Google Sheets API
async function initializeSheets() {
  const serviceAccountPath = path.resolve(
    __dirname,
    process.env.GOOGLE_SERVICE_ACCOUNT_PATH
  );

  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

// Create or clear a sheet
async function createOrClearSheet(sheets, spreadsheetId, sheetName) {
  try {
    console.log(`📋 Processing sheet: ${sheetName}...`);

    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheet = spreadsheet.data.sheets.find(
      (s) => s.properties.title === sheetName
    );

    if (existingSheet) {
      console.log(
        `   ✅ Sheet "${sheetName}" already exists, clearing data...`
      );
      // Clear existing data
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A:ZZ`,
      });
    } else {
      console.log(`   ➕ Creating new sheet: ${sheetName}...`);
      // Create new sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: { title: sheetName },
              },
            },
          ],
        },
      });
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Error with sheet ${sheetName}:`, error.message);
    return false;
  }
}

// Insert data to sheet
async function insertData(sheets, spreadsheetId, sheetName, data) {
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      resource: { values: data },
    });
    console.log(`   ✅ Inserted ${data.length - 1} rows of data`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error inserting data:`, error.message);
    return false;
  }
}

// ========================================
// DATA DEFINITIONS
// ========================================

// SPREADSHEET 1: PERUSAHAAN
const dataPerusahaan = {
  db_profil_perusahaan: [
    [
      "id_perusahaan",
      "nama_perusahaan",
      "alamat",
      "no_telp",
      "email",
      "tahun_berdiri",
      "status",
      "profil_perusahaan_url",
      "logo_perusahaan",
      "kop_perusahaan",
      "logo_cloud",
      "tanggal_input",
      "author",
    ],
    [
      "COMP001",
      "CV. VERUS CONSULTANT ENGINEERING",
      "Jl. Tanjung Raya, Gg. Saigon Utama 1 no. 77, Desa/Kelurahan Saigon, Kec. Pontianak Timur, Kota Pontianak, Provinsi Kalimantan Barat",
      "08565172259",
      "verus.ce19@gmail.com",
      "2020",
      "Pusat",
      "https://drive.google.com/file/d/1h2iwwLjjmieDP7AvsVd2Qq0MnWCcccuK/view?usp=drive_link",
      "https://drive.google.com/file/d/1Gssm8bTZqVHPb_V0ZsT_Y8cseeANUjH1/view?usp=drive_link",
      "https://drive.google.com/file/d/1Qga2ikIWx3Drz0uoPOxeVGYp-EXsSOBO/view?usp=drive_link",
      "https://res.cloudinary.com/dflqp8ulk/image/upload/v1765636024/kpn-fast/company-logos/Logo%20CV.%20VERUS%20CONSULTANT%20ENGINEERING.png",
      "2025-12-10 18:42:00",
      "system",
    ],
  ],

  db_perusahaan_kbli: [
    ["id_perusahaan_kbli", "id_perusahaan", "kode_kbli", "tanggal_input"],
    // COMP001 (CV VERUS) - Based on NIB Lampiran
    ["PK001", "COMP001", "71102", "2025-12-10 18:42:00"], // AKTIVITAS KEINSINYURAN DAN KONSULTASI TEKNIS YBDI
    ["PK002", "COMP001", "70202", "2025-12-10 18:42:00"], // AKTIVITAS KONSULTASI TRANSPORTASI
    ["PK003", "COMP001", "71101", "2025-12-10 18:42:00"], // AKTIVITAS ARSITEKTUR
    ["PK004", "COMP001", "74202", "2025-12-10 18:42:00"], // Aktivitas Angkutan Udara Khusus Pemotretan, Survei Dan Pemetaan
    ["PK005", "COMP001", "82110", "2025-12-10 18:42:00"], // Aktivitas Penyedia Gabungan Jasa Administrasi Kantor
    ["PK006", "COMP001", "78300", "2025-12-10 18:42:00"], // Penyediaan Sumber Daya Manusia
    ["PK007", "COMP001", "78432", "2025-12-10 18:42:00"], // Pelatihan Kerja Teknologi Informasi dan Komunikasi
    ["PK008", "COMP001", "78421", "2025-12-10 18:42:00"], // Pelatihan Kerja Teknik Swasta
    ["PK009", "COMP001", "70209", "2025-12-10 18:42:00"], // AKTIVITAS KONSULTASI MANAJEMEN LAINNYA
  ],

  db_akta: [
    [
      "id_akta",
      "id_perusahaan",
      "jenis_akta",
      "nomor_akta",
      "tanggal_akta",
      "notaris",
      "akta_perusahaan_url",
      "tanggal_input",
      "author",
    ],
    [
      "AKTA001",
      "COMP001",
      "Pendirian",
      "17/2020",
      "2020-11-20",
      "Gunardi Muhammad Hasan, S.H",
      "https://drive.google.com/file/d/1mFlqsXXApig7480IZF7bU2pXLcxtvL3Q/view?usp=drive_link",
      "2025-12-10 18:42:00",
      "system",
    ],
  ],

  db_pejabat: [
    [
      "id_pejabat",
      "id_perusahaan",
      "id_personel",
      "jenis_jabatan",
      "jabatan_custom",
      "tanggal_input",
    ],
    ["PEJ001", "COMP001", "PRS001", "Direktur", "", "2025-12-10 18:42:00"],
    ["PEJ002", "COMP001", "PRS002", "", "Komanditer", "2025-12-10 18:42:00"],
  ],

  db_sbu: [
    [
      "id_sbu",
      "id_perusahaan",
      "id_nib",
      "nomor_pb_umku",
      "jenis_usaha",
      "asosiasi",
      "pjbu",
      "pjtbu",
      "nomor_registrasi_lpjk",
      "tanggal_terbit",
      "masa_berlaku",
      "kualifikasi",
      "kode_subklasifikasi",
      "sifat",
      "kode_kbli",
      "nama_pjskbu",
      "pelaksana_sertifikasi",
      "sbu_url",
      "tanggal_input",
    ],
    [
      "SBU001",
      "COMP001",
      "NIB001",
      "121600032198100040001",
      "Jasa Konsultansi Konstruksi",
      "PERKONINDO",
      "KAMARULLAH",
      "KAMARULLAH / F 1993 109976 2023 0213407 SI 03",
      "F.3.01.RK.K.16.2024.0070025",
      "2024-05-20",
      "2027-05-19",
      "Kecil",
      "RK001",
      "Umum",
      "71102",
      "RUKIAH F 1993 111290 2023 0216117 SI 01",
      "PERKONINDO KONSULTAN KONSTRUKSI MANDIRI",
      "https://drive.google.com/file/d/1R3e5HoGQzvFHEp46WkHzUwrudNYROA0F/view?usp=drive_link",
      "2025-12-10 18:42:00",
    ],
  ],

  db_nib: [
    [
      "id_nib",
      "id_perusahaan",
      "nomor_nib",
      "tanggal_terbit",
      "status_penanaman_modal",
      "skala_usaha",
      "nib_url",
      "tanggal_input",
    ],
    [
      "NIB001",
      "COMP001",
      "1216000321981",
      "2021-03-18",
      "PMDN",
      "Usaha Mikro",
      "https://drive.google.com/file/d/1IYKSyzvck2FlOErY7BP160Hv1DGRsdFn/view?usp=drive_link",
      "2025-12-10 18:42:00",
    ],
  ],

  db_kta: [
    [
      "id_kta",
      "id_perusahaan",
      "nomor_anggota",
      "nama_asosiasi",
      "penanggung_jawab",
      "jenis_usaha",
      "status_keanggotaan",
      "tanggal_terbit",
      "kta_url",
      "status",
      "tanggal_input",
    ],
    [
      "KTA001",
      "COMP001",
      "00021593",
      "PERKONINDO",
      "KAMARULLAH",
      "Jasa Konsultasi Konstruksi",
      "ANGGOTA BIASA",
      "2023-12-07",
      "https://drive.google.com/file/d/1HE05Ynf2QiRr9wnFqO_lcr-Lsbc75C2j/view?usp=drive_link",
      "Active",
      "2025-12-10 18:42:00",
    ],
  ],

  db_sertifikat_standar: [
    [
      "id_sertifikat_standar",
      "id_perusahaan",
      "id_nib",
      "nomor_sertifikat",
      "kode_kbli",
      "klasifikasi_risiko",
      "status_pemenuhan",
      "lembaga_verifikasi",
      "tanggal_terbit",
      "sertifikat_standar_url",
      "tanggal_input",
    ],
    [
      "SERT001",
      "COMP001",
      "NIB001",
      "12160003219810002",
      "71102",
      "Menengah Tinggi",
      "Disetujui secara otomatis oleh sistem OSS (fiktif positif)",
      "Kementerian Pekerjaan Umum dan Perumahan Rakyat",
      "2024-05-22",
      "https://drive.google.com/file/d/1fqVkl6qJVoL_Ow8uABSXKfOt5K4F5bSC/view?usp=drive_link",
      "2025-12-10 18:42:00",
    ],
    [
      "SERT002",
      "COMP001",
      "NIB001",
      "12160003219810001",
      "78421",
      "Menengah Tinggi",
      "Belum terverifikasi",
      "Pemerintah Kota Pontianak",
      "2022-11-14",
      "https://drive.google.com/file/d/1fqVkl6qJVoL_Ow8uABSXKfOt5K4F5bSC/view?usp=drive_link",
      "2025-12-10 18:42:00",
    ],
  ],

  db_npwp_perusahaan: [
    [
      "id_npwp_perusahaan",
      "id_perusahaan",
      "nomor_npwp",
      "nama_wajib_pajak",
      "alamat_npwp",
      "kpp",
      "tanggal_terdaftar",
      "npwp_perusahaan_url",
      "tanggal_input",
    ],
    [
      "NPWP001",
      "COMP001",
      "96.730.481.7-707.000",
      "CV. VERUS CONSULTANT ENGINEERING",
      "JL TANJUNG RAYA 2 GG SAIGON UTAMA 1 NO. 77 RT. 004 RW. 017",
      "KPP PRATAMA PONTIANAK TIMUR",
      "2020-12-02",
      "https://drive.google.com/file/d/1NJx_8dq5HoaUNKiKB667FF1jucyYbQg7/view?usp=drive_link",
      "2025-12-10 18:42:00",
    ],
  ],

  db_kswp: [
    [
      "id_kswp",
      "id_perusahaan",
      "nik_npwp15",
      "npwp16",
      "nama_wp",
      "alamat",
      "status_kswp",
      "kswp_url",
      "tanggal_input",
    ],
    [
      "KSWP001",
      "COMP001",
      "0967304817707000",
      "967304817707000",
      "VERUS CONSULTANT ENGINEERING",
      "JL TANJUNG RAYA 2 GG SAIGON UTAMA 1 - KOTA PONTIANAK",
      "Valid",
      "https://drive.google.com/file/d/1Qt5VlY87dKLgqcD06jLNqNbOr1UNxt29/view?usp=drive_link",
      "2025-12-10 18:42:00",
    ],
  ],

  db_spt: [
    [
      "id_spt",
      "id_perusahaan",
      "nama_wp",
      "npwp",
      "nitku",
      "tahun_pajak",
      "masa_pajak",
      "jenis_spt",
      "pembetulan_ke",
      "status_spt",
      "nominal",
      "tanggal_penyampaian",
      "nomor_tanda_terima",
      "spt_url",
      "tanggal_input",
    ],
    [
      "SPT001",
      "COMP001",
      "VERUS CONSULTANT ENGINEERING",
      "967304817707000 / 0967304817707000",
      "096730481770700000000",
      "2024",
      "01/12",
      "1771",
      "0",
      "Nihil",
      "0",
      "2025-02-18",
      "818172065832569188821",
      "https://drive.google.com/file/d/1aRT3ESOcHuQJEFhpuekfgvmw8CUcbUSf/view?usp=drive_link",
      "2025-12-10 18:42:00",
    ],
  ],

  db_kontrak_pengalaman: [
    [
      "id_kontrak",
      "id_perusahaan",
      "nama_pekerjaan",
      "bidang_pekerjaan",
      "sub_bidang_pekerjaan",
      "lokasi",
      "nama_pemberi_tugas",
      "alamat_pemberi_tugas",
      "telepon_pemberi_tugas",
      "fax_pemberi_tugas",
      "kode_pos_pemberi_tugas",
      "nomor_kontrak",
      "tanggal_kontrak",
      "nilai_kontrak",
      "waktu_pelaksanaan",
      "tanggal_selesai_kontrak",
      "tanggal_ba_serah_terima",
      "kontrak_url",
      "tanggal_input",
    ],
    [
      "KONTR001",
      "COMP001",
      "Konsultansi Perencanaan Rehabilitasi Ruang Laboratorium IPA",
      "Konsultansi",
      "Perencanaan Teknik",
      "Kabupaten Mempawah",
      "Dinas Pendidikan, Pemuda, Olahraga Dan Pariwisata",
      "Jl. Raden Kusno Mempawah",
      "(0561) 691417",
      "(0561) 691868",
      "78912",
      "400.3.13/260/SPK/DIKPORAPAR-B",
      "2023-05-09",
      "7985000",
      "15 hari",
      "2023-05-23",
      "2023-05-23",
      "https://drive.google.com/file/d/1_kgv67j2oh6mNJj4OYveyySCjpy2RK1Y/view?usp=drive_link",
      "2025-12-10 18:42:00",
    ],
  ],

  db_pkp: [
    [
      "id_pkp",
      "id_perusahaan",
      "id_npwp_perusahaan",
      "nomor_pkp",
      "tanggal_pengukuhan",
      "status",
      "url_pkp",
      "tanggal_input",
    ],
    [
      "PKP001",
      "COMP001",
      "NPWP001",
      "S-139PkP/WPJ.13/KP.0703/2022",
      "2022-06-10",
      "Aktif",
      "https://drive.google.com/file/d/1xe17aWHiRxGMeLQOmSUVcpnhF8reeIYY/view?usp=drive_link",
      "2025-12-10 18:42:00",
    ],
  ],

  db_cek: [
    [
      "id_cek",
      "id_perusahaan",
      "no_rekening",
      "nama_bank",
      "url_cek",
      "tanggal_input",
    ],
    [
      "CEK001",
      "COMP001",
      "1504002132",
      "Bank Kalbar",
      "https://drive.google.com/file/d/1yA_HyCM_YNnO0fUWhAAiIBvqxKcNHwlH/view?usp=drive_link",
      "2025-12-10 18:42:00",
    ],
  ],

  db_bpjs: [
    [
      "id_bpjs",
      "id_perusahaan",
      "nomor_sertifikat",
      "nomor_pendaftaran",
      "tanggal_ditetapkan",
      "lokasi_ditetapkan",
      "url_bpjs",
      "tanggal_input",
      "author",
    ],
    [
      "BPJS001",
      "COMP001",
      "210000001113797",
      "21062812",
      "2021-04-07",
      "JAKARTA",
      "https://drive.google.com/file/d/1SkqH3P-_i1KkIqsxZbnLA515ssU6MDz4/view?usp=drive_link",
      "2025-12-10 18:42:00",
      "system",
    ],
  ],
};

// SPREADSHEET 2: PERSONEL
const dataPersonel = {
  // Master data personel - SUMBER DATA UTAMA
  db_personel: [
    [
      "id_personel",
      "nama_lengkap",
      "alamat_domisili",
      "no_hp",
      "tanggal_input",
      "author",
    ],
    [
      "PRS001",
      "KAMARULLAH",
      "PARIT BUGIS",
      "08565172259",
      "2025-12-10 18:42:00",
      "system",
    ],
    [
      "PRS002",
      "RUKIAH",
      "NIBUNG",
      "08123456789",
      "2025-12-10 18:42:00",
      "system",
    ],
  ],

  // Data KTP - Hanya data spesifik KTP
  db_ktp: [
    [
      "id_ktp",
      "id_personel",
      "nik",
      "nama_ktp",
      "tempat_lahir_ktp",
      "tanggal_lahir_ktp",
      "jenis_kelamin",
      "golongan_darah",
      "alamat_ktp",
      "rt_rw",
      "kelurahan_desa",
      "kecamatan",
      "kota_kabupaten",
      "provinsi",
      "agama",
      "status_perkawinan",
      "pekerjaan",
      "kewarganegaraan",
      "berlaku_hingga",
      "tanggal_terbit_ktp",
      "file_ktp_url",
      "tanggal_input",
      "author",
    ],
    [
      "KTP001",
      "PRS001",
      "6102152301920001",
      "KAMARULLAH",
      "PARIT BUGIS",
      "23-01-1992",
      "LAKI-LAKI",
      "O",
      "JL. PROF. M. YAMIN GG. PEMANGKAT 2 NO. 8.10",
      "001/014",
      "AKCAYA",
      "PONTIANAK SELATAN",
      "PONTIANAK",
      "KALIMANTAN BARAT",
      "ISLAM",
      "KAWIN",
      "WIRASWASTA",
      "WNI",
      "SEUMUR HIDUP",
      "25-03-2021",
      "https://drive.google.com/file/d/1mFl-mdK1slGzSB9hx1mKDMbfQPVex3sR/view?usp=drive_link",
      "2025-12-10 18:42:00",
      "system",
    ],
    [
      "KTP002",
      "PRS002",
      "6106094504980003",
      "RUKIAH",
      "NIBUNG",
      "05-07-1998",
      "PEREMPUAN",
      "B",
      "JL. TANJUNG RAYA 2 GG. SAIGON UTAMA 1 NO. 77",
      "001/017",
      "SAIGON",
      "PONTIANAK TIMUR",
      "PONTIANAK",
      "KALIMANTAN BARAT",
      "ISLAM",
      "KAWIN",
      "PELAJAR/MAHASISWA",
      "WNI",
      "SEUMUR HIDUP",
      "",
      "https://drive.google.com/file/d/1mzBduRYqDQDrUNgPy9HLWlN7KwuBgh1M/view?usp=drive_link",
      "2025-12-10 18:42:00",
      "system",
    ],
  ],

  // Data NPWP Personel - Hanya data spesifik NPWP
  db_npwp_personel: [
    [
      "id_npwp_personel",
      "id_personel",
      "nomor_npwp_personel",
      "nik_npwp_personel",
      "nama_npwp_personel",
      "alamat_npwp_personel",
      "kelurahan_npwp_personel",
      "kecamatan_npwp_personel",
      "kota_npwp_personel",
      "provinsi_npwp_personel",
      "kode_pos_npwp_personel",
      "kpp_npwp_personel",
      "tanggal_terdaftar_npwp_personel",
      "file_npwp_personel_url",
      "tanggal_input",
      "author",
    ],
    [
      "NPWPP001",
      "PRS001",
      "70.423.877.7-704.000",
      "6102152301320001",
      "KAMARULLAH",
      "JL. PARIT BUGIS NO RT 08 RW 04",
      "PARIT BUGIS",
      "SEGEDONG",
      "PONTIANAK",
      "KALIMANTAN BARAT",
      "",
      "KPP PRATAMA MEMPAWAH",
      "",
      "https://drive.google.com/file/d/1t7mDwZDw0oUaSI13C8VzawucrjcIU-9g/view?usp=drive_link",
      "2025-12-10 18:42:00",
      "system",
    ],
    [
      "NPWPP002",
      "PRS002",
      "84.756.455.6-701.000",
      "6106094504980003",
      "RUKIAH",
      "JL. TANJUNG RAYA 2 GG. SAIGON UTAMA 1 NO. 77 RT. 001 RW. 017",
      "SAIGON",
      "PONTIANAK TIMUR",
      "PONTIANAK",
      "KALIMANTAN BARAT",
      "",
      "KPP PRATAMA PONTIANAK",
      "",
      "https://drive.google.com/file/d/1mBR9ii6t5mq0c5sVjlkMo7AZv-_E7xjY/view?usp=drive_link",
      "2025-12-10 18:42:00",
      "system",
    ],
  ],

  // Data Ijazah - Hanya data spesifik pendidikan
  db_ijazah: [
    [
      "id_ijazah",
      "id_personel",
      "jenjang_pendidikan",
      "nama_institusi_pendidikan",
      "fakultas",
      "program_studi",
      "nomor_ijazah",
      "tahun_masuk",
      "tahun_lulus",
      "gelar_akademik",
      "ipk",
      "file_ijazah_url",
      "tanggal_input",
      "author",
    ],
    [
      "IJZ001",
      "PRS001",
      "S1",
      "Universitas Tanjungpura",
      "Teknik",
      "Teknik Sipil",
      "ST/2015/001234",
      "2011",
      "2015",
      "S.T.",
      "3.45",
      "https://drive.google.com/file/d/1ijazah001/view",
      "2025-12-10 18:42:00",
      "system",
    ],
    [
      "IJZ002",
      "PRS002",
      "S1",
      "Universitas Tanjungpura",
      "Teknik",
      "Teknik Arsitektur",
      "ST/2015/005678",
      "2011",
      "2015",
      "S.T.",
      "3.52",
      "https://drive.google.com/file/d/1ijazah002/view",
      "2025-12-10 18:42:00",
      "system",
    ],
  ],

  // Data CV - Hanya data spesifik CV/profil profesional
  db_cv: [
    [
      "id_cv",
      "id_personel",
      "nama_lengkap_cv",
      "ringkasan_profil",
      "keahlian_utama",
      "pengalaman_kerja_terakhir",
      "total_pengalaman_tahun",
      "sertifikasi_profesional",
      "bahasa_dikuasai",
      "file_cv_url",
      "tanggal_update_cv",
      "tanggal_input",
      "author",
    ],
    [
      "CV001",
      "PRS001",
      "KAMARULLAH, S.T.",
      "Profesional di bidang konsultansi teknik dengan pengalaman 8+ tahun dalam perencanaan dan pengawasan proyek konstruksi",
      "Perencanaan Teknik, Manajemen Proyek, AutoCAD, SAP2000, Quantity Surveying",
      "Direktur CV. VERUS CONSULTANT ENGINEERING",
      "8",
      "SKA Ahli Muda Teknik Sipil, Sertifikat Ahli K3 Konstruksi",
      "Indonesia (Native), Inggris (Intermediate)",
      "https://drive.google.com/file/d/1cv001/view",
      "2024-12-01",
      "2025-12-10 18:42:00",
      "system",
    ],
    [
      "CV002",
      "PRS002",
      "RUKIAH, S.T.",
      "Profesional di bidang arsitektur dan desain dengan pengalaman 8+ tahun dalam desain bangunan dan perencanaan tata ruang",
      "Desain Arsitektur, Rendering 3D, SketchUp, AutoCAD, Revit, Photoshop",
      "Komanditer CV. VERUS CONSULTANT ENGINEERING",
      "8",
      "SKA Ahli Muda Arsitektur, Sertifikat Desain Interior",
      "Indonesia (Native), Inggris (Intermediate)",
      "https://drive.google.com/file/d/1cv002/view",
      "2024-12-01",
      "2025-12-10 18:42:00",
      "system",
    ],
  ],
};

// SPREADSHEET 3: KBLI
const dataKBLI = {
  KBLI: [
    ["kode_kbli", "nama_klasifikasi"],
    // Construction KBLI (original)
    ["42101", "Konstruksi Gedung Tempat Tinggal"],
    ["42102", "Konstruksi Gedung Bukan Tempat Tinggal"],
    ["42110", "Konstruksi Jalan Dan Jalan Rel"],
    ["42120", "Konstruksi Jembatan Dan Terowongan"],
    ["42130", "Konstruksi Jaringan Irigasi, Komunikasi Dan Limbah"],
    ["42201", "Konstruksi Bangunan Pembangkit Listrik"],
    ["42202", "Konstruksi Bangunan Penyaluran Dan Distribusi Listrik"],
    ["42901", "Konstruksi Bangunan Sipil Untuk Air"],
    ["42902", "Konstruksi Bangunan Pengairan"],
    ["43110", "Persiapan Lahan"],
    // KBLI from NIB CV VERUS
    ["70202", "Aktivitas Konsultasi Transportasi"],
    ["70209", "Aktivitas Konsultasi Manajemen Lainnya"],
    ["71101", "Aktivitas Arsitektur"],
    ["71102", "Aktivitas Keinsinyuran dan Konsultasi Teknis YBDI"],
    [
      "74202",
      "Aktivitas Angkutan Udara Khusus Pemotretan, Survei Dan Pemetaan",
    ],
    [
      "78300",
      "Penyediaan Sumber Daya Manusia dan Manajemen Fungsi Sumber Daya Manusia",
    ],
    ["78421", "Pelatihan Kerja Teknik Swasta"],
    ["78432", "Pelatihan Kerja Teknologi Informasi dan Komunikasi Perusahaan"],
    ["82110", "Aktivitas Penyedia Gabungan Jasa Administrasi Kantor"],
  ],
};

// Main setup function
async function setupSpreadsheets() {
  console.log("\n🚀 Starting Google Sheets Setup...\n");
  console.log("📌 KBLI Many-to-Many Support: ENABLED\n");

  // Validate environment variables
  if (!SPREADSHEET_PERUSAHAAN || !SPREADSHEET_PERSONIL || !SPREADSHEET_KBLI) {
    console.error("❌ Missing spreadsheet IDs in .env file!");
    console.log("   Please set:");
    console.log("   - GOOGLE_SHEET_ID_PERUSAHAAN");
    console.log("   - GOOGLE_SHEET_ID_PERSONIL");
    console.log("   - GOOGLE_SHEET_ID_KBLI (or GOOGLE_SHEET_ID_KLBI)");
    process.exit(1);
  }

  const sheets = await initializeSheets();

  // ========================================
  // SPREADSHEET 1: PERUSAHAAN
  // ========================================
  console.log("\n📊 SPREADSHEET 1: PERUSAHAAN");
  console.log(`   ID: ${SPREADSHEET_PERUSAHAAN}\n`);

  for (const [sheetName, data] of Object.entries(dataPerusahaan)) {
    await createOrClearSheet(sheets, SPREADSHEET_PERUSAHAAN, sheetName);
    await insertData(sheets, SPREADSHEET_PERUSAHAAN, sheetName, data);
  }

  // ========================================
  // SPREADSHEET 2: PERSONEL
  // ========================================
  console.log("\n📊 SPREADSHEET 2: PERSONEL");
  console.log(`   ID: ${SPREADSHEET_PERSONIL}\n`);

  for (const [sheetName, data] of Object.entries(dataPersonel)) {
    await createOrClearSheet(sheets, SPREADSHEET_PERSONIL, sheetName);
    await insertData(sheets, SPREADSHEET_PERSONIL, sheetName, data);
  }

  // ========================================
  // SPREADSHEET 3: KBLI
  // ========================================
  console.log("\n📊 SPREADSHEET 3: KBLI");
  console.log(`   ID: ${SPREADSHEET_KBLI}\n`);

  for (const [sheetName, data] of Object.entries(dataKBLI)) {
    await createOrClearSheet(sheets, SPREADSHEET_KBLI, sheetName);
    await insertData(sheets, SPREADSHEET_KBLI, sheetName, data);
  }

  console.log("\n✅ ========================================");
  console.log("✅ SETUP COMPLETED SUCCESSFULLY!");
  console.log("✅ ========================================\n");
  console.log("📋 Summary:");
  console.log(`   - PERUSAHAAN: 13 sheets`);
  console.log(
    `     • db_profil_perusahaan, db_perusahaan_kbli, db_akta, db_pejabat`
  );
  console.log(`     • db_sbu, db_nib, db_kta, db_sertifikat_standar`);
  console.log(
    `     • db_npwp_perusahaan, db_kswp, db_spt, db_kontrak_pengalaman`
  );
  console.log(`     • db_pkp, db_cek, db_bpjs`);
  console.log(`   - COMP001: CV. VERUS CONSULTANT ENGINEERING`);
  console.log(`   - NIB: 1216000321981 (PMDN, Usaha Mikro)`);
  console.log(`   - SBU: 121600032198100040001 (Kecil, PERKONINDO)`);
  console.log(`   - KTA: 00021593 (PERKONINDO, Anggota Biasa)`);
  console.log(`   - NPWP: 96.730.481.7-707.000 (KPP Pratama Pontianak Timur)`);
  console.log(`   - KSWP: Valid (Konfirmasi Status WP)`);
  console.log(`   - SPT: Tahun 2024 - Status Nihil (Tersampaikan)`);
  console.log(`   - Sertifikat Standar: 2 certificates (71102, 78421)`);
  console.log(
    `   - PERSONEL: 2 sheets (db_personel, db_ktp, db_npwp_personel)`
  );
  console.log(
    `     • KAMARULLAH (NIK: 6102152301920001, NPWP: 70.423.877.7-704.000)`
  );
  console.log(
    `     • RUKIAH (NIK: 6106094504980003, NPWP: 84.756.455.6-701.000)`
  );
  console.log(`     • db_ijazah dan db_cv akan ditambahkan nanti`);
  console.log(`   - KBLI: 19 classifications`);
  console.log("\n💡 Document Hierarchy:");
  console.log("   Profil → NPWP → KSWP → SPT");
  console.log("              ↓");
  console.log("            NIB → SBU");
  console.log("              ↓      ↓");
  console.log("            KTA   Sertifikat Standar (2x)");
  console.log("   All linked via 9 KBLI codes");
  console.log("\n🔄 Next steps:");
  console.log("   1. Restart backend: npm run dev");
  console.log("   2. Test API: http://localhost:5000/api/companies");
  console.log("   3. Check frontend!\n");
}

// Run setup
setupSpreadsheets().catch((error) => {
  console.error("\n❌ Setup failed:", error.message);
  console.error(error);
  process.exit(1);
});
