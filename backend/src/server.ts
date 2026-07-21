import app from './app';
import { logger } from './config/logger';
import { prisma } from './config/db';
import { Server } from 'http';

const PORT = process.env.PORT || 5000;
let server: Server;

const startServer = async (): Promise<void> => {
  try {
    logger.info('Attempting database connection...');
    await prisma.$connect();
    logger.info('✅ Database Connected Successfully');

    server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📚 Swagger Docs: http://localhost:${PORT}/crm/api`);
    });
  } catch (error: any) {
    logger.error('❌ Database connection failed during startup:', error);
    process.exit(1);
  }
};

// Handle graceful shutdowns
const shutdown = async (): Promise<void> => {
  logger.info('Shutting down API server gracefully...');
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await prisma.$disconnect();
      logger.info('Database client disconnected.');
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    logger.info('Database client disconnected.');
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
