import express from 'express';
import upload, { handleUploadError } from '../middleware/upload.js';
import {
  listPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
  downloadPolicy,
  getPolicyStats,
  archivePolicy,
  restorePolicy
} from '../controllers/policyController.js';

const router = express.Router();

// Policy CRUD routes
router.get('/', listPolicies);
router.get('/stats', getPolicyStats);
router.get('/:id', getPolicy);
router.post('/', upload.single('file'), handleUploadError, createPolicy);
router.put('/:id', upload.single('file'), handleUploadError, updatePolicy);
router.delete('/:id', deletePolicy);

// Policy utility routes
router.get('/:id/download', downloadPolicy);
router.post('/:id/archive', archivePolicy);
router.post('/:id/restore', restorePolicy);

export default router;
