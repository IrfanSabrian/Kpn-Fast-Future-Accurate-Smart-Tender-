/**
 * Google Sheets Permission Routes
 */

import express from 'express';
import { shareWithMe, makePublic, shareWithEmail } from '../controllers/sheetsPermission.controller.js';

const router = express.Router();

// Share with current authenticated user
router.post('/share-with-me', shareWithMe);

// Make all sheets public (anyone with link)
router.post('/make-public', makePublic);

// Share with specific email
router.post('/share', shareWithEmail);

export default router;
