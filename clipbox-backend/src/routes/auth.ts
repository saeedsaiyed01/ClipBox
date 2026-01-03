import axios from 'axios';
import express from 'express';
import jwt from "jsonwebtoken";
import User from '../models/User';

const router = express.Router();

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', (req, res) => {
  const stringifiedParams = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    scope: ['openid', 'email', 'profile'].join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  }).toString();

  const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
  res.redirect(googleLoginUrl);
});

// @desc    Google OAuth Callback
// @route   GET /auth/google/callback
router.get('/google/callback', async (req, res) => {
  const code = req.query.code as string;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    });

    const { access_token, id_token } = tokenResponse.data;

    // Fetch user profile with access token
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { sub, email, name, picture } = userResponse.data;

    let user = await User.findOne({ googleId: sub });

    if (user) {
      // Update user info if necessary
      user.email = email;
      user.name = name;
      user.avatar = picture;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        googleId: sub,
        email,
        name,
        avatar: picture,
      });
    }

    const token = generateToken(user._id.toString());

    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  } catch (error: any) {
    console.error('Google OAuth Error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/auth-error`);
  }
});

// @desc    Create/Update user from NextAuth
// @route   POST /auth/google/callback
router.post('/google/callback', async (req, res) => {
  const { profile } = req.body;
  const { sub, email, name, picture } = profile;

  try {
    let user = await User.findOne({ googleId: sub });

    if (user) {
      // Update user info if necessary
      user.email = email;
      user.name = name;
      user.avatar = picture;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        googleId: sub,
        email,
        name,
        avatar: picture,
      });
    }

    const token = generateToken(user._id.toString());

    res.json({ token });
  } catch (error: any) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;