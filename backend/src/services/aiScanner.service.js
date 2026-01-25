/**
 * AI Scanner Service - Multi-Provider Orchestrator
 * Strategy: Mistral AI (Native PDF OCR)
 * Gemini reserved for analysis & technical proposals
 */

import geminiAIService from "./geminiAI.service.js";
import mistralAIService from "./mistralAI.service.js";

class AIScannerService {
  /**
   * Scan dokumen dengan Mistral AI (Native PDF support)
   */
  async scanDocument(fileBuffer, documentType) {
    console.log(`\n🔍 [AI SCANNER] Starting scan for: ${documentType}`);
    console.log(`   📄 Strategy: Mistral OCR (Native PDF)`);

    try {
      // Direct scan with Mistral (no conversion needed)
      const result = await mistralAIService.scanDocument(
        fileBuffer,
        documentType,
      );

      if (result) {
        console.log("   ✅ [MISTRAL] Scan SUCCESS!");
        return { data: result, provider: "mistral" };
      }

      throw new Error("Mistral returned empty result");
    } catch (error) {
      console.error(`   ❌ [SCANNER] Failed: ${error.message}`);
      throw new Error(
        `❌ Document scan failed: ${error.message}. Please try manual input.`,
      );
    }
  }

  /**
   * Scan with Gemini (for special cases - NOT used in normal flow)
   * Reserved for analysis & technical proposals
   */
  async _scanWithGemini(pdfBuffer, documentType) {
    console.warn("⚠️  Using Gemini for scanning - quota will be consumed!");
    return await geminiAIService.scanDocument(pdfBuffer, documentType);
  }
}

export default new AIScannerService();
