import express from 'express';
import multer from 'multer';
import * as companyController from '../controllers/company.controller.js';
import googleSheetsService from '../services/googleSheets.service.js';

const router = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `company-logo-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 // 50MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF for companyProfile field
    if (file.fieldname === 'companyProfile') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Company Profile must be a PDF file.'));
      }
    } 
    // Accept images only for logo and kop
    else {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed for images.'));
      }
    }
  }
});

// ========================================
// MAIN COMPANY ROUTES
// ========================================

// Get all companies (summary list)
router.get('/', companyController.getAllCompanies);

// Get company by ID (overview only)
router.get('/:id', companyController.getCompanyById);

// Add new company with logo and kop upload
router.post('/', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'kop', maxCount: 1 }
]), companyController.addCompany);

// Update company by ID
router.put('/:id', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'kop', maxCount: 1 },
  { name: 'companyProfile', maxCount: 1 },
  { name: 'akta', maxCount: 1 },
  { name: 'nib', maxCount: 1 },
  { name: 'sbu', maxCount: 1 },
  { name: 'kta', maxCount: 1 },
  { name: 'sertifikat', maxCount: 1 },
  { name: 'kontrak', maxCount: 1 },
  { name: 'cek', maxCount: 1 }
]), companyController.updateCompany);

// Delete company by ID
router.delete('/:id', companyController.deleteCompany);

// Get company kop image (proxy from Google Drive)
router.get('/:id/kop', companyController.getCompanyKop);

// AI Scan company profile PDF
router.post('/:id/scan-profile', upload.single('pdf'), companyController.scanCompanyProfile);

// ========================================
// SUB-MODULE ROUTES - Lazy Loading
// ========================================

// Get company's Akta data
router.get('/:id/akta', companyController.getCompanyAkta);

// Get company's Pejabat data
router.get('/:id/pejabat', companyController.getCompanyPejabat);

// Get company's NIB data
router.get('/:id/nib', companyController.getCompanyNib);

// Get company's SBU data
router.get('/:id/sbu', companyController.getCompanySbu);

// Get company's KTA data
router.get('/:id/kta', companyController.getCompanyKta);

// Get company's Sertifikat data
router.get('/:id/sertifikat', companyController.getCompanySertifikat);

// Get company's Pajak data (NPWP, KSWP, SPT, PKP)
router.get('/:id/pajak', companyController.getCompanyPajak);

// Get company's Pengalaman/Kontrak data
router.get('/:id/pengalaman', companyController.getCompanyPengalaman);

// Get company's KBLI data
router.get('/:id/kbli', companyController.getCompanyKbli);

// Get company's Cek (bank checks) data
router.get('/:id/cek', companyController.getCompanyCek);

// ========================================
// CRUD FOR SUB-MODULES
// ========================================


router.post('/:id/akta', async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addAkta(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/akta/:aktaId', async (req, res) => {
  try {
    const result = await googleSheetsService.updateAkta(req.params.aktaId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/akta/:aktaId', async (req, res) => {
  try {
    const result = await googleSheetsService.deleteAkta(req.params.aktaId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PEJABAT CRUD ---
router.post('/:id/pejabat', async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addPejabat(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/pejabat/:nik', async (req, res) => {
  try {
    const result = await googleSheetsService.updatePejabat(req.params.nik, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/pejabat/:nik', async (req, res) => {
  try {
    const result = await googleSheetsService.deletePejabat(req.params.nik);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- NIB CRUD ---
router.post('/:id/nib', async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addNIB(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/nib/:nomorNib', async (req, res) => {
  try {
    const nomorNib = decodeURIComponent(req.params.nomorNib);
    const result = await googleSheetsService.updateNIB(nomorNib, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/nib/:nomorNib', async (req, res) => {
  try {
    const nomorNib = decodeURIComponent(req.params.nomorNib);
    const result = await googleSheetsService.deleteNIB(nomorNib);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PENGALAMAN CRUD ---
router.post('/:id/pengalaman', async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addPengalaman(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/pengalaman/:nomorKontrak', async (req, res) => {
  try {
    const nomorKontrak = decodeURIComponent(req.params.nomorKontrak);
    const result = await googleSheetsService.updatePengalaman(nomorKontrak, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/pengalaman/:nomorKontrak', async (req, res) => {
  try {
    const nomorKontrak = decodeURIComponent(req.params.nomorKontrak);
    const result = await googleSheetsService.deletePengalaman(nomorKontrak);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PROJECT ROUTES ---
// Get projects by company ID
router.get('/:id/projects', async (req, res) => {
  try {
    const projects = await googleSheetsService.getProjectsByCompany(req.params.id);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/projects', async (req, res) => {
  try {
    const data = { ...req.body, id_perusahaan: req.params.id };
    const result = await googleSheetsService.addProject(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/projects/:idProject', async (req, res) => {
  try {
    const result = await googleSheetsService.updateProject(req.params.idProject, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/projects/:idProject', async (req, res) => {
  try {
    const result = await googleSheetsService.deleteProject(req.params.idProject);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PERSONEL PROJECT ROUTES ---
// Add personel to project
router.post('/projects/:idProject/personel', async (req, res) => {
  try {
    const data = { 
      id_project: req.params.idProject,
      id_perusahaan: req.body.id_perusahaan, // Should be passed or fetched
      nik: req.body.nik 
    };
    
    // If id_perusahaan is missing, fetch it from project
    if (!data.id_perusahaan) {
      const project = await googleSheetsService.getProjectById(req.params.idProject);
      if (project) {
        data.id_perusahaan = project.id_perusahaan;
      } else {
        return res.status(404).json({ error: 'Project not found' });
      }
    }
    
    const result = await googleSheetsService.addPersonelProject(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete personel from project
router.delete('/projects/:idProject/personel/:nik', async (req, res) => {
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
    const result = await googleSheetsService.deletePersonelProject(req.params.idProject, req.params.nik);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
