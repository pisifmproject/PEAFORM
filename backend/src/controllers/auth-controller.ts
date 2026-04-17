import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authenticate.js';
import * as userService from '../services/user-service.js';
import { JWT_SECRET } from '../config/constants.js';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { nik, username, email, name, password } = req.body;

    // Check if user already exists in users table
    const existing_user = await userService.findUserByIdentifier(nik);
    if (existing_user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check if registration already pending
    const existing_pending = await userService.findPendingRegistrationByIdentifier(nik);
    if (existing_pending) {
      return res.status(400).json({ error: 'Registration already pending approval' });
    }

    // Create pending registration instead of direct user creation
    await userService.createPendingRegistration({ nik, username, email, name, password });

    // Notify all admins
    await userService.notifyAdminsOfNewRegistration(name);

    res.json({ 
      success: true, 
      message: 'Registration submitted successfully. Please wait for admin approval.' 
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { identifier, password } = req.body;
    console.log('Login attempt for:', identifier);

    const user = await userService.findUserByIdentifier(identifier);

    if (!user) {
      console.log('User not found:', identifier);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('User found, comparing password...');
    const valid_password = await userService.verifyPassword(password, user.password);
    if (!valid_password) {
      console.log('Invalid password for:', identifier);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('Password valid, generating token...');
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to false for HTTP connections
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    const { password: _, ...user_without_password } = user;
    console.log('Login successful for:', identifier);
    res.json({ user: user_without_password });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Fetching /api/auth/me for user:', req.user?.id);
    const user = await userService.findUserById(req.user!.id);
    if (!user) {
      console.log('User not found in DB for /api/auth/me:', req.user?.id);
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...user_without_password } = user;
    res.json({ user: user_without_password });
  } catch (error: any) {
    console.error('Error in /api/auth/me:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { nik, username, email, name, password } = req.body;
    const userId = req.user!.id;
    
    // Check if new NIK/username/email conflict with existing users (excluding self)
    if (nik || username || email) {
      const existing_users = await userService.getAllUsers();
      for (const u of existing_users) {
        if (u.id === userId) continue;
        if (nik && u.nik === nik) return res.status(400).json({ error: 'NIK already taken' });
        if (username && u.username === username) return res.status(400).json({ error: 'Username already taken' });
        if (email && u.email === email) return res.status(400).json({ error: 'Email already taken' });
      }
    }

    const updatedUser = await userService.updateProfile(userId, { nik, username, email, name, password });
    const { password: _, ...user_without_password } = updatedUser;
    
    res.json({ success: true, user: user_without_password });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
};
