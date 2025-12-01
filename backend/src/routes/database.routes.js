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

// Get akta by company ID
router.get('/:id/akta', async (req, res) => {
  try {
    const akta = await googleSheetsService.getAllAkta(req.params.id);
    res.json(akta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pejabat by company ID
router.get('/:id/pejabat', async (req, res) => {
  try {
    const pejabat = await googleSheetsService.getAllPejabat(req.params.id);
    res.json(pejabat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get NIB by company ID
router.get('/:id/nib', async (req, res) => {
  try {
    const nib = await googleSheetsService.getAllNIB(req.params.id);
    res.json(nib);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get personil by company ID (through db_project)
router.get('/:id/personil', async (req, res) => {
  try {
    const personil = await googleSheetsService.getPersonilByCompany(req.params.id);
    res.json(personil);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pengalaman by company ID
router.get('/:id/pengalaman', async (req, res) => {
  try {
    const pengalaman = await googleSheetsService.getAllPengalaman(req.params.id);
    res.json(pengalaman);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get projects by company ID
router.get('/:id/projects', async (req, res) => {
  try {
    const projects = await googleSheetsService.getProjectsByCompany(req.params.id);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
