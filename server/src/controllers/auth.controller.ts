import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user instance
    user = new User({
      username,
      password,
    });

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to the database
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // User is validated, create JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            points: user.points,
            level: user.level,
            badges: user.badges,
          },
        });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    // Verify the existing token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // Get fresh user data
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new token
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign new token
    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '5h' },
      (err, newToken) => {
        if (err) throw err;
        res.json({
          token: newToken,
          user: {
            id: user.id,
            username: user.username,
            points: user.points,
            level: user.level,
            badges: user.badges,
          },
        });
      }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 