import { Router } from 'express';
import { signUp, signIn, signOut, refreshSession, getMe, updateMe, changePassword, deleteMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);
router.post('/refresh', refreshSession);
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);
router.patch('/password', authMiddleware, changePassword);
router.delete('/me', authMiddleware, deleteMe);

export default router;
