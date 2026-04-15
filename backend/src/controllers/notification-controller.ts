import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate.js';
import * as notificationService from '../services/notification-service.js';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user!.id);
    res.json(notifications);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markNotificationAsRead(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAllNotificationsAsRead(req.user!.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: error.message });
  }
};
