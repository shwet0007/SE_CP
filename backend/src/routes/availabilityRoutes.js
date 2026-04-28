import { Router } from 'express';
import { createAvailability, deleteAvailability, listAvailability } from '../controllers/availabilityController.js';
import { authGuard } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authGuard, asyncHandler(listAvailability));
router.post('/', authGuard, asyncHandler(createAvailability));
router.delete('/:id', authGuard, asyncHandler(deleteAvailability));

export default router;
