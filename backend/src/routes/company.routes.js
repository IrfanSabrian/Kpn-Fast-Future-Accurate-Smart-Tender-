/**
 * Company Profile Routes
 * 
 * API endpoints untuk company profile management (multiple companies support)
 */

import express from 'express';
import {
  getAllCompanies,
  getCompanyById,
  addCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/company.controller.js';

const router = express.Router();

/**
 * @route   GET /api/company
 * @desc    Get all company profiles
 * @access  Public
 */
router.get('/', getAllCompanies);

/**
 * @route   GET /api/company/:id
 * @desc    Get company profile by ID
 * @access  Public
 */
router.get('/:id', getCompanyById);

/**
 * @route   POST /api/company
 * @desc    Add new company profile
 * @access  Protected
 */
router.post('/', addCompany);

/**
 * @route   PUT /api/company/:id
 * @desc    Update company profile by ID
 * @access  Protected
 */
router.put('/:id', updateCompany);

/**
 * @route   DELETE /api/company/:id
 * @desc    Delete company profile by ID
 * @access  Protected
 */
router.delete('/:id', deleteCompany);

export default router;
