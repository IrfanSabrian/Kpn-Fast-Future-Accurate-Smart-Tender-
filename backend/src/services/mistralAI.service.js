import { Mistral } from "@mistralai/mistralai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MistralAIService {
  constructor() {
    this.apiKey = null;
    this.client = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized && this.client) return;

    const configPath = path.join(__dirname, "../../config/api-settings.json");

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (config.mistral_api_key) {
        this.apiKey = config.mistral_api_key;
        this.client = new Mistral({ apiKey: this.apiKey });
        this.initialized = true;
        console.log("✅ [MISTRAL] Client initialized with API Key");
      } else {
        console.warn("⚠️  [MISTRAL] No API key found in config");
      }
    } else {
      console.warn("⚠️  [MISTRAL] Config file not found");
    }
  }

  async forceReload() {
    this.initialized = false;
    this.client = null;
    this.apiKey = null;
    await this.initialize();
  }

  async testConnection() {
    await this.initialize();

    if (!this.client) {
      throw new Error("Mistral API key not configured");
    }

    try {
      const models = await this.client.models.list();
      return { success: true, message: "Mistral API connection successful" };
    } catch (error) {
      throw new Error(`Mistral test failed: ${error.message}`);
    }
  }

  async scanDocument(fileBuffer, documentType) {
    await this.initialize();

    if (!this.client) {
      throw new Error("Mistral API key not configured");
    }

    console.log(`🚀 [MISTRAL] Starting OCR Scan for: ${documentType}`);

    try {
      // 1. Upload File
      console.log(`   (1/3) Uploading file to Mistral...`);
      const uploadResponse = await this.client.files.upload({
        file: {
          fileName: `scan-${Date.now()}.pdf`, // Generic name, Mistral handles content type
          content: fileBuffer,
        },
        purpose: "ocr",
      });

      const fileId = uploadResponse.id;
      console.log(`      ✅ Uploaded! ID: ${fileId}`);

      // 2. OCR Process
      console.log(`   (2/3) Processing OCR...`);
      const ocrResponse = await this.client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "file",
          fileId: fileId,
        },
        includeImageBase64: false,
      });

      const rawMarkdown = ocrResponse.pages.map((p) => p.markdown).join("\n\n");
      console.log(`      ✅ OCR Complete! (${rawMarkdown.length} chars)`);

      // 3. Extraction via LLM
      console.log(`   (3/3) Extracting structured data...`);
      const prompt = this._getPrompt(documentType, rawMarkdown);

      const chatResponse = await this.client.chat.complete({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" },
        temperature: 0.0,
      });

      const resultText = chatResponse.choices[0].message.content;
      return JSON.parse(resultText);
    } catch (error) {
      console.error("❌ [MISTRAL] Scan error:", error);
      throw error;
    }
  }

  _getPrompt(documentType, rawMarkdown) {
    const baseInstruction = `
        Analyze this document content and extract information into JSON.
        DOCUMENT CONTENT:
        ${rawMarkdown}
        
        IMPORTANT INSTRUCTIONS:
        - Extract EXACTLY as written in the document.
        - Return ONLY valid JSON.
        - DATES MUST BE IN YYYY-MM-DD FORMAT (e.g. 1990-01-31). Convert if necessary.
        - If a field is not found, return null or empty string "".
        - DO NOT HALLUCINATE or INFER data not present in the document.
        - If a field is empty in the document, it MUST be empty in the JSON.
    `;

    switch (documentType.toLowerCase()) {
      case "ktp":
        return `${baseInstruction}
        Structure:
        {
          "nik": "16-digit NIK number",
          "nama_ktp": "Full name as shown",
          "tempat_lahir_ktp": "Place of birth",
          "tanggal_lahir_ktp": "DD-MM-YYYY (Convert to YYYY-MM-DD if possible)",
          "jenis_kelamin": "LAKI-LAKI or PEREMPUAN",
          "golongan_darah": "A, B, AB, or O (optional)",
          "alamat_ktp": "Full address",
          "rt_rw": "RT/RW format: 000/000",
          "kelurahan_desa": "Kelurahan/Desa name",
          "kecamatan": "Kecamatan name",
          "kota_kabupaten": "Kota/Kabupaten name",
          "provinsi": "Province name",
          "agama": "ISLAM, KRISTEN, KATOLIK, HINDU, BUDDHA, or KONGHUCU",
          "status_perkawinan": "BELUM KAWIN, KAWIN, CERAI HIDUP, or CERAI MATI",
          "pekerjaan": "Occupation",
          "kewarganegaraan": "Usually WNI",
          "berlaku_hingga": "SEUMUR HIDUP or YYYY-MM-DD",
          "tanggal_terbit_ktp": "DD-MM-YYYY"
        }`;

      case "npwp":
        return `${baseInstruction}
        IMPORTANT INSTRUCTIONS FOR NPWP VERSION DETECTION:
        There are 2 versions of NPWP documents:
        
        VERSION 1 (OLD NPWP):
        - Has separate NPWP number in format: XX.XXX.XXX.X-XXX.XXX
        - Has separate NIK (16 digits)
        - Extract both lines separately.
        
        VERSION 2 (NEW NPWP - White/Blue card):
        - The NPWP number IS the NIK (16 digits).
        - Use the same 16-digit number for BOTH "nomor_npwp_personel" AND "nik_npwp_personel".
        
        Structure:
        {
          "nomor_npwp_personel": "NPWP number (format depends on version)",
          "nik_npwp_personel": "16-digit NIK (same as NPWP if version 2)",
          "nama_npwp_personel": "Full name as shown",
          "kpp_npwp_personel": "KPP name",
          "alamat_npwp_personel": "Full registered address"
        }`;

      case "nib":
        return `${baseInstruction}
        Structure:
        {
          "nomor_nib": "Extract the NIB number (usually 13 digits)",
          "tanggal_terbit": "YYYY-MM-DD",
          "status_penanaman_modal": "e.g., PMDN or PMA",
          "skala_usaha": "e.g., Mikro, Kecil",
          "kbli": ["Array of KBLI strings"]
        }`;

      case "ijazah":
        return `${baseInstruction}
        Structure:
        {
          "nomor_ijazah": "Nomor Ijazah/Seri Ijazah",
          "nama_institusi_pendidikan": "Nama Universitas/Sekolah",
          "jenjang_pendidikan": "S1, S2, D3, SMA, etc.",
          "program_studi": "Jurusan/Program Studi",
          "fakultas": "Fakultas (jika ada)",
          "tahun_lulus": "YYYY",
          "gelar_akademik": "Gelar yang diperoleh",
          "ipk": "IPK (jika ada)"
        }`;

      case "cv":
        return `${baseInstruction}
        Structure:
        {
          "nama_lengkap_cv": "Nama Lengkap",
          "ringkasan_profil": "Ringkasan profil profesional",
          "keahlian_utama": "Daftar skill/keahlian utama (comma separated)",
          "total_pengalaman_tahun": "Estimasi total tahun pengalaman (number)",
          "pengalaman_kerja_terakhir": "Posisi dan Perusahaan terakhir",
          "bahasa_dikuasai": "Bahasa yang dikuasai"
        }`;

      case "daftarpengalaman":
      case "kontrak_pengalaman":
        return `${baseInstruction}
        
        INSTRUKSI KHUSUS UNTUK KONTRAK / DAFTAR PENGALAMAN (SPK FORMAT):
        Analyze the document "SURAT PERJANJIAN PEKERJAAN (SPK)" or "SURAT PERINTAH MULAI KERJA (SPMK)" / "BERITA ACARA SERAH TERIMA (BAST)" closely.
        
        EXTRACT FIELDS BASED ON THIS EXACT STRUCTURE:
        1. "NOMOR" -> nomor_kontrak
        2. "TANGGAL" -> tanggal_kontrak (Convert to YYYY-MM-DD)
        3. "PIHAK PERTAMA" / "PEJABAT PEMBUAT KOMITMEN" -> pemberi_tugas (Extract Agency Name)
        4. "ALAMAT" (under Pihak Pertama) -> alamat_pemberi_tugas (Extract full address of agency)
        5. "KEGIATAN" -> kegiatan (Extract exact text, e.g. "PENGELOLAAN...")
        6. "PEKERJAAN" -> pekerjaan (Extract exact text, e.g. "KONSULTANSI...")
        7. "LOKASI" -> lokasi
        8. "BIAYA" -> nilai_kontrak (Extract numeric value, ignore "Rp" and text description)
        9. "WAKTU PELAKSANAAN" -> waktu_pelaksanaan
        10. "SUMBER DANA" -> sumber_dana (e.g. "DANA ALOKASI KHUSUS (DAK)")
        11. "TANGGAL MULAI" / "SPMK DATE" -> tanggal_mulai (YYYY-MM-DD)
        12. "TANGGAL SELESAI" / "END DATE" -> tanggal_selesai_kontrak (YYYY-MM-DD)
        13. "TANGGAL SERAH TERIMA" / "BAST DATE" -> tanggal_ba_serah_terima (YYYY-MM-DD)
        
        IMPORTANT: 
        - DO NOT extract "sub_kegiatan" for SPK format (Field does not exist).
        - Ensure "pekerjaan" is the specific job title.
        - Ensure "kegiatan" is the broader activity.
        - Look for SPMK (Surat Perintah Mulai Kerja) or "Jangka Waktu" section for Start/End dates.
        - Look for BAST (Berita Acara Serah Terima) section for Handover date.
        - Return a SINGLE OBJECT if it's a single contract.
        - If multiple experiences are listed, return the first one found or the most prominent one.

        Structure:
        {
          "pekerjaan": "Nama Pekerjaan / Job Title",
          "kegiatan": "Nama Kegiatan / Activity",
          "sub_kegiatan": "", 
          "lokasi": "Lokasi",
          "pemberi_tugas": "Nama Instansi",
          "alamat_pemberi_tugas": "Alamat Instansi / Pemberi Tugas",
          "nomor_kontrak": "Nomor SPK",
          "tanggal_kontrak": "YYYY-MM-DD",
          "nilai_kontrak": "Nilai (angka)",
          "waktu_pelaksanaan": "Waktu Pelaksanaan",
          "sumber_dana": "Sumber Dana",
          "tanggal_mulai": "YYYY-MM-DD",
          "tanggal_selesai_kontrak": "YYYY-MM-DD",
          "tanggal_ba_serah_terima": "YYYY-MM-DD"
        }`;

      case "stnk":
        return `${baseInstruction}
        Structure:
        {
          "no_polisi": "License Plate Number",
          "merek": "Vehicle Brand",
          "warna": "Vehicle Color",
          "tahun_pembuatan": "Manufacturing Year"
        }`;

      case "akta":
        return `${baseInstruction}
        IMPORTANT INSTRUCTIONS:
        - "jenis_akta" MUST be "Pendirian" or "Perubahan". Look for title or context.
        
        Structure:
        {
          "jenis_akta": "Pendirian or Perubahan",
          "nomor_akta": "Deed number",
          "tanggal_akta": "YYYY-MM-DD",
          "notaris": "Notary Name"
        }`;

      case "nib":
        return `${baseInstruction}
        Structure:
        {
          "nomor_nib": "Extract the NIB number (usually 13 digits)",
          "tanggal_terbit": "YYYY-MM-DD",
          "status_penanaman_modal": "e.g., PMDN or PMA",
          "skala_usaha": "e.g., Mikro, Kecil",
          "kbli": ["Array of KBLI strings"]
        }`;

      case "sbu":
        return `${baseInstruction}
        Structure:
        {
          "nomor_sbu": "SBU Number",
          "nomor_pb_umku": "PB-UMKU Number",
          "jenis_usaha": "Type of business",
          "asosiasi": "Association name",
          "pjbu": "PJBU Name",
          "pjtbu": "PJTBU Name",
          "nomor_registrasi_lpjk": "LPJK Registration Number",
          "pelaksana_sertifikasi": "Certification Body (LSBU)",
          "tanggal_terbit": "YYYY-MM-DD",
          "masa_berlaku": "YYYY-MM-DD",
          "kualifikasi": "Qualification",
          "kode_subklasifikasi": "Subclassification Code",
          "sifat": "Nature (Sifat)",
          "kode_kbli": "KBLI Code",
          "nama_pjskbu": "PJSKBU Name"
        }`;

      case "kta":
        return `${baseInstruction}
        Structure:
        {
          "nomor_anggota": "Membership Number",
          "nama_asosiasi": "Association Name",
          "penanggung_jawab": "Person in Charge",
          "status_keanggotaan": "Status",
          "tanggal_terbit": "YYYY-MM-DD"
        }`;

      case "sertifikat":
        return `${baseInstruction}
        Structure:
        {
          "nomor_sertifikat": "Nomor Sertifikat Standar",
          "kode_kbli": "Kode KBLI (e.g. 41112)",
          "lembaga_verifikasi": "Lembaga penerbit/verifikasi e.g. OSS",
          "klasifikasi_risiko": "Risiko (e.g. Menengah Tinggi)",
          "status_pemenuhan": "Status pemenuhan (e.g. Telah Memenuhi)",
          "tanggal_terbit": "YYYY-MM-DD"
        }`;

      case "npwp_perusahaan":
        return `${baseInstruction}
        IMPORTANT: This is for COMPANY NPWP.
        - "alamat": This is CRITICAL. Scan the entire document for the address.
          - It usually follows "Alamat", "Tempat Kedudukan", or is located below the company name.
          - It often contains keywords like "Jl.", "Jalan", "Gedung", "Ruko", "Kav", "No", "RT", "RW", "Kel", "Kec".
          - Capture the FULL address string including Street, Number, RT/RW, Kelurahan, Kecamatan, City/Regency, and Postal Code.
          - Do NOT truncate.
        
        Structure:
        {
          "nomor_npwp": "NPWP number (XX.XXX.XXX.X-XXX.XXX)",
          "nama_wp": "Company name as registered",
          "alamat": "Full registered address found in document",
          "kpp": "KPP name",
          "tanggal_terdaftar": "YYYY-MM-DD"
        }`;

      case "spt":
        return `${baseInstruction}
        IMPORTANT INSTRUCTIONS:
        - "nitku" (Nomor Identitas Tempat Kegiatan Usaha): Look carefully for this field! It may be labeled as "NITKU", "Nomor Identitas Tempat Kegiatan Usaha". 
        - Usually a 16-digit number.
        - IMPORTANT: Do not leave this field empty if you see any number labeled as NITKU.

        Structure:
        {
          "tahun_pajak": "Tax year (YYYY)",
          "masa_pajak": "Tax period",
          "jenis_spt": "SPT type",
          "pembetulan_ke": "Revision number (0 for normal)",
          "nominal": "Tax amount (number only)",
          "tanggal_penyampaian": "YYYY-MM-DD",
          "nomor_tanda_terima": "Receipt number",
          "nama_wp": "Taxpayer name",
          "npwp": "NPWP number",
          "nitku": "NITKU (16-digit number if shown)",
          "status_spt": "SPT status"
        }`;

      case "pkp":
        return `${baseInstruction}
        Structure:
        {
          "nomor_pkp": "PKP registration number",
          "npwp": "NPWP number",
          "tanggal_pengukuhan": "YYYY-MM-DD"
        }`;

      case "kswp":
        return `${baseInstruction}
        Structure:
        {
          "nama_wp": "Taxpayer name",
          "npwp": "NPWP number",
          "tahun_kswp": "KSWP year (YYYY)",
          "status_kswp": "Status (Patuh or Tidak Patuh)",
          "tanggal_terbit": "YYYY-MM-DD"
        }`;

      default:
        // Generic fallback for other docs if needed, or throw error.
        // For now, providing a generic summary extraction to be safe.
        return `${baseInstruction}
        Structure:
        {
          "summary": "Brief summary of the document",
          "key_details": {}
        }`;
    }
  }
}

export default new MistralAIService();
