/**
 * Personnel Documents Routes
 * 
 * API endpoints untuk manajemen dokumen personel (KTP, NPWP, Ijazah, CV)
 */

import express from 'express';
import multer from 'multer';
import {
  addKtp,
  updateKtp,
  deleteKtp,
  addNpwp,
  updateNpwp,
  deleteNpwp,
  addIjazah,
  updateIjazah,
  deleteIjazah,
  addCv,
  updateCv,
  deleteCv,
} from '../controllers/personnelDocuments.controller.js';

const router = express.Router();

// Configure multer for file uploads (in-memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * KTP Routes
 */
router.post('/:personelId/ktp', upload.single('file'), addKtp);
router.put('/:personelId/ktp', upload.single('file'), updateKtp);
router.delete('/:personelId/ktp', deleteKtp);

/**
 * NPWP Routes
 */
router.post('/:personelId/npwp', upload.single('file'), addNpwp);
router.put('/:personelId/npwp', upload.single('file'), updateNpwp);
router.delete('/:personelId/npwp', deleteNpwp);

/**
 * Ijazah Routes
 */
router.post('/:personelId/ijazah', upload.single('file'), addIjazah);
router.put('/:personelId/ijazah', upload.single('file'), updateIjazah);
router.delete('/:personelId/ijazah', deleteIjazah);

/**
 * CV Routes
 */
router.post('/:personelId/cv', upload.single('file'), addCv);
router.put('/:personelId/cv', upload.single('file'), updateCv);
router.delete('/:personelId/cv', deleteCv);

export default router;
