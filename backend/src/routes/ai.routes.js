import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import geminiAIService from "../services/geminiAI.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for memory storage (we don't need to save the file)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

/**
 * POST /api/ai/scan-document
 * Scan PDF document and extract fields using Gemini AI
 *
 * @body {File} file - PDF file to scan
 * @body {String} documentType - Type of document (ktp, npwp, ijazah, cv)
 * @returns {Object} Extracted fields as JSON
 */
router.post("/scan-document", upload.single("file"), async (req, res) => {
  try {
    const { documentType } = req.body;

    // Validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "documentType is required (ktp, npwp, ijazah, or cv)",
      });
    }

    const validTypes = ["ktp", "npwp", "ijazah", "cv"];
    if (!validTypes.includes(documentType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid documentType. Must be one of: ${validTypes.join(
          ", "
        )}`,
      });
    }

    console.log(
      `[AI SCAN] Received request to scan ${documentType.toUpperCase()}, file size: ${(
        req.file.size / 1024
      ).toFixed(2)}KB`
    );

    // Scan document with Gemini AI
    const extractedData = await geminiAIService.scanDocument(
      req.file.buffer,
      documentType
    );

    res.json({
      success: true,
      message: `${documentType.toUpperCase()} scanned successfully`,
      data: extractedData,
    });
  } catch (error) {
    console.error("[AI SCAN] Error:", error);
    console.error("[AI SCAN] Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to scan document",
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/scan-tax-document
 * Scan company tax PDF document and extract fields using Gemini AI
 *
 * @body {File} file - PDF file to scan
 * @body {String} documentType - Type of tax document (npwp, spt, pkp, kswp)
 * @returns {Object} Extracted fields as JSON
 */
router.post("/scan-tax-document", upload.single("file"), async (req, res) => {
  try {
    const { documentType } = req.body;

    // Validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "documentType is required (npwp, spt, pkp, or kswp)",
      });
    }

    const validTypes = ["npwp", "spt", "pkp", "kswp"];
    if (!validTypes.includes(documentType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid documentType. Must be one of: ${validTypes.join(
          ", "
        )}`,
      });
    }

    console.log(
      `[AI TAX SCAN] Received request to scan ${documentType.toUpperCase()}, file size: ${(
        req.file.size / 1024
      ).toFixed(2)}KB`
    );

    // Scan tax document with Gemini AI
    const extractedData = await geminiAIService.scanTaxDocument(
      req.file.buffer,
      documentType
    );

    res.json({
      success: true,
      message: `${documentType.toUpperCase()} scanned successfully`,
      data: extractedData,
    });
  } catch (error) {
    console.error("[AI TAX SCAN] Error:", error);
    console.error("[AI TAX SCAN] Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to scan tax document",
      error: error.message,
    });
  }
});

export default router;
