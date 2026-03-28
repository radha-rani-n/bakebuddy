import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import panRoutes from './routes/pan.routes';
import recipeRoutes from './routes/recipe.routes';
import importRoutes from './routes/import.routes';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
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

// Error handler
app.use(errorHandler);

export default app;
