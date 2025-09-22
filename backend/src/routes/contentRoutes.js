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
import { uploadImageMiddleware, uploadPdfMiddleware } from '../middleware/mediaUpload.js';

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

// File upload routes (multipart form-data with field name "file")
router.post('/upload/image', uploadImageMiddleware.single('file'), uploadImage);
router.post('/upload/pdf', uploadPdfMiddleware.single('file'), uploadPdf);

export default router;
