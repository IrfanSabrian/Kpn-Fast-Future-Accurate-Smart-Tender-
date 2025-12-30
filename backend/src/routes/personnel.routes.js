/**
 * Personnel Routes
 *
 * API endpoints untuk personnel/tenaga ahli management
 */

import express from "express";
import {
  getAllPersonnel,
  getPersonnelById,
  addPersonnel,
  updatePersonnel,
  deletePersonnel,
  deletePersonnelAssets,
  deletePersonnelRelatedData,
  deletePersonnelProfile,
} from "../controllers/personnel.controller.js";

const router = express.Router();

/**
 * @route   GET /api/personnel
 * @desc    Get all personnel
 * @access  Public
 */
router.get("/", getAllPersonnel);

/**
 * @route   GET /api/personnel/:id
 * @desc    Get personnel by ID
 * @access  Public
 */
router.get("/:id", getPersonnelById);

/**
 * @route   POST /api/personnel
 * @desc    Add new personnel
 * @access  Protected
 */
router.post("/", addPersonnel);

/**
 * @route   PUT /api/personnel/:id
 * @desc    Update personnel by ID
 * @access  Protected
 */
router.put("/:id", updatePersonnel);

/**
 * @route   DELETE /api/personnel/:id
 * @desc    Delete personnel by ID (Legacy/Full)
 * @access  Protected
 */
router.delete("/:id", deletePersonnel);

/**
 * @route   DELETE /api/personnel/:id/assets
 * @desc    Step 1: Delete Personnel Assets
 * @access  Protected
 */
router.delete("/:id/assets", deletePersonnelAssets);

/**
 * @route   DELETE /api/personnel/:id/related-data
 * @desc    Step 2: Delete Personnel Related Data
 * @access  Protected
 */
router.delete("/:id/related-data", deletePersonnelRelatedData);

/**
 * @route   DELETE /api/personnel/:id/profile
 * @desc    Step 3: Delete Personnel Profile
 * @access  Protected
 */
router.delete("/:id/profile", deletePersonnelProfile);

export default router;
