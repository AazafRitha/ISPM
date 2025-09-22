// Author: Aazaf Ritha
import QuizAttempt from "../models/QuizAttempt.js";
import Quiz from "../models/Quiz.js";

// Start a new quiz attempt
export async function startQuizAttempt(req, res) {
  try {
    const { quizId } = req.params;
    const userId = req.user?.id; // Assuming auth middleware sets req.user

    if (!userId) return res.status(401).json({ error: "Authentication required" });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    if (quiz.status !== "published") {
      return res.status(400).json({ error: "Quiz is not available for attempts" });
    }

    // Check if user has reached max attempts
    if (quiz.maxAttempts > 0) {
      const existingAttempts = await QuizAttempt.countDocuments({ 
        quiz: quizId, 
        user: userId 
      });
      
      if (existingAttempts >= quiz.maxAttempts) {
        return res.status(400).json({ 
          error: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz` 
        });
      }
    }

    // Create new attempt
    const attempt = await QuizAttempt.create({
      quiz: quizId,
      user: userId,
      answers: [],
      attemptNumber: (await QuizAttempt.countDocuments({ quiz: quizId, user: userId })) + 1,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || ''
    });

    res.status(201).json(attempt);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to start quiz attempt" });
  }
}

// Submit quiz answers
export async function submitQuizAnswers(req, res) {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers array is required" });
    }

    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz');
    
    if (!attempt) return res.status(404).json({ error: "Quiz attempt not found" });

    if (attempt.status !== "in-progress") {
      return res.status(400).json({ error: "Quiz attempt is not in progress" });
    }

    // Validate and grade answers
    let totalScore = 0;
    let correctAnswers = 0;
    const gradedAnswers = [];

    for (const userAnswer of answers) {
      const question = attempt.quiz.questions.find(q => 
        q._id.toString() === userAnswer.questionId
      );
      
      if (!question) continue;

      let isCorrect = false;
      let points = 0;

      // Grade the answer based on question type
      if (question.type === "multiple-choice") {
        const correctIndex = parseInt(question.correctAnswer);
        const userIndex = parseInt(userAnswer.answer);
        isCorrect = correctIndex === userIndex;
      } else if (question.type === "true-false") {
        isCorrect = question.correctAnswer.toLowerCase() === userAnswer.answer.toLowerCase();
      } else if (question.type === "text") {
        // For text questions, you might want more sophisticated matching
        isCorrect = question.correctAnswer.toLowerCase().trim() === 
                   userAnswer.answer.toLowerCase().trim();
      }

      if (isCorrect) {
        points = question.points || 1;
        correctAnswers++;
      }

      totalScore += points;

      gradedAnswers.push({
        questionId: userAnswer.questionId,
        answer: userAnswer.answer,
        isCorrect,
        points,
        timeSpent: userAnswer.timeSpent || 0
      });
    }

    // Calculate percentage
    const totalPossiblePoints = attempt.quiz.questions.reduce((total, q) => 
      total + (q.points || 1), 0
    );
    const percentage = totalPossiblePoints > 0 ? 
      Math.round((totalScore / totalPossiblePoints) * 100) : 0;

    // Check if passed
    const passed = percentage >= attempt.quiz.passingScore;

    // Update attempt
    attempt.answers = gradedAnswers;
    attempt.score = totalScore;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.status = "completed";
    attempt.completedAt = new Date();
    attempt.timeSpent = answers.reduce((total, a) => total + (a.timeSpent || 0), 0);

    await attempt.save();

    res.json({
      attempt,
      results: {
        score: totalScore,
        percentage,
        passed,
        correctAnswers,
        totalQuestions: attempt.quiz.questions.length,
        passingScore: attempt.quiz.passingScore
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to submit quiz answers" });
  }
}

// Get user's quiz attempts
export async function getUserQuizAttempts(req, res) {
  try {
    const userId = req.user?.id;
    const { quizId } = req.query;

    if (!userId) return res.status(401).json({ error: "Authentication required" });

    const filter = { user: userId };
    if (quizId) filter.quiz = quizId;

    const attempts = await QuizAttempt.find(filter)
      .populate('quiz', 'title category difficulty')
      .sort({ createdAt: -1 })
      .lean();

    res.json(attempts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get quiz attempts" });
  }
}

// Get quiz attempt details
export async function getQuizAttempt(req, res) {
  try {
    const { attemptId } = req.params;
    const userId = req.user?.id;

    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz')
      .populate('user', 'name email')
      .lean();

    if (!attempt) return res.status(404).json({ error: "Quiz attempt not found" });

    // Check if user can view this attempt (own attempt or admin)
    if (attempt.user._id.toString() !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(attempt);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get quiz attempt" });
  }
}

// Get quiz statistics (admin only)
export async function getQuizStatistics(req, res) {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const stats = await QuizAttempt.aggregate([
      { $match: { quiz: quiz._id, status: "completed" } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: "$percentage" },
          averageTime: { $avg: "$timeSpent" },
          passRate: {
            $avg: { $cond: ["$passed", 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalAttempts: 0,
      averageScore: 0,
      averageTime: 0,
      passRate: 0
    };

    // Get recent attempts
    const recentAttempts = await QuizAttempt.find({ quiz: quizId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      quiz: {
        id: quiz._id,
        title: quiz.title,
        totalQuestions: quiz.questions.length,
        passingScore: quiz.passingScore
      },
      statistics: {
        ...result,
        passRate: Math.round(result.passRate * 100),
        averageScore: Math.round(result.averageScore)
      },
      recentAttempts
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get quiz statistics" });
  }
}
