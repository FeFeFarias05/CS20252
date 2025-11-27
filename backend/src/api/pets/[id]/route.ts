import { Router } from 'express';
import { GET, PUT, DELETE } from './routeUser';

const router = Router();

router.get('/:id', GET);
router.put('/:id', PUT);
router.delete('/:id', DELETE);

export default router;
