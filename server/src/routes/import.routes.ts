import { Router } from 'express';
import { importFromUrl, importFromYoutube, importFromSocial, importFromImage } from '../controllers/import.controller';

const router = Router();

router.post('/url', importFromUrl);
router.post('/youtube', importFromYoutube);
router.post('/social', importFromSocial);
router.post('/image', importFromImage);

export default router;
