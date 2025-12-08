/**
 * KBLI Routes
 * 
 * Routes for KBLI (Klasifikasi Baku Lapangan Usaha Indonesia) operations
 */

import { Router } from 'express';
import { getAllKbli, getKbliByCompanyId } from '../controllers/kbli.controller.js';

const router = Router();

// GET /api/kbli - Get all KBLI master data
router.get('/', getAllKbli);

// GET /api/kbli/company/:id - Get KBLI for specific company (enriched)
router.get('/company/:id', getKbliByCompanyId);

export default router;
