import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

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

// Import routes
import contactRoutes from './routes/contactRoutes.js';
import contentRoutes from './routes/contentRoutes.js';

app.get('/', (_, res) => res.json({ ok: true, service: 'Guardians API' }));

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/content', contentRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on :${PORT}`));
});
