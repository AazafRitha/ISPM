import express from 'express';
import {
  startQuizAttempt,
  submitQuizAnswers,
  getUserQuizAttempts,
  getQuizAttempt,
  getQuizStatistics
} from '../controllers/quizAttemptController.js';

const router = express.Router();

// Quiz attempt routes
router.post('/quiz/:quizId/start', startQuizAttempt);
router.post('/:attemptId/submit', submitQuizAnswers);
router.get('/user', getUserQuizAttempts);
router.get('/:attemptId', getQuizAttempt);

// Statistics (admin only)
router.get('/quiz/:quizId/stats', getQuizStatistics);

export default router;
