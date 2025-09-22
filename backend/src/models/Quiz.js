// Author: Aazaf Ritha
import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ["multiple-choice", "true-false", "text"], required: true },
  options: { type: [String], default: [] }, // For multiple choice / true-false questions
  // For multiple-choice: store index as string (e.g., "0"); for true-false: store "True" or "False";
  // For text questions: allow empty string and do not require a value
  correctAnswer: { 
    type: String, 
    required: function () { return this.type !== 'text'; },
    default: ""
  },
  explanation: { type: String, default: "" }, // Explanation for the correct answer
  points: { type: Number, default: 1 }, // Points for this question
}, { timestamps: true });

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "general" }, // e.g., "cybersecurity", "phishing", "general"
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  questions: [QuestionSchema],
  timeLimit: { type: Number, default: 0 }, // Time limit in minutes (0 = no limit)
  passingScore: { type: Number, default: 70 }, // Passing percentage
  maxAttempts: { type: Number, default: 0 }, // Max attempts allowed (0 = unlimited)
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
  tags: { type: [String], default: [] },
  instructions: { type: String, default: "" }, // Instructions for taking the quiz
  bannerImage: { type: String, default: "" }, // Banner image URL
  // Badge fields for completion rewards
  badgeTitle: { type: String, default: "" },
  badgeDescription: { type: String, default: "" },
  badgeImage: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who created it
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

// Virtual for total points
QuizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Virtual for question count
QuizSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Ensure virtual fields are serialized
QuizSchema.set('toJSON', { virtuals: true });

export default mongoose.model("Quiz", QuizSchema);
