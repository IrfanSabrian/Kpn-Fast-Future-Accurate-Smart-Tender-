import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

class GeminiAIService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  async forceReload() {
    this.model = null;
    this.genAI = null;
    await this.initialize();
  }

  async initialize() {
    if (this.model) return;

    let apiKey = "";

    // Try to load from config file
    try {
      const configPath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../config/api-settings.json",
      );

      const fs = await import("fs");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        if (config.gemini_api_key && config.gemini_api_key.trim() !== "") {
          apiKey = config.gemini_api_key;
          console.log("Using Gemini API Key from settings file");
        }
      }
    } catch (e) {
      console.warn("Failed to load api-settings.json:", e.message);
    }

    if (!apiKey) {
      throw new Error(
        "gemini_api_key tidak ditemukan di backend/config/api-settings.json",
      );
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });
    console.log(
      "✅ Gemini AI Service initialized (model: gemini-2.5-flash-lite)",
    );
  }

  /**
   * Convert file buffer to Gemini-compatible format
   */
  fileToGenerativePart(buffer, mimeType) {
    return {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType,
      },
    };
  }

  async testConnection() {
    await this.initialize();

    if (!this.model) {
      throw new Error("Gemini API key not configured");
    }

    try {
      // Simple test: generate minimal content
      const result = await this.model.generateContent("Test");

      if (result && result.response) {
        return { success: true, message: "Gemini API connection successful" };
      }

      throw new Error("Invalid response from Gemini API");
    } catch (error) {
      throw new Error(`Gemini test failed: ${error.message}`);
    }
  }

  /**
   * Scan KTP document and extract fields
   */
  async scanKTP(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian KTP (Kartu Tanda Penduduk / ID Card) document carefully and extract ALL information in JSON format.

IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document
- Use UPPERCASE for values that are in uppercase in the document
- Use proper formatting for dates (DD-MM-YYYY)
- If a field is not visible or unclear, use empty string ""
- Do NOT make assumptions or fill with placeholder data

Return ONLY valid JSON with this exact structure:
{
  "nik": "16-digit NIK number",
  "nama_ktp": "Full name as shown",
  "tempat_lahir_ktp": "Place of birth",
  "tanggal_lahir_ktp": "DD-MM-YYYY",
  "jenis_kelamin": "LAKI-LAKI or PEREMPUAN",
  "golongan_darah": "A, B, AB, or O",
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
  "berlaku_hingga": "SEUMUR HIDUP or date",
  "tanggal_terbit_ktp": "DD-MM-YYYY"
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response (remove markdown code blocks if present)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(
          "AI tidak dapat menemukan data KTP yang valid di dokumen. Pastikan PDF berisi KTP yang jelas dan terbaca.",
        );
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      // Validate that we got some actual data (not all empty)
      const hasData = Object.values(parsedData).some(
        (value) => value && value.trim() !== "",
      );
      if (!hasData) {
        throw new Error(
          "Dokumen tidak dapat dibaca atau bukan KTP yang valid. Silakan gunakan scan/foto yang lebih jelas.",
        );
      }

      return parsedData;
    } catch (error) {
      if (
        error.message.includes("AI tidak dapat") ||
        error.message.includes("Dokumen tidak dapat")
      ) {
        throw error;
      }
      throw new Error(
        `Gagal memproses KTP: ${error.message}. Kemungkinan file rusak atau bukan dokumen KTP.`,
      );
    }
  }

  /**
   * Scan NPWP document and extract fields
   */
  async scanNPWP(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian NPWP (Nomor Pokok Wajib Pajak / Tax ID) document carefully and extract ALL information in JSON format.

IMPORTANT INSTRUCTIONS FOR NPWP VERSION DETECTION:
There are 2 versions of NPWP documents:

VERSION 1 (OLD NPWP - Yellow card with "DIREKTORAT JENDERAL PAJAK"):
- Has separate NPWP number in format: XX.XXX.XXX.X-XXX.XXX (e.g., 75.352.841.3-701.000)
- Has separate NIK in format: 16 digits (e.g., 6171012405910009)
- Extract both numbers separately

VERSION 2 (NEW NPWP - White/Blue card with "npwp" logo):
- The NPWP number IS the NIK (same 16 digits in format XXXX XXXX XXXX XXXX)
- For this version: use the same 16-digit number for BOTH "nomor_npwp_personel" AND "nik_npwp_personel"
- Example: if you see "6171 0311 0703 0007", use "6171031107030007" for both fields

EXTRACTION RULES:
- Extract EXACTLY as written in the document
- Use UPPERCASE for values that are in uppercase
- For old format NPWP, use dots and hyphens: XX.XXX.XXX.X-XXX.XXX
- For new format NPWP, use 16 digits without spaces: XXXXXXXXXXXXXXXX
- If a field is not visible, use empty string ""
- KPP names may vary in format (e.g., "KPP Pratama Pontianak Barat" or "KANTOR PELAYANAN PAJAK PRATAMA PONTIANAK BARAT")

Return ONLY valid JSON with this exact structure:
{
  "nomor_npwp_personel": "NPWP number (format depends on version)",
  "nik_npwp_personel": "16-digit NIK (same as NPWP if version 2)",
  "nama_npwp_personel": "Full name as shown",
  "kpp_npwp_personel": "KPP name",
  "alamat_npwp_personel": "Full registered address"
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(
          "AI tidak dapat menemukan data NPWP yang valid di dokumen. Pastikan PDF berisi NPWP yang jelas dan terbaca.",
        );
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      const hasData = Object.values(parsedData).some(
        (value) => value && value.trim() !== "",
      );
      if (!hasData) {
        throw new Error(
          "Dokumen tidak dapat dibaca atau bukan NPWP yang valid. Silakan gunakan scan/foto yang lebih jelas.",
        );
      }

      return parsedData;
    } catch (error) {
      if (
        error.message.includes("AI tidak dapat") ||
        error.message.includes("Dokumen tidak dapat")
      ) {
        throw error;
      }
      throw new Error(
        `Gagal memproses NPWP: ${error.message}. Kemungkinan file rusak atau bukan dokumen NPWP.`,
      );
    }
  }

  /**
   * Scan Ijazah document and extract fields
   */
  async scanIjazah(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian Ijazah (Educational Certificate) document carefully and extract ALL information in JSON format.

IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document
- Jenjang should be one of: SMA/SMK, D3, S1, S2, S3
- IPK should be decimal format (e.g., 3.50)
- Years should be 4-digit format (e.g., 2015)
- If a field is not visible, use empty string ""

Return ONLY valid JSON with this exact structure:
{
  "jenjang_pendidikan": "SMA/SMK, D3, S1, S2, or S3",
  "ipk": "GPA in decimal format",
  "nama_institusi_pendidikan": "University/School name",
  "fakultas": "Faculty name",
  "program_studi": "Study program/major",
  "nomor_ijazah": "Certificate number",
  "tahun_masuk": "Entry year (YYYY)",
  "tahun_lulus": "Graduation year (YYYY)",
  "gelar_akademik": "Academic degree (e.g., S.T., S.Kom.)"
}`;

    const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
    const result = await this.model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Scan CV document and extract fields
   */
  async scanCV(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian CV (Curriculum Vitae / Daftar Riwayat Hidup) document carefully and extract ALL information in JSON format.

IMPORTANT INSTRUCTIONS:
- Extract key information from the CV
- Summarize profile/objective section
- List main skills separated by commas
- Extract total years of experience as a number
- List languages known
- Get most recent work experience
- List professional certifications if any
- If a field is not found, use empty string ""

Return ONLY valid JSON with this exact structure:
{
  "nama_lengkap_cv": "Full name from CV",
  "ringkasan_profil": "Profile summary or objective",
  "keahlian_utama": "Main skills (comma-separated)",
  "total_pengalaman_tahun": "Total years of experience (number only)",
  "bahasa_dikuasai": "Languages (comma-separated, e.g., Indonesia, Inggris)",
  "pengalaman_kerja_terakhir": "Most recent work experience (position + company)",
  "sertifikasi_profesional": "Professional certifications (comma-separated)"
}`;

    const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
    const result = await this.model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Scan STNK document and extract fields
   */
  async scanSTNK(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian STNK (Surat Tanda Nomor Kendaraan) document carefully and extract ALL information in JSON format.

IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document
- "No. Polisi" is the vehicle registration number (e.g., KB 1234 AB)
- "Merek" is the vehicle brand (e.g., TOYOTA, HONDA)
- "Warna" is the vehicle color
- "Tahun Pembuatan" is the manufacturing year (e.g., 2020)
- If a field is not visible, use empty string ""

Return ONLY valid JSON with this exact structure:
{
  "no_polisi": "License Plate Number",
  "merek": "Vehicle Brand",
  "warna": "Vehicle Color",
  "tahun_pembuatan": "Manufacturing Year"
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(
          "AI tidak dapat menemukan data STNK yang valid. Pastikan dokumen terbaca.",
        );
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      if (
        error.message.includes("AI tidak dapat") ||
        error.message.includes("Dokumen tidak dapat")
      ) {
        throw error;
      }
      throw new Error(`Gagal memproses STNK: ${error.message}`);
    }
  }

  /**
   * Main scan function - routes to appropriate scanner based on document type
   */
  async scanDocument(pdfBuffer, documentType) {
    throw new Error("Gemini Scanning disabled. Please use Mistral AI Scanner.");
  }

  /**
   * Scan NPWP Perusahaan (Company Tax ID) document and extract fields
   */
  async scanNPWPPerusahaan(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian NPWP Perusahaan (Company Tax ID) document carefully and extract ALL information in JSON format.
    
IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document.
- Use UPPERCASE for values that are in uppercase.
- For NPWP number, use format: XX.XXX.XXX.X-XXX.XXX.
- "alamat": This is CRITICAL. Scan the entire document for the address. 
  - It usually follows "Alamat", "Tempat Kedudukan", or is located below the company name.
  - It often contains keywords like "Jl.", "Jalan", "Gedung", "Ruko", "Kav", "No", "RT", "RW", "Kel", "Kec".
  - Capture the FULL address string including Street, Number, RT/RW, Kelurahan, Kecamatan, City/Regency, and Postal Code. 
  - Do NOT truncate. 
- "tanggal_terdaftar": Extract the date (usually at the bottom) in YYYY-MM-DD format.

Return ONLY valid JSON with this exact structure:
{
  "nomor_npwp": "NPWP number (XX.XXX.XXX.X-XXX.XXX)",
  "nama_wp": "Company name as registered",
  "alamat": "Full registered address found in document",
  "kpp": "KPP name (e.g., KPP Pratama Jakarta Pusat)",
  "tanggal_terdaftar": "Registration date (YYYY-MM-DD)"
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      console.log("[GEMINI AI DEBUG] Raw NPWP Response:", text);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(
          "AI tidak dapat menemukan data NPWP yang valid di dokumen. Pastikan PDF berisi NPWP perusahaan yang jelas dan terbaca.",
        );
      }

      // Clean up potential markdown formatting
      let jsonString = jsonMatch[0];
      jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "");

      const parsedData = JSON.parse(jsonString);

      console.log("[GEMINI AI DEBUG] Parsed NPWP Data:", parsedData);
      console.log(
        "[GEMINI AI DEBUG] Alamat value:",
        parsedData.alamat || "(EMPTY/UNDEFINED)",
      );

      const hasData = Object.values(parsedData).some(
        (value) => value && value.trim() !== "",
      );
      if (!hasData) {
        throw new Error(
          "Dokumen tidak dapat dibaca atau bukan NPWP yang valid. Silakan gunakan scan/foto yang lebih jelas.",
        );
      }

      return parsedData;
    } catch (error) {
      if (
        error.message.includes("AI tidak dapat") ||
        error.message.includes("Dokumen tidak dapat")
      ) {
        throw error;
      }
      throw new Error(`Gagal memproses NPWP Perusahaan: ${error.message}.`);
    }
  }

  /**
   * Scan SPT (Surat Pemberitahuan Tahunan) document and extract fields
   */
  async scanSPT(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian SPT (Surat Pemberitahuan Tahunan / Annual Tax Return) document carefully and extract ALL information in JSON format.

IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document
- For dates, MUST use format YYYY-MM-DD (e.g., "2024-12-09" for 9 Desember 2024)
- Nominal should be number only (no currency or separators)
- "nitku" (Nomor Identitas Tempat Kegiatan Usaha): Look carefully for this field! It may be labeled as:
  - "NITKU"
  - "Nomor Identitas Tempat Kegiatan Usaha"
  - Usually a 16-digit number similar to NPWP format
  - Often appears near the NPWP field or in the taxpayer information section
  - IMPORTANT: Do not leave this field empty if you see any number labeled as NITKU
- If a field is not visible or truly not present in the document, use empty string ""

Return ONLY valid JSON with this exact structure:
{
  "tahun_pajak": "Tax year (YYYY)",
  "masa_pajak": "Tax period (e.g., Januari-Desember)",
  "jenis_spt": "SPT type (e.g., SPT Tahunan PPh Badan)",
  "pembetulan_ke": "Revision number (0 for normal)",
  "nominal": "Tax amount (number only)",
  "tanggal_penyampaian": "Submission date (YYYY-MM-DD)",
  "nomor_tanda_terima": "Receipt number",
  "nama_wp": "Taxpayer name",
  "npwp": "NPWP number",
  "nitku": "NITKU (16-digit number if shown)",
  "status_spt": "SPT status (e.g., Normal, Pembetulan)"
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(
          "AI tidak dapat menemukan data SPT yang valid di dokumen.",
        );
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Gagal memproses SPT: ${error.message}.`);
    }
  }

  /**
   * Scan PKP (Pengukuhan Kena Pajak) document and extract fields
   */
  async scanPKP(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian PKP (Pengukuhan Kena Pajak / VAT Registration) document carefully and extract ALL information in JSON format.

IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document
- For dates, MUST use format YYYY-MM-DD (e.g., "2024-12-09" for 9 Desember 2024)
- "nomor_pkp": Extract the PKP registration number
- "npwp": Extract the NPWP number (format XX.XXX.XXX.X-XXX.XXX)
- "tanggal_pengukuhan": Extract the registration/confirmation date
- If a field is not visible, use empty string ""

Return ONLY valid JSON with this exact structure:
{
  "nomor_pkp": "PKP registration number",
  "npwp": "NPWP number (XX.XXX.XXX.X-XXX.XXX)",
  "tanggal_pengukuhan": "Registration date (YYYY-MM-DD)"
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(
          "AI tidak dapat menemukan data PKP yang valid di dokumen.",
        );
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Gagal memproses PKP: ${error.message}.`);
    }
  }

  /**
   * Scan KSWP (Kepatuhan Wajib Pajak) document and extract fields
   */
  async scanKSWP(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian KSWP (Kepatuhan Wajib Pajak / Tax Compliance) document carefully and extract ALL information in JSON format.

IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document
- For dates, MUST use format YYYY-MM-DD (e.g., "2024-12-09" for 9 Desember 2024)
- Status should be "Patuh" or "Tidak Patuh"
- If a field is not visible, use empty string ""

Return ONLY valid JSON with this exact structure:
{
  "nama_wp": "Taxpayer name",
  "npwp": "NPWP number",
  "tahun_kswp": "KSWP year (YYYY)",
  "status_kswp": "Status (Patuh or Tidak Patuh)",
  "tanggal_terbit": "Issue date (YYYY-MM-DD, e.g., 2024-12-09)"
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(
          "AI tidak dapat menemukan data KSWP yang valid di dokumen.",
        );
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Gagal memproses KSWP: ${error.message}.`);
    }
  }

  /**
   * Main scan function for tax documents - routes to appropriate scanner
   */
  async scanTaxDocument(pdfBuffer, documentType) {
    throw new Error(
      "Gemini Tax Scanning disabled. Please use Mistral AI Scanner.",
    );
  }
  /**
   * Scan Akta Perusahaan document
   */
  async scanAkta(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian Akta Perusahaan (Deed of Company) document carefully and extract ALL information in JSON format.
    
IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document
- "jenis_akta" MUST be "Pendirian" or "Perubahan". Look for title or context (e.g. "AKTA PENDIRIAN" -> "Pendirian", "AKTA PERUBAHAN" -> "Perubahan").
- "nomor_akta": Extract the deed number.
- "tanggal_akta": Extract the date of deed in YYYY-MM-DD format.
- "notaris": Extract the notary's full name.

Return ONLY valid JSON with this exact structure:
{
  "jenis_akta": "Pendirian",
  "nomor_akta": "...",
  "tanggal_akta": "YYYY-MM-DD",
  "notaris": "..."
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI failed to extract JSON");
      }

      // Clean up potential markdown formatting or unexpected characters
      let jsonString = jsonMatch[0];
      // Sometimes models add ```json ... ``` wrapper inside the match if regex isn't strict enough
      // or add trailing commas.
      // Basic cleanup:
      jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "");

      return JSON.parse(jsonString);
    } catch (e) {
      throw new Error("Gagal memproses Akta: " + e.message);
    }
  }

  /**
   * Scan NIB (Nomor Induk Berusaha) document
   */
  async scanNIB(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian NIB (Nomor Induk Berusaha) document carefully and extract ALL information in JSON format.
    
IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document
- "nomor_nib": Extract the NIB number (usually 13 digits).
- "tanggal_terbit": Extract the date of issuance in YYYY-MM-DD format. "Diterbitkan tanggal: ..."
- "status_penanaman_modal": Extract investment status (e.g., "PMDN", "PMA").
- "skala_usaha": Extract business scale (e.g., "Mikro", "Kecil", "Menengah", "Besar").
- "kbli": Extract ALL KBLI codes found (usually 5-digit numbers). Return as an array of strings.

Return ONLY valid JSON with this exact structure:
{
  "nomor_nib": "...",
  "tanggal_terbit": "YYYY-MM-DD",
  "status_penanaman_modal": "...",
  "skala_usaha": "...",
  "kbli": ["...", "..."]
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI failed to extract JSON");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error("Gagal memproses NIB: " + e.message);
    }
  }

  /**
   * Scan SBU (Sertifikat Badan Usaha) document
   */
  async scanSBU(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian SBU (Sertifikat Badan Usaha) document carefully and extract ALL information in JSON format.
    
IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document.
- "nomor_sbu": Extract SBU Number.
- "nomor_pb_umku": Extract PB-UMKU Number (if available).
- "jenis_usaha": Extract type of business (e.g. Jasa Konstruksi).
- "asosiasi": Extract Association name.
- "pjbu": Extract PJBU Name (Penanggung Jawab Badan Usaha).
- "pjtbu": Extract PJTBU Name (Penanggung Jawab Teknik).
- "nomor_registrasi_lpjk": Extract LPJK Registration Number.
- "pelaksana_sertifikasi": Extract Certification Body (LSBU).
- "tanggal_terbit": Extract Issue Date (YYYY-MM-DD).
- "masa_berlaku": Extract valid until Date (YYYY-MM-DD).
- "kualifikasi": Extract Qualification (e.g. Kecil, Menengah, Besar).
- "kode_subklasifikasi": Extract Subclassification Code.
- "sifat": Extract nature (Sifat).
- "kode_kbli": Extract KBLI Code.
- "nama_pjskbu": Extract PJSKBU Name.

Return ONLY valid JSON with this exact structure:
{
  "nomor_sbu": "...",
  "nomor_pb_umku": "...",
  "jenis_usaha": "...",
  "asosiasi": "...",
  "pjbu": "...",
  "pjtbu": "...",
  "nomor_registrasi_lpjk": "...",
  "pelaksana_sertifikasi": "...",
  "tanggal_terbit": "YYYY-MM-DD",
  "masa_berlaku": "YYYY-MM-DD",
  "kualifikasi": "...",
  "kode_subklasifikasi": "...",
  "sifat": "...",
  "kode_kbli": "...",
  "nama_pjskbu": "..."
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI failed to extract JSON");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error("Gagal memproses SBU: " + e.message);
    }
  }

  /**
   * Scan KTA (Kartu Tanda Anggota) document
   */
  async scanKTA(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian KTA (Kartu Tanda Anggota) document and extract information in JSON format.

IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document.
- "nomor_anggota": Extract Membership Number.
- "nama_asosiasi": Extract Association Name.
- "penanggung_jawab": Extract Person in Charge.
- "status_keanggotaan": Extract Status (e.g. Aktif).
- "tanggal_terbit": Extract Issue Date (YYYY-MM-DD).

Return ONLY valid JSON with this exact structure:
{
  "nomor_anggota": "...",
  "nama_asosiasi": "...",
  "penanggung_jawab": "...",
  "status_keanggotaan": "...",
  "tanggal_terbit": "YYYY-MM-DD"
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI failed to extract JSON");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error("Gagal memproses KTA: " + e.message);
    }
  }

  /**
   * Scan Kontrak Pengalaman document (Handles both SPK and Table formats)
   */
  async scanKontrakPengalaman(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this document which could be:
1. TABLE FORMAT: "Daftar Pengalaman" table with columns: No | Nama Pekerjaan | Bidang/Sub Bidang Pekerjaan | Lokasi
2. SPK FORMAT: Surat Perintah Kerja with PROGRAM, KEGIATAN, SUB KEGIATAN, PEKERJAAN sections

Extract the following in JSON format:

FOR TABLE FORMAT (Daftar Pengalaman):
- Look for table with columns: "Nama Pekerjaan", "Bidang/Sub Bidang Pekerjaan", "Lokasi"
- Extract the FIRST row of data (ignore header)
- MAPPING:
  * "Nama Pekerjaan" column → Extract as "pekerjaan"
  * "Bidang/Sub Bidang Pekerjaan" column → Extract as "sub_kegiatan" (capture ALL text in this cell)
  * "Lokasi" column → Extract as "lokasi"

FOR SPK FORMAT:
- Look for "PROGRAM:", "KEGIATAN:", "SUB KEGIATAN:", "PEKERJAAN:" labels
- Combine PROGRAM and KEGIATAN into single field
- Extract contact information and combine into formatted string

IMPORTANT:
- For dates use YYYY-MM-DD format
- For Nilai Kontrak, extract number only (no Rp, dots, or commas)
- If a cell has multiple lines, capture ALL text from that cell
- If field not found, use empty string ""

JSON Structure:
{
  "kegiatan": "Combined from PROGRAM + KEGIATAN (SPK) or Nama Pekerjaan (TABLE)",
  "sub_kegiatan": "From SUB KEGIATAN (SPK) or Bidang/Sub Bidang column (TABLE)",
  "pekerjaan": "From PEKERJAAN (SPK) or`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, "application/pdf");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI failed to extract JSON");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error("Gagal memproses Kontrak: " + e.message);
    }
  }

  /**
   * Scan Company Document (Akta, NIB, etc.)
   */
  async scanCompanyDocument(pdfBuffer, documentType) {
    throw new Error(
      "Gemini Company Scanning disabled. Please use Mistral AI Scanner.",
    );
  }
}

// Export singleton instance
export default new GeminiAIService();
