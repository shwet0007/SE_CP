import { Router } from 'express';
import { summary } from '../controllers/reportController.js';
import { authGuard, roleGuard } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/summary', authGuard, roleGuard('admin'), asyncHandler(summary));

export default router;
