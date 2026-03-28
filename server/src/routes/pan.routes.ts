import { Router } from 'express';
import { listPans, createPan, updatePan, deletePan } from '../controllers/pan.controller';

const router = Router();

router.get('/', listPans);
router.post('/', createPan);
router.put('/:id', updatePan);
router.delete('/:id', deletePan);

export default router;
