import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

class GeminiAIService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  async initialize() {
    if (this.model) return;

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY tidak ditemukan di environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ Gemini AI Service initialized (model: gemini-2.5-flash)');
  }

  /**
   * Convert file buffer to Gemini-compatible format
   */
  fileToGenerativePart(buffer, mimeType) {
    return {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType
      }
    };
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
      const imagePart = this.fileToGenerativePart(pdfBuffer, 'application/pdf');
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response (remove markdown code blocks if present)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI tidak dapat menemukan data KTP yang valid di dokumen. Pastikan PDF berisi KTP yang jelas dan terbaca.');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validate that we got some actual data (not all empty)
      const hasData = Object.values(parsedData).some(value => value && value.trim() !== '');
      if (!hasData) {
        throw new Error('Dokumen tidak dapat dibaca atau bukan KTP yang valid. Silakan gunakan scan/foto yang lebih jelas.');
      }

      return parsedData;
    } catch (error) {
      if (error.message.includes('AI tidak dapat') || error.message.includes('Dokumen tidak dapat')) {
        throw error;
      }
      throw new Error(`Gagal memproses KTP: ${error.message}. Kemungkinan file rusak atau bukan dokumen KTP.`);
    }
  }

  /**
   * Scan NPWP document and extract fields
   */
  async scanNPWP(pdfBuffer) {
    await this.initialize();

    const prompt = `Analyze this Indonesian NPWP (Nomor Pokok Wajib Pajak / Tax ID) document carefully and extract ALL information in JSON format.

IMPORTANT INSTRUCTIONS:
- Extract EXACTLY as written in the document
- Use UPPERCASE for values that are in uppercase
- For NPWP number, use format: XX.XXX.XXX.X-XXX.XXX
- If a field is not visible, use empty string ""

Return ONLY valid JSON with this exact structure:
{
  "nomor_npwp_personel": "NPWP number (XX.XXX.XXX.X-XXX.XXX)",
  "nik_npwp_personel": "16-digit NIK if shown",
  "nama_npwp_personel": "Full name as shown",
  "kpp_npwp_personel": "KPP name (e.g., KPP Pratama Jakarta Pusat)",
  "alamat_npwp_personel": "Full registered address"
}`;

    try {
      const imagePart = this.fileToGenerativePart(pdfBuffer, 'application/pdf');
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI tidak dapat menemukan data NPWP yang valid di dokumen. Pastikan PDF berisi NPWP yang jelas dan terbaca.');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      const hasData = Object.values(parsedData).some(value => value && value.trim() !== '');
      if (!hasData) {
        throw new Error('Dokumen tidak dapat dibaca atau bukan NPWP yang valid. Silakan gunakan scan/foto yang lebih jelas.');
      }

      return parsedData;
    } catch (error) {
      if (error.message.includes('AI tidak dapat') || error.message.includes('Dokumen tidak dapat')) {
        throw error;
      }
      throw new Error(`Gagal memproses NPWP: ${error.message}. Kemungkinan file rusak atau bukan dokumen NPWP.`);
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

    const imagePart = this.fileToGenerativePart(pdfBuffer, 'application/pdf');
    const result = await this.model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
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

    const imagePart = this.fileToGenerativePart(pdfBuffer, 'application/pdf');
    const result = await this.model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Main scan function - routes to appropriate scanner based on document type
   */
  async scanDocument(pdfBuffer, documentType) {
    console.log(`[GEMINI AI] Scanning ${documentType.toUpperCase()} document...`);

    try {
      let result;
      
      switch (documentType.toLowerCase()) {
        case 'ktp':
          result = await this.scanKTP(pdfBuffer);
          break;
        case 'npwp':
          result = await this.scanNPWP(pdfBuffer);
          break;
        case 'ijazah':
          result = await this.scanIjazah(pdfBuffer);
          break;
        case 'cv':
          result = await this.scanCV(pdfBuffer);
          break;
        default:
          throw new Error(`Unsupported document type: ${documentType}`);
      }

      console.log(`[GEMINI AI] ✅ Successfully scanned ${documentType.toUpperCase()}`);
      return result;

    } catch (error) {
      console.error(`[GEMINI AI] ❌ Error scanning ${documentType}:`, error.message);
      throw error;
    }
  }
}

// Export singleton instance
export default new GeminiAIService();
