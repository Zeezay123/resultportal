import express from 'express';
import { Signin } from '../Controllers/auth.controller.js';
import { VerifyUser } from '../utils/VerifyUser.js';


const router = express.Router();

// Define your auth routes here
 
// Login route - no authentication required
router.post('/login', Signin)

// Protected routes (use VerifyUser middleware for routes that need authentication)
// Example: router.get('/profile', VerifyUser, getProfile)

export default router;