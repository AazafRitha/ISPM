import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

// Ensure Mongoose models are registered before routes/controllers use them
import './models/User.js';

const app = express();
app.use(helmet());
app.use(cors({ 
  origin: [
    process.env.CLIENT_URL ?? 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176'
  ], 
  credentials: true 
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded files (e.g., avatars) from frontend/public/uploads with legacy fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToFrontendUploads = path.join(__dirname, '../../frontend/public/uploads');
const pathToLegacyUploads = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(pathToFrontendUploads));
// Fallback (second static) allows serving old files if not found in new location
app.use('/uploads', express.static(pathToLegacyUploads));

// Import routes
import contactRoutes from './routes/contactRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import quizAttemptRoutes from './routes/quizAttemptRoutes.js';

import simulationRoutes from './routes/simulationRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

app.get('/', (_, res) => res.json({ ok: true, service: 'Guardians API' }));

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on :${PORT}`));
});
