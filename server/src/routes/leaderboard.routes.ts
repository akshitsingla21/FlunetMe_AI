import express from 'express';
import { getLeaderboard, getUserRank } from '../controllers/leaderboard.controller';

const router = express.Router();

// Route to get the leaderboard data
router.get('/', getLeaderboard);
// Route to get a specific user's rank
router.get('/rank/:userId', getUserRank);

export default router; 