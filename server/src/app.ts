import express from 'express';
import path from 'path';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import panRoutes from './routes/pan.routes';
import recipeRoutes from './routes/recipe.routes';
import importRoutes from './routes/import.routes';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/pans', authMiddleware, panRoutes);
app.use('/api/recipes', authMiddleware, recipeRoutes);
app.use('/api/import', authMiddleware, importRoutes);

// Serve client build in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

export default app;
