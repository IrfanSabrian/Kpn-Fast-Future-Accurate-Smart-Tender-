import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import geminiAIService from "../services/geminiAI.service.js";
import oauth2GoogleService from "../services/oauth2Google.service.js";

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

/**
 * POST /api/ai/scan-drive-file
 * Scan document from Google Drive URL
 */
router.post("/scan-drive-file", async (req, res) => {
  try {
    const { fileUrl, documentType, category } = req.body;

    if (!fileUrl || !documentType) {
      return res.status(400).json({
        success: false,
        message: "Missing fileUrl or documentType",
      });
    }

    // Extract File ID
    const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google Drive URL",
      });
    }

    console.log(
      `[AI DRIVE SCAN] Downloading file ${fileId} for type ${documentType}...`
    );
    const buffer = await oauth2GoogleService.downloadFile(fileId);

    let data;
    // Route to appropriate scanner based on category/type
    // Route to appropriate scanner based on category/type
    if (category === "tax") {
      data = await geminiAIService.scanTaxDocument(buffer, documentType);
    } else if (category === "company") {
      data = await geminiAIService.scanCompanyDocument(buffer, documentType);
    } else if (category === "personnel") {
      // Explicit personnel category
      data = await geminiAIService.scanDocument(buffer, documentType);
    } else {
      // Default logic / Auto-detection
      const taxTypes = ["spt", "pkp", "kswp"]; // Removed npwp from here to avoid conflict

      if (documentType.toLowerCase() === "npwp") {
        // Ambiguous case. If not specified, default to Personnel?
        // Or check if it looks like company?
        // For now, let's assume 'scanDocument' (Personnel) because 'scan-tax-document' exists for companies.
        data = await geminiAIService.scanDocument(buffer, documentType);
      } else if (taxTypes.includes(documentType.toLowerCase())) {
        data = await geminiAIService.scanTaxDocument(buffer, documentType);
      } else if (["akta", "nib", "sbu"].includes(documentType.toLowerCase())) {
        data = await geminiAIService.scanCompanyDocument(buffer, documentType);
      } else {
        // Personnel default
        data = await geminiAIService.scanDocument(buffer, documentType);
      }
    }

    res.json({
      success: true,
      message: `${documentType.toUpperCase()} scanned successfully`,
      data: data,
    });
  } catch (error) {
    console.error("[AI DRIVE SCAN] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to scan drive file",
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/scan-generic
 * Scan any company document type supported by scanCompanyDocument
 */
router.post("/scan-generic", upload.single("file"), async (req, res) => {
  try {
    const { documentType } = req.body;

    if (!req.file || !documentType) {
      return res
        .status(400)
        .json({ success: false, message: "File and documentType required" });
    }

    console.log(`[AI GENERIC SCAN] Scanning ${documentType}...`);
    // Reuse scanCompanyDocument which now supports 'kontrak_pengalaman'
    const data = await geminiAIService.scanCompanyDocument(
      req.file.buffer,
      documentType
    );

    res.json({ success: true, data });
  } catch (error) {
    console.error(`[AI GENERIC SCAN] Error:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
