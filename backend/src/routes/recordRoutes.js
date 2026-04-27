import { Router } from 'express';
import { createRecord, listRecords, updateRecord } from '../controllers/recordController.js';
import { authGuard } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authGuard, asyncHandler(listRecords));
router.post('/', authGuard, asyncHandler(createRecord));
router.patch('/:id', authGuard, asyncHandler(updateRecord));

export default router;
