import express from 'express';
import { updateProgress } from '../controllers/user.controller';

const router = express.Router();

// Route to update user progress
router.post('/progress', updateProgress);

export default router; 