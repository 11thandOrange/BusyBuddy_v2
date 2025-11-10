import express from 'express';
const router = express.Router();
import {
  createAnnouncementBar,
  getAnnouncementBars,
  getAnnouncementBarById,
  updateAnnouncementBar,
  deleteAnnouncementBar,
  toggleAnnouncementBarStatus,
  getActiveAnnouncementBar,
  updateAnnouncementBarPriority,
  trackAnnouncementBarAnalytics,
  getAnnouncementBarAnalytics,
  bulkDeleteAnnouncementBars,
  updateAnnouncementBarCountdown
} from '../../controller/announcementBars/index.js';

router.post('/', createAnnouncementBar);

router.get('/', getAnnouncementBars);

router.get('/active', getActiveAnnouncementBar);

router.get('/analytics', getAnnouncementBarAnalytics);

router.get('/:id', getAnnouncementBarById);

router.put('/:id', updateAnnouncementBar);

router.patch('/:id/countdown', updateAnnouncementBarCountdown);

router.delete('/:id', deleteAnnouncementBar);

router.patch('/:id/toggle', toggleAnnouncementBarStatus);

router.post('/:id/track', trackAnnouncementBarAnalytics);

router.patch('/priorities', updateAnnouncementBarPriority);

router.delete('/bulk', bulkDeleteAnnouncementBars);

export default router; 