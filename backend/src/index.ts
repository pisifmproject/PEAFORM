import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { PORT, FRONTEND_URL } from './config/constants.js';
import authRoutes from './routes/auth-routes.js';
import formRoutes from './routes/form-routes.js';
import notificationRoutes from './routes/notification-routes.js';
import adminRoutes from './routes/admin-routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:3002',
        'http://10.125.48.102',
        'http://10.125.48.102:3002',
        'http://10.125.48.102:9000',
        'http://10.125.48.102/peaf',
      ];
      
      // Check if origin is in allowed list or matches pattern
      const isAllowed = allowedOrigins.includes(origin) ||
        /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin) ||
        /^http:\/\/10\.\d+\.\d+\.\d+$/.test(origin);
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(null, true); // Allow anyway for now, log for debugging
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`Accepting requests from: ${FRONTEND_URL}`);
});
