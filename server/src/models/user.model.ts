import mongoose, { Schema, Document } from 'mongoose';

// Interface to define the structure of a User document (for TypeScript)
export interface IUser extends Document {
  username: string;
  password?: string; // Password is required for creation but not always sent back
  points: number;
  level: number;
  badges: string[];
}

// Mongoose Schema to define the structure in MongoDB
const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true, // No two users can have the same username
    trim: true, // Removes whitespace from both ends
  },
  password: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  badges: {
    type: [String],
    default: [],
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create and export the Mongoose model
const User = mongoose.model<IUser>('User', UserSchema);

export default User; 