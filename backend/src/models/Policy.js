// Author: Aazaf Ritha
import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    default: "",
    trim: true 
  },
  version: { 
    type: String, 
    required: true,
    trim: true 
  },
  category: { 
    type: String, 
    enum: ["security", "hr", "it", "compliance"], 
    required: true,
    default: "security"
  },
  isRequired: { 
    type: Boolean, 
    default: false 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  originalFileName: { 
    type: String, 
    required: true 
  },
  filePath: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  mimeType: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["active", "archived", "draft"], 
    default: "active" 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  lastModifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  tags: { 
    type: [String], 
    default: [] 
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
PolicySchema.index({ title: 1 });
PolicySchema.index({ category: 1 });
PolicySchema.index({ status: 1 });
PolicySchema.index({ createdAt: -1 });

// Virtual for file extension
PolicySchema.virtual('fileExtension').get(function() {
  return this.originalFileName.split('.').pop().toLowerCase();
});

// Virtual for formatted file size
PolicySchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Ensure virtual fields are serialized
PolicySchema.set('toJSON', { virtuals: true });

export default mongoose.model("Policy", PolicySchema);
