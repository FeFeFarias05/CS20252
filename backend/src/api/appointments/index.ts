import express from 'express';
import { GET as listAppointments, POST as createAppointment } from './route';
import { GET as getAppointment, PUT as updateAppointment, DELETE as deleteAppointment } from './[id]/route';
import { POST as confirmAppointment } from './[id]/confirm/route';
import { POST as cancelAppointment } from './[id]/cancel/route';

const router = express.Router();

router.get('/', listAppointments);
router.post('/', createAppointment);

router.get('/:id', getAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

router.post('/:id/confirm', confirmAppointment);
router.post('/:id/cancel', cancelAppointment);

export default router;
