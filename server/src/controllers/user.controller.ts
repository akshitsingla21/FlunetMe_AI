import { Request, Response } from 'express';
import User from '../models/user.model';

// @desc   Update user progress (points, level, badges)
// @route  POST /api/users/progress
// @access Private (requires authentication)
export const updateProgress = async (req: Request, res: Response) => {
  const { userId, points, level, badges } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if they are provided in the request body
    if (points !== undefined) {
      user.points = points;
    }
    if (level !== undefined) {
      user.level = level;
    }
    if (badges !== undefined) {
      user.badges = badges;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Progress updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        points: updatedUser.points,
        level: updatedUser.level,
        badges: updatedUser.badges,
      },
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).send('Server Error');
  }
}; 