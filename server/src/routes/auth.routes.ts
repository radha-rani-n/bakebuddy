import { Router } from 'express';
import { signUp, signIn, signOut, getMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);
router.get('/me', authMiddleware, getMe);

export default router;
