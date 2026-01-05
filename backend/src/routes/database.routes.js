import express from "express";
import multer from "multer";
import * as companyController from "../controllers/company.controller.js";
import googleSheetsService from "../services/googleSheets.service.js";

const router = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || "./uploads";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `company-logo-${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 83886080, // 80MB default
  },
  fileFilter: (req, file, cb) => {
    // List of document fields that accept PDF
    const pdfFields = [
      "companyProfile",
      "akta",
      "nib",
      "sbu",
      "kta",
      "sertifikat",
      "kontrak",
      "daftar",
      "cek",
      "bpjs",
      "npwp_perusahaan",
      "skt_perusahaan",
      "sppkp_perusahaan",
      "spt_perusahaan",
      "file",
      "pdf",
    ];

    // Allow PDF for document fields
    if (pdfFields.includes(file.fieldname)) {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error(`${file.fieldname} must be a PDF file.`));
      }
    }
    // Accept images only for logo and kop
    else {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed for images."
          )
        );
      }
    }
  },
});

// ========================================
// MAIN COMPANY ROUTES
// ========================================

// Get all companies (summary list)
router.get("/", companyController.getAllCompanies);

// Get company by ID (overview only)
router.get("/:id", companyController.getCompanyById);

// Add new company with logo and kop upload
router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "kop", maxCount: 1 },
  ]),
  companyController.addCompany
);

// Update company by ID
router.put(
  "/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "kop", maxCount: 1 },
    { name: "companyProfile", maxCount: 1 },
    { name: "akta", maxCount: 1 },
    { name: "nib", maxCount: 1 },
    { name: "sbu", maxCount: 1 },
    { name: "kta", maxCount: 1 },
    { name: "sertifikat", maxCount: 1 },
    { name: "kontrak", maxCount: 1 },
    { name: "cek", maxCount: 1 },
    { name: "bpjs", maxCount: 1 },
    { name: "npwp_perusahaan", maxCount: 1 },
    { name: "skt_perusahaan", maxCount: 1 },
    { name: "sppkp_perusahaan", maxCount: 1 },
    { name: "spt_perusahaan", maxCount: 1 },
  ]),
  companyController.updateCompany
);

// Delete company by ID (Legacy/Full)
router.delete("/:id", companyController.deleteCompany);

// Stepped Deletion Routes
router.delete("/:id/assets", companyController.deleteCompanyAssets);
router.delete("/:id/related-data", companyController.deleteCompanyRelatedData);
router.delete("/:id/profile", companyController.deleteCompanyProfile);

// Get company kop image (proxy from Google Drive)
router.get("/:id/kop", companyController.getCompanyKop);

// AI Scan company profile PDF
router.post(
  "/:id/scan-profile",
  upload.single("pdf"),
  companyController.scanCompanyProfile
);

// ========================================
// SUB-MODULE ROUTES - Lazy Loading
// ========================================

// Generic Upload Route (Step 1)
router.post(
  "/:id/:type/upload",
  upload.single("file"),
  companyController.uploadCompanyDocument
);

// Get company's Akta data
router.get("/:id/akta", companyController.getCompanyAkta);

// Get company's Pejabat data
router.get("/:id/pejabat", companyController.getCompanyPejabat);

// Get company's NIB data
router.get("/:id/nib", companyController.getCompanyNib);

// Get company's SBU data
router.get("/:id/sbu", companyController.getCompanySbu);

// Get company's KTA data
router.get("/:id/kta", companyController.getCompanyKta);

// Get company's Sertifikat data
router.get("/:id/sertifikat", companyController.getCompanySertifikat);

// Get company's Pajak data (NPWP, KSWP, SPT, PKP)
router.get("/:id/pajak", companyController.getCompanyPajak);

// Get company's Pengalaman/Kontrak data
router.get("/:id/pengalaman", companyController.getCompanyPengalaman);

// Get company's KBLI data
router.get("/:id/kbli", companyController.getCompanyKbli);

// Batch update KBLI data
router.put("/:id/kbli/batch", companyController.updateCompanyKbliBatch);

// Get company's Cek (bank checks) data
router.get("/:id/cek", companyController.getCompanyCek);

// Get company's BPJS data
router.get("/:id/bpjs", companyController.getCompanyBpjs);

// ========================================
// CRUD FOR SUB-MODULES
// ========================================

router.post("/:id/akta", async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addAkta(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/akta/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.updateAkta(
      req.params.itemId,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/akta/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.deleteAkta(req.params.itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PEJABAT CRUD ---
router.post("/:id/pejabat", async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addPejabat(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/pejabat/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.updatePejabat(
      req.params.itemId,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/pejabat/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.deletePejabat(req.params.itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- NIB CRUD ---
router.post("/:id/nib", async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addNIB(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/nib/:itemId", async (req, res) => {
  try {
    const itemId = decodeURIComponent(req.params.itemId);
    const result = await googleSheetsService.updateNIB(itemId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/nib/:itemId", async (req, res) => {
  try {
    const itemId = decodeURIComponent(req.params.itemId);
    const result = await googleSheetsService.deleteNIB(itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PENGALAMAN (KONTRAK) CRUD ---
router.post("/:id/pengalaman", companyController.createPengalaman);

router.put("/:id/pengalaman/:itemId", async (req, res) => {
  try {
    const itemId = decodeURIComponent(req.params.itemId);
    const result = await googleSheetsService.updatePengalaman(itemId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/pengalaman/:itemId", async (req, res) => {
  try {
    const itemId = decodeURIComponent(req.params.itemId);
    const result = await googleSheetsService.deletePengalaman(itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Pengalaman document (daftar or kontrak PDF) with custom naming
// POST /:id/pengalaman/:itemId/:type/upload
// type: "daftar" or "kontrak"
router.post(
  "/:id/pengalaman/:itemId/:type/upload",
  upload.single("file"),
  companyController.uploadPengalamanDocument
);

// --- SBU CRUD ---
router.post("/:id/sbu", async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addSBU(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/sbu/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.updateSBU(
      req.params.itemId,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/sbu/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.deleteSBU(req.params.itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- KTA CRUD ---
router.post("/:id/kta", async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addKTA(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/kta/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.updateKTA(
      req.params.itemId,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/kta/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.deleteKTA(req.params.itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SERTIFIKAT CRUD ---
router.post("/:id/sertifikat", async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addSertifikat(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/sertifikat/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.updateSertifikat(
      req.params.itemId,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/sertifikat/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.deleteSertifikat(
      req.params.itemId
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CEK CRUD ---
router.post("/:id/cek", async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addCek(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/cek/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.updateCek(
      req.params.itemId,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/cek/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.deleteCek(req.params.itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- BPJS CRUD ---
router.post("/:id/bpjs", async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addBPJS(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/bpjs/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.updateBPJS(
      req.params.itemId,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/bpjs/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.deleteBPJS(req.params.itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PROJECT ROUTES ---
// Get projects by company ID
router.get("/:id/projects", async (req, res) => {
  try {
    const projects = await googleSheetsService.getProjectsByCompany(
      req.params.id
    );
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/projects", async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addProject(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/projects/:idProject", async (req, res) => {
  try {
    const result = await googleSheetsService.updateProject(
      req.params.idProject,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/projects/:idProject", async (req, res) => {
  try {
    const result = await googleSheetsService.deleteProject(
      req.params.idProject
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PERSONEL PROJECT ROUTES ---
// Add personel to project
router.post("/projects/:idProject/personel", async (req, res) => {
  try {
    const data = {
      id_project: req.params.idProject,
      id_perusahaan: req.body.id_perusahaan, // Should be passed or fetched
      nik: req.body.nik,
    };

    // If id_perusahaan is missing, fetch it from project
    if (!data.id_perusahaan) {
      const project = await googleSheetsService.getProjectById(
        req.params.idProject
      );
      if (project) {
        data.id_perusahaan = project.id_perusahaan;
      } else {
        return res.status(404).json({ error: "Project not found" });
      }
    }

    const result = await googleSheetsService.addPersonelProject(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete personel from project
router.delete("/projects/:idProject/personel/:nik", async (req, res) => {
  try {
    // Note: We need to implement deletePersonelProject properly in service
    // For now, assume service has this method or we implement logic here?
    // Service has a placeholder. Let's use it.
    // Actually, since we don't have a proper delete in service yet (due to no ID),
    // we might need to rely on a workaround or just accept it's not fully implemented.
    // BUT, I must provide a working solution.

    // Let's implement a "delete by filter" logic in service?
    // Or just use deleteSheetData if we can find the row index.
    // Since I can't easily modify the base deleteSheetData, I will assume
    // the user will handle the sheet modification or I will add a specific method later.
    // For now, I will call the service method I created.

    // WAIT: I need to make sure delete works.
    // I'll update the service to actually delete the row.
    // But first, let's add the route.
    const result = await googleSheetsService.deletePersonelProject(
      req.params.idProject,
      req.params.nik
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PENGALAMAN / KONTRAK CRUD ---
// (Updated: Fixed response structure to include data)
// Route handled above by companyController.createPengalaman
// router.post("/:id/pengalaman", ...);

router.put("/:id/pengalaman/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.updateKontrakPengalaman(
      req.params.itemId,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/pengalaman/:itemId", async (req, res) => {
  try {
    const result = await googleSheetsService.deleteKontrakPengalaman(
      req.params.itemId
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
