/**
 * Groq AI Service - Vision & Text Generation
 * Free Tier: 14,400 requests/day, 30 requests/minute
 */

import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GroqAIService {
  constructor() {
    this.client = null;
    this.apiKey = null;
  }

  async initialize() {
    if (this.client) return;

    // Load API Key
    try {
      const configPath = path.join(__dirname, "../../config/api-settings.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        this.apiKey = config.groq_api_key;
      }
    } catch (e) {
      console.warn("⚠️  Groq: Gagal load api-settings.json");
    }

    if (!this.apiKey) {
      throw new Error("Groq API Key tidak ditemukan!");
    }

    this.client = new Groq({ apiKey: this.apiKey });
    console.log("✅ Groq AI Service initialized");
  }

  async testConnection() {
    await this.initialize();

    if (!this.client) {
      throw new Error("Groq API key not configured");
    }

    try {
      // Simple test: generate minimal text
      const response = await this.client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 10,
      });

      if (response && response.choices && response.choices.length > 0) {
        return { success: true, message: "Groq API connection successful" };
      }

      throw new Error("Invalid response from Groq API");
    } catch (error) {
      throw new Error(`Groq test failed: ${error.message}`);
    }
  }

  /**
   * Scan KTP menggunakan Llama 3.2 Vision
   */
  async scanKTP(pdfBuffer) {
    await this.initialize();

    const base64Image = pdfBuffer.toString("base64");
    const imageUrl = `data:image/pdf;base64,${base64Image}`;

    const prompt = `Anda adalah AI ekstraksi dokumen. Analisis dokumen KTP Indonesia ini dan ekstrak data berikut dalam format JSON:
{
  "nik_ktp": "16 digit NIK",
  "nama_ktp": "Nama Lengkap",
  "tempat_lahir_ktp": "Tempat Lahir",
  "tanggal_lahir_ktp": "DD-MM-YYYY",
  "jenis_kelamin_ktp": "LAKI-LAKI atau PEREMPUAN",
  "alamat_ktp": "Alamat lengkap",
  "rt_rw_ktp": "RT/RW",
  "kel_desa_ktp": "Kelurahan/Desa",
  "kecamatan_ktp": "Kecamatan",
  "agama_ktp": "Agama",
  "status_perkawinan_ktp": "Status",
  "pekerjaan_ktp": "Pekerjaan",
  "kewarganegaraan_ktp": "Kewarganegaraan"
}

PENTING: Return HANYA JSON, tanpa teks tambahan.`;

    const response = await this.client.chat.completions.create({
      model: "llama-3.2-11b-vision-preview", // Updated from 90b (decommissioned) to 11b
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const rawText = response.choices[0]?.message?.content || "{}";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  }

  /**
   * Scan NPWP menggunakan Llama 3.2 Vision
   */
  async scanNPWP(pdfBuffer) {
    await this.initialize();

    const base64Image = pdfBuffer.toString("base64");
    const imageUrl = `data:image/pdf;base64,${base64Image}`;

    const prompt = `Ekstrak data dari dokumen NPWP Indonesia (old/new version). Return JSON:
{
  "nomor_npwp_personel": "15-16 digit",
  "nik_npwp_personel": "NIK 16 digit (jika ada)",
  "nama_npwp_personel": "Nama Lengkap"
}
Return ONLY valid JSON.`;

    const response = await this.client.chat.completions.create({
      model: "llama-3.2-11b-vision-preview", // Updated from 90b
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 512,
    });

    const rawText = response.choices[0]?.message?.content || "{}";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  }

  /**
   * Generate text technical proposal (Reasoning)
   */
  async generateTechnicalProposal(projectData, prompt) {
    await this.initialize();

    const response = await this.client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Anda adalah asisten tender yang ahli menulis usulan teknis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    return response.choices[0]?.message?.content || "";
  }

  async forceReload() {
    this.client = null;
    this.apiKey = null;
  }
}

export default new GroqAIService();
