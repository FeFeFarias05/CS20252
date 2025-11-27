import { Router } from 'express';
import { GET, POST } from './route';

const router = Router();

router.get('/', GET);
router.post('/', POST);

export default router;