import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import leaderboardRoutes from './routes/leaderboard.routes';

// Explicitly load environment variables from the parent directory (the 'server' folder)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('Database connection failed:', error);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();

// --- Middlewares ---
// Enable CORS for all routes
app.use(cors()); 

// Body parser middleware to handle JSON data
app.use(express.json());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 