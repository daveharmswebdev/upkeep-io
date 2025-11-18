// IMPORTANT: Must import reflect-metadata FIRST before anything else
import 'reflect-metadata';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import { createContainer } from './container';
import { createAuthRoutes, createPropertyRoutes } from './presentation/routes';
import { createLeaseRoutes } from './presentation/routes/leaseRoutes';
import { createErrorMiddleware } from './presentation/middleware';
import { ILogger } from './domain/services';

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Create DI container
const container = createContainer();
const logger = container.get<ILogger>('ILogger');

// Create Express app
const app: Application = express();

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', createAuthRoutes(container));
app.use('/api/properties', createPropertyRoutes(container));
app.use('/api/leases', createLeaseRoutes(container));

// Error handling middleware (must be last)
app.use(createErrorMiddleware(logger));

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CORS origin: ${CORS_ORIGIN}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
