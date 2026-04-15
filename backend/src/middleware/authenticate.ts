import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    name: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    console.log('No token found in cookies');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; name: string };
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Invalid token:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};
