// Author: Aazaf Ritha
import Policy from "../models/Policy.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/policies');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// List all policies with optional filtering
export async function listPolicies(req, res) {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    const policies = await Policy.find(filter)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(policies);
  } catch (error) {
    console.error('Error listing policies:', error);
    res.status(500).json({ error: 'Failed to load policies' });
  }
}

// Get single policy by ID
export async function getPolicy(req, res) {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .lean();

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(policy);
  } catch (error) {
    console.error('Error getting policy:', error);
    res.status(500).json({ error: 'Failed to load policy' });
  }
}

// Create new policy with file upload
export async function createPolicy(req, res) {
  try {
    const { title, description, version, category, isRequired } = req.body;
    
    if (!title || !version || !category) {
      return res.status(400).json({ 
        error: 'Title, version, and category are required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'Policy file is required' 
      });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Only PDF, DOC, and DOCX files are allowed' 
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File size must be less than 10MB' 
      });
    }

    const policy = await Policy.create({
      title,
      description: description || '',
      version,
      category,
      isRequired: isRequired === 'true',
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      createdBy: req.user?.id, // Assuming auth middleware sets req.user
      lastModifiedBy: req.user?.id
    });

    const populatedPolicy = await Policy.findById(policy._id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .lean();

    res.status(201).json(populatedPolicy);
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ error: 'Failed to create policy' });
  }
}

// Update policy
export async function updatePolicy(req, res) {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    const { title, description, version, category, isRequired } = req.body;
    
    // Update basic fields
    if (title) policy.title = title;
    if (description !== undefined) policy.description = description;
    if (version) policy.version = version;
    if (category) policy.category = category;
    if (isRequired !== undefined) policy.isRequired = isRequired === 'true';
    
    policy.lastModifiedBy = req.user?.id;

    // Handle file update if new file is provided
    if (req.file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          error: 'Only PDF, DOC, and DOCX files are allowed' 
        });
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ 
          error: 'File size must be less than 10MB' 
        });
      }

      // Delete old file
      if (fs.existsSync(policy.filePath)) {
        fs.unlinkSync(policy.filePath);
      }

      // Update file information
      policy.fileName = req.file.filename;
      policy.originalFileName = req.file.originalname;
      policy.filePath = req.file.path;
      policy.fileSize = req.file.size;
      policy.mimeType = req.file.mimetype;
    }

    await policy.save();

    const updatedPolicy = await Policy.findById(policy._id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .lean();

    res.json(updatedPolicy);
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
}

// Delete policy
export async function deletePolicy(req, res) {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(policy.filePath)) {
      fs.unlinkSync(policy.filePath);
    }

    await Policy.findByIdAndDelete(req.params.id);
    res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ error: 'Failed to delete policy' });
  }
}

// Download policy file
export async function downloadPolicy(req, res) {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    // Check if file exists
    if (!fs.existsSync(policy.filePath)) {
      return res.status(404).json({ error: 'Policy file not found' });
    }

    // Increment download count
    policy.downloadCount += 1;
    await policy.save();

    // Set appropriate headers
    res.setHeader('Content-Type', policy.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${policy.originalFileName}"`);
    res.setHeader('Content-Length', policy.fileSize);

    // Stream the file
    const fileStream = fs.createReadStream(policy.filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({ error: 'Failed to download file' });
    });
  } catch (error) {
    console.error('Error downloading policy:', error);
    res.status(500).json({ error: 'Failed to download policy' });
  }
}

// Get policy statistics
export async function getPolicyStats(req, res) {
  try {
    const stats = await Policy.aggregate([
      {
        $group: {
          _id: null,
          totalPolicies: { $sum: 1 },
          totalDownloads: { $sum: '$downloadCount' },
          avgFileSize: { $avg: '$fileSize' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    const categoryStats = await Policy.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ]);

    const recentPolicies = await Policy.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt downloadCount')
      .lean();

    res.json({
      overview: stats[0] || {
        totalPolicies: 0,
        totalDownloads: 0,
        avgFileSize: 0,
        categories: []
      },
      categoryStats,
      recentPolicies
    });
  } catch (error) {
    console.error('Error getting policy stats:', error);
    res.status(500).json({ error: 'Failed to get policy statistics' });
  }
}

// Archive policy
export async function archivePolicy(req, res) {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    policy.status = 'archived';
    policy.lastModifiedBy = req.user?.id;
    await policy.save();

    res.json({ message: 'Policy archived successfully' });
  } catch (error) {
    console.error('Error archiving policy:', error);
    res.status(500).json({ error: 'Failed to archive policy' });
  }
}

// Restore archived policy
export async function restorePolicy(req, res) {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    policy.status = 'active';
    policy.lastModifiedBy = req.user?.id;
    await policy.save();

    res.json({ message: 'Policy restored successfully' });
  } catch (error) {
    console.error('Error restoring policy:', error);
    res.status(500).json({ error: 'Failed to restore policy' });
  }
}
