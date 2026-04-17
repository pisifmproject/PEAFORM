import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate.js';
import * as userService from '../services/user-service.js';

export const getUsers = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const all_users = await userService.getAllUsers();
    const users = all_users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(users);
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await userService.updateUserRole(req.params.id, req.body.role);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserPlant = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await userService.updateUserPlant(req.params.id, req.body.plant);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Update user plant error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.user.id === req.params.id) {
    return res.status(400).json({ error: 'You cannot delete yourself' });
  }

  try {
    await userService.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPendingRegistrations = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const pending = await userService.getAllPendingRegistrations();
    const sanitized = pending.map((p) => {
      const { password, ...rest } = p;
      return rest;
    });
    res.json(sanitized);
  } catch (error: any) {
    console.error('Get pending registrations error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const approvePendingRegistration = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await userService.approvePendingRegistration(req.params.id);
    res.json({ success: true, message: 'Registration approved successfully' });
  } catch (error: any) {
    console.error('Approve registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const rejectPendingRegistration = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await userService.rejectPendingRegistration(req.params.id);
    res.json({ success: true, message: 'Registration rejected successfully' });
  } catch (error: any) {
    console.error('Reject registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserDepartment = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    await userService.updateUserDepartment(req.params.id, req.body.department);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Update update user department error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const depts = await userService.getAllDepartments();
    res.json(depts);
  } catch (error: any) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const dept = await userService.createDepartment(req.body.name);
    res.json({ success: true, department: dept });
  } catch (error: any) {
    console.error('Create department error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    await userService.deleteDepartment(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: error.message });
  }
};
