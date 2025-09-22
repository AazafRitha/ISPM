import express from 'express';
import bcrypt from 'bcryptjs';
import Employee from '../models/Employee.js';
import EduContent from '../models/EduContent.js';
import Quiz from '../models/Quiz.js';
import Template from '../models/Template.js';
import SimulationEvent from '../models/SimulationEvent.js';
import User from '../models/User.js';
import avatarUpload from '../middleware/avatarUpload.js';

const router = express.Router();

// Get admin dashboard metrics
router.get('/metrics', async (req, res) => {
  try {
    // Get employee count
    const totalEmployees = await Employee.countDocuments();
    
    // Get recent employees (last 5, sorted by creation date)
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt')
      .lean();

    // Get active content count (published content)
    const activeContent = await EduContent.countDocuments({ status: 'published' });
    
    // Get recent content (last 5 published, sorted by publish date)
    const recentContent = await EduContent.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title publishedAt')
      .lean();

    // Get published quizzes count
    const publishedQuizzes = await Quiz.countDocuments({ status: 'published' });
    
  // Get phishing campaigns count (templates created)
  const templatesCount = await Template.countDocuments();
    
  // Get unique simulation names from events (active/running simulations)
  const uniqueSimulations = await SimulationEvent.distinct('simulationName');
  const activeSimulations = uniqueSimulations.length;

    // Calculate system health (simplified - could be more sophisticated)
    const systemHealth = 95; // Base health score

    // Format recent employees data
    const formattedRecentEmployees = recentEmployees.map(emp => ({
      name: emp.name,
      dept: emp.email.split('@')[1]?.split('.')[0] || 'Unknown',
      when: getTimeAgo(emp.createdAt)
    }));

    // Format recent content data
    const formattedRecentContent = recentContent.map(content => ({
      title: content.title,
      when: getTimeAgo(content.publishedAt || content.createdAt)
    }));

    const metrics = {
      totalEmployees,
      activeContent,
      publishedQuizzes,
      // Show campaigns based on created templates (what admins create)
      phishingCampaigns: templatesCount,
      // Also include active simulations for future UI if needed
      activeSimulations,
      systemHealth,
      recent: {
        employees: formattedRecentEmployees,
        content: formattedRecentContent
      }
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ 
      msg: 'Failed to fetch dashboard metrics', 
      error: error.message 
    });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}

// Get admin profile (assuming single admin for now)
router.get('/profile', async (req, res) => {
  try {
    // For simplicity, return the first admin; in real apps, use auth user id
    const admin = await User.findOne({ role: 'admin' }).lean();
    if (!admin) return res.status(404).json({ msg: 'Admin not found' });
    const { _id, name, email, nic, photoUrl, createdAt, updatedAt } = admin;
    res.json({ id: _id, name, email, nic, photoUrl, createdAt, updatedAt });
  } catch (err) {
    console.error('Error fetching admin profile:', err);
    res.status(500).json({ msg: 'Failed to fetch admin profile', error: err.message });
  }
});

// Update admin profile with optional avatar and password
router.put('/profile', avatarUpload.single('photo'), async (req, res) => {
  try {
    // In a real app, derive admin by auth; here pick first admin
    let admin = await User.findOne({ role: 'admin' });

    const { name, nic, email, password } = req.body;

    // If no admin exists yet, create one using provided fields
    if (!admin) {
      if (!email) return res.status(400).json({ msg: 'Email is required to initialize admin profile' });
      const toCreate = {
        role: 'admin',
        name: name || '',
        email,
        nic: nic || ''
      };
      if (password) {
        const salt = await bcrypt.genSalt(10);
        toCreate.passwordHash = await bcrypt.hash(password, salt);
      }
      if (req.file) {
        toCreate.photoUrl = `/uploads/avatars/${req.file.filename}`;
      }
      admin = await User.create(toCreate);
      const { _id, photoUrl, createdAt, updatedAt } = admin.toObject();
      return res.json({ id: _id, name: admin.name, email: admin.email, nic: admin.nic, photoUrl, createdAt, updatedAt });
    }

    // Update existing admin
    if (name !== undefined) admin.name = name;
    if (nic !== undefined) admin.nic = nic;
    if (email !== undefined) admin.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.passwordHash = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      const photoUrl = `/uploads/avatars/${req.file.filename}`;
      admin.photoUrl = photoUrl;
    }

    await admin.save();
    const { _id, photoUrl, createdAt, updatedAt } = admin.toObject();
    res.json({ id: _id, name: admin.name, email: admin.email, nic: admin.nic, photoUrl, createdAt, updatedAt });
  } catch (err) {
    console.error('Error updating admin profile:', err);
    // Handle duplicate email error nicely
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(400).json({ msg: 'Email already in use' });
    }
    res.status(500).json({ msg: 'Failed to update admin profile', error: err.message });
  }
});

export default router;
