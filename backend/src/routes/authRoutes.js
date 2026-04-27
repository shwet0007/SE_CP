import { Router } from 'express';
import { login, me, register } from '../controllers/authController.js';
import { authGuard } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authGuard, asyncHandler(me));

export default router;
