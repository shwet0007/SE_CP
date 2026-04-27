import { Router } from 'express';
import { listNotifications, markRead } from '../controllers/notificationController.js';
import { authGuard } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authGuard, asyncHandler(listNotifications));
router.patch('/:id/read', authGuard, asyncHandler(markRead));

export default router;
