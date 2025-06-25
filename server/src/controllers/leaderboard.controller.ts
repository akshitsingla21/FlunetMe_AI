import { Request, Response } from 'express';
import User from '../models/user.model';

// @desc   Get top 10 users for the leaderboard
// @route  GET /api/leaderboard
// @access Public
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await User.find()
      .sort({ points: -1 }) // -1 for descending order
      .limit(10)
      .select('username points level'); // Select only the fields we need

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).send('Server Error');
  }
};

// @desc   Get the rank of a specific user
// @route  GET /api/leaderboard/rank/:userId
// @access Public
export const getUserRank = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select('username points level');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Count users with more points than this user
    const higherRankCount = await User.countDocuments({ points: { $gt: user.points } });
    const rank = higherRankCount + 1;
    res.json({
      rank,
      username: user.username,
      points: user.points,
      level: user.level,
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).send('Server Error');
  }
}; 