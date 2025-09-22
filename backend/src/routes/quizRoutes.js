import express from 'express';
import {
  listQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  unpublishQuiz,
  archiveQuiz,
  getQuizStats,
  duplicateQuiz
} from '../controllers/quizController.js';

const router = express.Router();

// Quiz CRUD routes
router.get('/', listQuizzes);
router.get('/:id', getQuiz);
router.post('/', createQuiz);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);

// Quiz status management routes
router.post('/:id/publish', publishQuiz);
router.post('/:id/unpublish', unpublishQuiz);
router.post('/:id/archive', archiveQuiz);

// Quiz utility routes
router.get('/:id/stats', getQuizStats);
router.post('/:id/duplicate', duplicateQuiz);

export default router;
