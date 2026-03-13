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

// Block API requests until MongoDB is connected
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is connecting. Please try again in a moment.'
    });
  }
  next();
});

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

// Database connection - use real MongoDB for persistence
const connectDB = async () => {
  try {
    const configuredUri = process.env.MONGODB_URI?.trim();
    const localUri = 'mongodb://localhost:27017/jengo';
    const uri = configuredUri || localUri;

    try {
      await mongoose.connect(uri);
      if (!configuredUri && uri === localUri) {
        console.log('Using local MongoDB. Set MONGODB_URI in .env for cloud persistence (e.g. MongoDB Atlas).');
      }
    } catch (error) {
      console.warn('MongoDB connection failed:', error.message);
      console.warn('Falling back to in-memory MongoDB (data is lost on restart).');
      console.warn('For persistence: run MongoDB locally or set MONGODB_URI in server/.env (see .env.example)');

      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri('jengo');
      await mongoose.connect(inMemoryUri);

      const shutdown = async () => {
        try {
          await mongoose.disconnect();
        } finally {
          await mongod.stop();
        }
      };
      process.once('SIGINT', shutdown);
      process.once('SIGTERM', shutdown);
    }

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

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

// Start server only after MongoDB is connected
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
