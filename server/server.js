import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import opportunityRoutes from './routes/opportunity.routes.js';
import applicationRoutes from './routes/application.routes.js';
import contactRoutes from './routes/contact.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/contact', contactRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Jengo API is running' });
});

// Database connection
const connectDB = async () => {
  try {
    const configuredUri = process.env.MONGODB_URI;
    const localUri = 'mongodb://localhost:27017/jengo';

    try {
      await mongoose.connect(configuredUri || localUri);
      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      if (configuredUri) throw error;
      console.warn('Local MongoDB not available, starting in-memory MongoDB for development...');
    }

    const mongod = await MongoMemoryServer.create();
    const inMemoryUri = mongod.getUri('jengo');
    await mongoose.connect(inMemoryUri);
    console.log('MongoDB (in-memory) connected successfully');

    const shutdown = async () => {
      try {
        await mongoose.disconnect();
      } finally {
        await mongod.stop();
      }
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
