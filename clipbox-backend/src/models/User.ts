import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'premium';
  credits: number;
  creditsResetDate: Date;
  videoGenerationsCount: number;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free',
  },
  credits: {
    type: Number,
    default: 3, // Free users get 3 credits per month
  },
  creditsResetDate: {
    type: Date,
    default: () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // Next month
  },
  videoGenerationsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;