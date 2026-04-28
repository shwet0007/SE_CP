import { Router } from 'express';
import {
  bookAppointment,
  deleteAppointment,
  listAppointments,
  updateAppointment
} from '../controllers/appointmentController.js';
import { authGuard } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authGuard, asyncHandler(listAppointments));
router.post('/', authGuard, asyncHandler(bookAppointment));
router.patch('/:id', authGuard, asyncHandler(updateAppointment));
router.delete('/:id', authGuard, asyncHandler(deleteAppointment));

export default router;
