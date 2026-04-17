import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { errorHandler } from './middleware/errorHandler.middleware';
import { authenticate } from './middleware/auth.middleware';
import { tenantContextMiddleware } from './middleware/tenantContext.middleware';

import authRoutes from './routes/auth.routes';
import tenantRoutes from './routes/tenant.routes';
import studentRoutes from './routes/student.routes';
import staffRoutes from './routes/staff.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS Configuration ──────────────────────────────────────────────────────
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

// ─── GLOBAL MIDDLEWARE (runs on EVERY request) ────────────────────────────────
app.use(helmet());
app.use(cors({ 
  origin: CORS_ORIGINS, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── HEALTH CHECK (no auth) ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ─── PUBLIC ROUTES (no auth required) ─────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);

// ─── AUTHENTICATED ROUTES ─────────────────────────────────────────────────────
// Apply auth + tenant context to ALL routes below this point.
// Individual routes only need RBAC middleware (applied per-route).
app.use('/api/v1',
  authenticate,              // [1] Verify JWT, populate req.jwtPayload
  tenantContextMiddleware,   // [2] Validate schoolId, populate req.tenantId
);

app.use('/api/v1/tenant', tenantRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/staff', staffRoutes);

// ─── ERROR HANDLER (MUST be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ─── DATABASE CONNECTION ──────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-os';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT as number, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📋 CORS origins: ${CORS_ORIGINS.join(', ')}`);
      });
    }
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  });

export default app;
