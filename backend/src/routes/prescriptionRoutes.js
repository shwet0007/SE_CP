import { Router } from 'express';
import { createPrescription, listPrescriptions } from '../controllers/prescriptionController.js';
import { authGuard } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authGuard, asyncHandler(listPrescriptions));
router.post('/', authGuard, asyncHandler(createPrescription));

export default router;
