/**
 * Personnel Routes
 * 
 * API endpoints untuk personnel/tenaga ahli management
 */

import express from 'express';
import {
  getAllPersonnel,
  getPersonnelById,
  addPersonnel,
  updatePersonnel,
  deletePersonnel,
} from '../controllers/personnel.controller.js';

const router = express.Router();

/**
 * @route   GET /api/personnel
 * @desc    Get all personnel
 * @access  Public
 */
router.get('/', getAllPersonnel);

/**
 * @route   GET /api/personnel/:id
 * @desc    Get personnel by ID
 * @access  Public
 */
router.get('/:id', getPersonnelById);

/**
 * @route   POST /api/personnel
 * @desc    Add new personnel
 * @access  Protected
 */
router.post('/', addPersonnel);

/**
 * @route   PUT /api/personnel/:id
 * @desc    Update personnel by ID
 * @access  Protected
 */
router.put('/:id', updatePersonnel);

/**
 * @route   DELETE /api/personnel/:id
 * @desc    Delete personnel by ID
 * @access  Protected
 */
router.delete('/:id', deletePersonnel);

export default router;
