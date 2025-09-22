// Author: Aazaf Ritha
import Quiz from "../models/Quiz.js";

// List quizzes with filters: ?status=&category=&difficulty=&q=
export async function listQuizzes(req, res) {
  try {
    const { status, category, difficulty, q } = req.query || {};
    const cond = {};
    
    if (status) cond.status = status;
    if (category) cond.category = category;
    if (difficulty) cond.difficulty = difficulty;
    if (q) cond.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $elemMatch: { $regex: q, $options: "i" } } },
    ];

    const quizzes = await Quiz.find(cond)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(quizzes);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list quizzes" });
  }
}

// Get single quiz by ID
export async function getQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean();
    
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    
    res.json(quiz);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load quiz" });
  }
}

// Create new quiz
export async function createQuiz(req, res) {
  try {
    console.log('Creating quiz with request body:', JSON.stringify(req.body, null, 2));
    
    const {
      title,
      description = "",
      category = "general",
      difficulty = "medium",
      questions = [],
      timeLimit = 0,
      passingScore = 70,
      maxAttempts = 0,
      tags = [],
      instructions = "",
      bannerImage = "",
      badgeTitle = "",
      badgeDescription = "",
      badgeImage = ""
    } = req.body || {};

    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!Array.isArray(questions)) return res.status(400).json({ error: "Questions must be an array" });

    console.log(`Validating ${questions.length} questions...`);
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log(`Question ${i + 1}:`, q);
      
      if (!q.question || !q.type) {
        return res.status(400).json({ 
          error: `Question ${i + 1} is missing required fields (question: ${!!q.question}, type: ${!!q.type})` 
        });
      }
      
      // For text/short questions, correctAnswer can be empty (manual grading)
      if (q.type !== "text" && !q.correctAnswer && q.correctAnswer !== "") {
        return res.status(400).json({ 
          error: `Question ${i + 1} is missing correctAnswer field (type: ${q.type}, correctAnswer: ${q.correctAnswer})` 
        });
      }
      
      if (q.type === "multiple-choice" && (!q.options || q.options.length < 2)) {
        return res.status(400).json({ 
          error: `Question ${i + 1}: Multiple choice questions need at least 2 options (has ${q.options?.length || 0})` 
        });
      }
    }

    console.log('Creating quiz document...');
    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      questions,
      timeLimit,
      passingScore,
      maxAttempts,
      tags,
      instructions,
      bannerImage,
      badgeTitle,
      badgeDescription,
      badgeImage,
      status: "draft",
      publishedAt: null,
      createdBy: req.user?.id || null // Auth middleware may not be active yet
    });

    console.log('Quiz created successfully with ID:', quiz._id);

    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate('createdBy', 'name email')
      .lean();

    console.log('Returning populated quiz:', populatedQuiz?._id);
    res.status(201).json(populatedQuiz);
  } catch (e) {
    console.error('Create quiz error:', e);
    console.error('Error stack:', e.stack);
    
    // Return more specific error information
    if (e.name === 'ValidationError') {
      const validationErrors = Object.values(e.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationErrors,
        message: e.message 
      });
    }
    
    if (e.name === 'MongoError' || e.name === 'MongoServerError') {
      return res.status(500).json({ 
        error: "Database error", 
        message: e.message 
      });
    }
    
    res.status(500).json({ 
      error: "Create quiz failed",
      message: e.message,
      type: e.name
    });
  }
}

// Update quiz
export async function updateQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const fields = [
      "title", "description", "category", "difficulty", "questions",
      "timeLimit", "passingScore", "maxAttempts", "tags", "instructions", "bannerImage",
      "badgeTitle", "badgeDescription", "badgeImage"
    ];

    for (const field of fields) {
      if (field in req.body) {
        quiz[field] = req.body[field];
      }
    }

    // Validate questions if provided
    if (req.body.questions) {
      for (let i = 0; i < req.body.questions.length; i++) {
        const q = req.body.questions[i];
        if (!q.question || !q.type || !q.correctAnswer) {
          return res.status(400).json({ 
            error: `Question ${i + 1} is missing required fields (question, type, correctAnswer)` 
          });
        }
        
        if (q.type === "multiple-choice" && (!q.options || q.options.length < 2)) {
          return res.status(400).json({ 
            error: `Question ${i + 1}: Multiple choice questions need at least 2 options` 
          });
        }
      }
    }

    await quiz.save();
    
    const updatedQuiz = await Quiz.findById(quiz._id)
      .populate('createdBy', 'name email')
      .lean();

    res.json(updatedQuiz);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Update quiz failed" });
  }
}

// Delete quiz
export async function deleteQuiz(req, res) {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Delete quiz failed" });
  }
}

// Publish quiz
export async function publishQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    
    if (quiz.questions.length === 0) {
      return res.status(400).json({ error: "Cannot publish quiz with no questions" });
    }

    quiz.status = "published";
    quiz.publishedAt = new Date();
    await quiz.save();

    const publishedQuiz = await Quiz.findById(quiz._id)
      .populate('createdBy', 'name email')
      .lean();

    res.json(publishedQuiz);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Publish quiz failed" });
  }
}

// Unpublish quiz
export async function unpublishQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    
    quiz.status = "draft";
    quiz.publishedAt = null;
    await quiz.save();

    const unpublishedQuiz = await Quiz.findById(quiz._id)
      .populate('createdBy', 'name email')
      .lean();

    res.json(unpublishedQuiz);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unpublish quiz failed" });
  }
}

// Archive quiz
export async function archiveQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    
    quiz.status = "archived";
    await quiz.save();

    const archivedQuiz = await Quiz.findById(quiz._id)
      .populate('createdBy', 'name email')
      .lean();

    res.json(archivedQuiz);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Archive quiz failed" });
  }
}

// Get quiz statistics
export async function getQuizStats(req, res) {
  try {
    const quizId = req.params.id;
    
    // This would typically involve a QuizAttempt model
    // For now, return basic stats
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const stats = {
      totalQuestions: quiz.questions.length,
      totalPoints: quiz.questions.reduce((total, q) => total + (q.points || 1), 0),
      averageTime: quiz.timeLimit,
      difficulty: quiz.difficulty,
      category: quiz.category,
      // These would come from QuizAttempt model:
      totalAttempts: 0,
      averageScore: 0,
      passRate: 0,
      completionRate: 0
    };

    res.json(stats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get quiz stats" });
  }
}

// Duplicate quiz
export async function duplicateQuiz(req, res) {
  try {
    const originalQuiz = await Quiz.findById(req.params.id);
    if (!originalQuiz) return res.status(404).json({ error: "Quiz not found" });

    const duplicatedQuiz = await Quiz.create({
      ...originalQuiz.toObject(),
      _id: undefined,
      title: `${originalQuiz.title} (Copy)`,
      status: "draft",
      publishedAt: null,
      createdAt: undefined,
      updatedAt: undefined
    });

    const newQuiz = await Quiz.findById(duplicatedQuiz._id)
      .populate('createdBy', 'name email')
      .lean();

    res.status(201).json(newQuiz);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Duplicate quiz failed" });
  }
}
