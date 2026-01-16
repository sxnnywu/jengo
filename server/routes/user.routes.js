import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:id', protect, getUserProfile);
router.put('/:id', protect, updateUserProfile);

export default router;
