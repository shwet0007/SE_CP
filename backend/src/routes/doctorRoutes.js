import { Router } from 'express';
import { listDoctors } from '../controllers/doctorController.js';
import { authGuard } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authGuard, asyncHandler(listDoctors));

export default router;
