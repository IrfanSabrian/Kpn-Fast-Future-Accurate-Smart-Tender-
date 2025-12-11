/**
 * Recent Activities Routes
 */

import express from 'express';
import { getRecentActivities } from '../controllers/recentActivities.controller.js';

const router = express.Router();

// GET /api/activities/recent?limit=10
router.get('/recent', getRecentActivities);

export default router;
