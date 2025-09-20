import express from 'express';
import {
  listContents,
  getContent,
  createContent,
  updateContent,
  publishContent,
  unpublishContent,
  deleteContent,
  uploadImage,
  uploadPdf
} from '../controllers/contentController.js';

const router = express.Router();

// Content CRUD routes
router.get('/', listContents);
router.get('/:id', getContent);
router.post('/', createContent);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

// Content status routes
router.post('/:id/publish', publishContent);
router.post('/:id/unpublish', unpublishContent);

// File upload routes
router.post('/upload/image', uploadImage);
router.post('/upload/pdf', uploadPdf);

export default router;
