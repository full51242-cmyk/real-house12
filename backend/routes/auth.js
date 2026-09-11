const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { protect } = require('../middleware/auth');
const adminSupabase = require('../config/supabase');

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';

function buildUserResponse(user, profile = {}) {
  return {
    id: user.id,
    name: profile.name || user.user_metadata?.name || 'User',
    email: user.email,
    phone: profile.phone || user.user_metadata?.phone || '',
    avatar: profile.avatar || user.user_metadata?.avatar || DEFAULT_AVATAR,
  };
}

async function getProfile(userId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('name, phone, avatar')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Profile fetch error:', error);
    return null;
  }

  return profile;
}

// @route   POST /api/auth/register
// @desc    Register a new user using Supabase Auth
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        }
      }
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return res.status(400).json({ message: 'Registration failed. Check the supplied details.' });
    }

    const user = data.user;

    if (!user) {
      return res.status(400).json({ message: 'Registration failed. Please try again.' });
    }

    if (data.session) {
      const profile = await getProfile(user.id);

      return res.status(201).json({
        success: true,
        token: data.session.access_token,
        user: {
          id: user.id,
          name: profile?.name || user.user_metadata?.name || name,
          email: user.email,
          phone: profile?.phone || user.user_metadata?.phone || phone || '',
          avatar: profile?.avatar || user.user_metadata?.avatar || DEFAULT_AVATAR
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Registration successful. Please check your email to confirm your account before signing in.',
      user: {
        id: user.id,
        name: user.user_metadata?.name || name,
        email: user.email,
        phone: user.user_metadata?.phone || phone || '',
        avatar: user.user_metadata?.avatar || DEFAULT_AVATAR
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user using Supabase Auth
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Return user data and session
    res.status(200).json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: profile?.name || data.user.user_metadata?.name || 'User',
        email: data.user.email,
        phone: profile?.phone || data.user.user_metadata?.phone,
        avatar: profile?.avatar || data.user.user_metadata?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   DELETE /api/auth/me
// @desc    Permanently delete the authenticated user's account
// @access  Private
router.delete('/me', protect, async (req, res) => {
  try {
    const { error } = await adminSupabase.auth.admin.deleteUser(req.user.id);

    if (error) {
      console.error('Delete account error:', error);
      return res.status(400).json({ message: 'Unable to delete account' });
    }

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const profile = await req.supabase
      .from('profiles')
      .select('name, phone, avatar')
      .eq('id', req.user.id)
      .single();

    if (profile.error) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      user: buildUserResponse(req.user, profile.data),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
