import express from 'express';
import { GET as listOwners, POST as createOwner } from './route';
import { GET as getOwner, PUT as updateOwner, DELETE as deleteOwner } from './[id]/route';
import { GET as getOwnerPets } from './[id]/pets/route';
import { GET as getOwnerAppointments } from './[id]/appointments/route';

const router = express.Router();

// GET /api/v1/owners - List all owners (admin only)
// POST /api/v1/owners - Create owner (admin only)
router.get('/', listOwners);
router.post('/', createOwner);

// GET /api/v1/owners/:id - Get owner by ID
// PUT /api/v1/owners/:id - Update owner (admin only)
// DELETE /api/v1/owners/:id - Delete owner (admin only)
router.get('/:id', getOwner);
router.put('/:id', updateOwner);
router.delete('/:id', deleteOwner);

// GET /api/v1/owners/:id/pets - Get all pets of owner
// GET /api/v1/owners/:id/appointments - Get all appointments of owner
router.get('/:id/pets', getOwnerPets);
router.get('/:id/appointments', getOwnerAppointments);

export default router;
