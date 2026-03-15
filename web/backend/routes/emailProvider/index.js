import express from 'express';
const router = express.Router();
import {
  connectEmailProvider,
  getEmailProvider,
  disconnectEmailProvider,
  syncEmailProvider,
  getEmailLists,
  getEmailTemplates,
  setDefaultList,
} from '../../controller/emailProvider/index.js';

// Connect to an email provider
router.post('/connect', connectEmailProvider);

// Get current email provider settings
router.get('/', getEmailProvider);

// Disconnect email provider
router.delete('/', disconnectEmailProvider);

// Sync lists and templates from email provider
router.post('/sync', syncEmailProvider);

// Get available email lists
router.get('/lists', getEmailLists);

// Get available email templates
router.get('/templates', getEmailTemplates);

// Set default list
router.put('/default-list', setDefaultList);

export default router;
