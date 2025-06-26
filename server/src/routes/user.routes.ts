import express from 'express';
import { updateProgress, getProfile } from '../controllers/user.controller';

const router = express.Router();

// Route to get user profile
router.get('/profile/:userId', getProfile);

// Route to update user progress
router.post('/progress', updateProgress);

export default router; 