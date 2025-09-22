// Author: Aazaf Ritha
import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answer: { type: String, required: true }, // User's answer
  isCorrect: { type: Boolean, required: true },
  points: { type: Number, default: 0 }, // Points earned for this answer
  timeSpent: { type: Number, default: 0 }, // Time spent on this question in seconds
}, { _id: false });

const QuizAttemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [AnswerSchema],
  score: { type: Number, default: 0 }, // Total score achieved
  percentage: { type: Number, default: 0 }, // Percentage score
  passed: { type: Boolean, default: false }, // Whether user passed the quiz
  timeSpent: { type: Number, default: 0 }, // Total time spent in seconds
  completedAt: { type: Date, default: null }, // When quiz was completed
  status: { 
    type: String, 
    enum: ["in-progress", "completed", "abandoned"], 
    default: "in-progress" 
  },
  attemptNumber: { type: Number, default: 1 }, // Which attempt this is for the user
  ipAddress: { type: String, default: "" }, // For security/audit purposes
  userAgent: { type: String, default: "" }, // Browser info
}, { timestamps: true });

// Index for efficient queries
QuizAttemptSchema.index({ quiz: 1, user: 1 });
QuizAttemptSchema.index({ user: 1, createdAt: -1 });
QuizAttemptSchema.index({ quiz: 1, status: 1 });

// Virtual for duration
QuizAttemptSchema.virtual('duration').get(function() {
  if (this.completedAt && this.createdAt) {
    return Math.floor((this.completedAt - this.createdAt) / 1000); // Duration in seconds
  }
  return this.timeSpent;
});

// Ensure virtual fields are serialized
QuizAttemptSchema.set('toJSON', { virtuals: true });

export default mongoose.model("QuizAttempt", QuizAttemptSchema);
