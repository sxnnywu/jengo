import express from 'express';
import {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  getMyOpportunities,
  updateOpportunity,
  deleteOpportunity
} from '../controllers/opportunity.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getOpportunities);
router.get('/my', protect, getMyOpportunities);
router.get('/:id', getOpportunity);
router.post('/', protect, createOpportunity);
router.put('/:id', protect, updateOpportunity);
router.delete('/:id', protect, deleteOpportunity);

export default router;
