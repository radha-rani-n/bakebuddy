import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented in Phase 5 & 6
router.post('/url', (_req, res) => {
  res.status(501).json({ error: 'URL import not yet implemented' });
});

router.post('/youtube', (_req, res) => {
  res.status(501).json({ error: 'YouTube import not yet implemented' });
});

router.post('/social', (_req, res) => {
  res.status(501).json({ error: 'Social import not yet implemented' });
});

router.post('/image', (_req, res) => {
  res.status(501).json({ error: 'Image import not yet implemented' });
});

export default router;
