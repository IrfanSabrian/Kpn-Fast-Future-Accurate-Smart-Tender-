import express from 'express';
import googleSheetsService from '../services/googleSheets.service.js';

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await googleSheetsService.getAllCompanies();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await googleSheetsService.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AKTA ROUTES ---
// Get akta by company ID
router.get('/:id/akta', async (req, res) => {
  try {
    const akta = await googleSheetsService.getAllAkta(req.params.id);
    res.json(akta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// --- PEJABAT ROUTES ---
// Get pejabat by company ID
router.get('/:id/pejabat', async (req, res) => {
  try {
    const pejabat = await googleSheetsService.getAllPejabat(req.params.id);
    res.json(pejabat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// --- NIB ROUTES ---
// Get NIB by company ID
router.get('/:id/nib', async (req, res) => {
  try {
    const nib = await googleSheetsService.getAllNIB(req.params.id);
    res.json(nib);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
    // Decode param because NIB might contain special chars or be long
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

// --- PENGALAMAN ROUTES ---
// Get pengalaman by company ID
router.get('/:id/pengalaman', async (req, res) => {
  try {
    const pengalaman = await googleSheetsService.getAllPengalaman(req.params.id);
    res.json(pengalaman);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

export default router;
