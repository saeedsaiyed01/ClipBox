import { NextFunction, Request, Response } from 'express';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const checkCredits = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if credits need to be reset (monthly reset)
    const now = new Date();
    if (now >= user.creditsResetDate) {
      // Reset credits based on plan
      switch (user.plan) {
        case 'free':
          user.credits = 3;
          break;
        case 'pro':
          user.credits = 100; // Unlimited monthly for pro
          break;
        case 'premium':
          user.credits = 500; // Unlimited monthly for premium
          break;
        default:
          user.credits = 3;
      }

      // Set next reset date to first day of next month
      user.creditsResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await user.save();
    }
  
    // Check if user has credits
    if (user.credits <= 0) {
      return res.status(429).json({
        error: 'No credits remaining',
        message: 'You have used all your credits for this month. Upgrade your plan for more credits.',
        plan: user.plan,
        creditsResetDate: user.creditsResetDate
      });
    }

    // Deduct credit for video processing
    user.credits -= 1;
    await user.save();

    // Add credits info to request for response
    req.user.credits = user.credits;
    req.user.plan = user.plan;

    next();
  } catch (error) {
    console.error('Credits check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCreditsInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next();
    }

    const user = await User.findById(req.user.id);
    if (user) {
      req.user.credits = user.credits;
      req.user.plan = user.plan;
      req.user.creditsResetDate = user.creditsResetDate;
    }

    next();
  } catch (error) {
    console.error('Credits info error:', error);
    next();
  }
};
