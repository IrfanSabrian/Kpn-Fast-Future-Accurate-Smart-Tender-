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

      case "kontrak":
      case "kontrak_pengalaman":
        return `${baseInstruction}
        
        INSTRUKSI KHUSUS UNTUK KONTRAK / DAFTAR PENGALAMAN:
        1. Analisis TABEL atau SURAT PERINTAH KERJA (SPK).
        2. PENTING: Bedakan antara "SUB KEGIATAN" dan "PEMBERI TUGAS".
           - "nama_sub_kegiatan" diambil dari kolom "Bidang / Sub Bidang". 
           - JANGAN mengambil Nama Instansi/Dinas (misal: "Dinas Pendidikan", "Kementerian X") sebagai Sub Kegiatan. Itu adalah Pemberi Tugas.
           - Jika kolom Sub Kegiatan KOSONG di dokumen, biarkan kosong ("") di JSON. JANGAN MENGARANG.
        3. "nama_pemberi_tugas" adalah nama instansi pemilik pekerjaan.
        
        Structure:
        {
          "nama_kegiatan": "Nama Pekerjaan / Proyek",
          "nama_sub_kegiatan": "Bidang / Sub Bidang (BUKAN Nama Dinas/Instansi)",
          "lokasi": "Lokasi Proyek",
          "nama_pemberi_tugas": "Nama Instansi / Pemberi Tugas",
          "alamat_pemberi_tugas": "Alamat Pemberi Tugas",
          "nomor_kontrak": "Nomor Kontrak",
          "tanggal_kontrak": "YYYY-MM-DD",
          "nilai_kontrak": "Nilai (angka saja)",
          "waktu_pelaksanaan": "Jangka Waktu",
          "tanggal_selesai_kontrak": "YYYY-MM-DD",
          "tanggal_ba_serah_terima": "YYYY-MM-DD"
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
