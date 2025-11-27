import { Router } from 'express';
import { GET, POST } from './route';
import { GET as getPet, PUT as updatePet, DELETE as deletePet } from './[id]/route';
import { GET as getPetAppointments } from './[id]/appointments/route';

const router = Router();

router.get('/', GET);
router.post('/', POST);

router.get('/:id', getPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

router.get('/:id/appointments', getPetAppointments);

export default router;