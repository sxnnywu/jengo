import express from 'express';
import {
  applyToOpportunity,
  getMyApplications,
  getOpportunityApplications,
  acceptApplication,
  rejectApplication
} from '../controllers/application.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, applyToOpportunity);
router.get('/my', protect, getMyApplications);
router.get('/opportunity/:id', protect, getOpportunityApplications);
router.put('/:id/accept', protect, acceptApplication);
router.put('/:id/reject', protect, rejectApplication);

export default router;
