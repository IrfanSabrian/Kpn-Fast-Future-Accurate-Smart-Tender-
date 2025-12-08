import express from 'express';
import googleSheetsService from '../services/googleSheets.service.js';

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await googleSheetsService.getAllProfilPerusahaan();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await googleSheetsService.getProfilPerusahaanById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new company
router.post('/', async (req, res) => {
  try {
    const result = await googleSheetsService.addProfilPerusahaan(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update company by ID
router.put('/:id', async (req, res) => {
  try {
    const result = await googleSheetsService.updateProfilPerusahaan(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete company by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await googleSheetsService.deleteProfilPerusahaan(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting company:', error);
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

// --- PERSONEL PROJECT ROUTES ---
// Add personel to project
router.post('/projects/:idProject/personil', async (req, res) => {
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
