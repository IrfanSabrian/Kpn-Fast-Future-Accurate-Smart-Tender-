/**
 * OAuth2 Authentication Routes
 */

import express from 'express';
import { checkAuthStatus, getAuthUrl, handleCallback, getCurrentUser, logout } from '../controllers/oauth2Auth.controller.js';

const router = express.Router();

// Check if user is authenticated
router.get('/status', checkAuthStatus);

// Get Google OAuth2 login URL
router.get('/google/url', getAuthUrl);

// Handle OAuth2 callback from Google
router.get('/google/callback', handleCallback);

// Get current authenticated user info (with profile picture)
router.get('/me', getCurrentUser);

// Logout (delete token)
router.post('/logout', logout);

export default router;
