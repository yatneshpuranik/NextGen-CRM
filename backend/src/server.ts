import app from './app';
import { logger } from './config/logger';
import { prisma } from './config/db';
import { hashPassword } from './utils/password';
import { Server } from 'http';

const PORT = process.env.PORT || 5000;
let server: Server;

const startServer = async (): Promise<void> => {
  try {
    logger.info('Attempting database connection...');
    await prisma.$connect();
    logger.info('✅ Database Connected Successfully');

    // Ensure Hardcoded Admin Account exists
    const adminEmail = 'nextgen@admin.com';
    const adminPassword = await hashPassword('112233nextgen');
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          fullName: 'NextGen Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'ADMIN',
          isActive: true
        }
      });
      logger.info(`Created default admin account: ${adminEmail}`);
    } else {
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: adminPassword,
          role: 'ADMIN',
          isActive: true
        }
      });
      logger.info(`Updated admin account credentials: ${adminEmail}`);
    }

    // Ensure Default Warehouse exists and associate legacy inventory records
    let defaultWarehouse = await prisma.warehouse.findUnique({
      where: { code: 'WH-DEFAULT' }
    });
    if (!defaultWarehouse) {
      defaultWarehouse = await prisma.warehouse.create({
        data: {
          code: 'WH-DEFAULT',
          name: 'Default Warehouse',
          address: 'Main Headquarters Warehouse',
          contactPerson: 'Operations Manager',
          contactNumber: '0000000000',
          status: 'ACTIVE'
        }
      });
      logger.info('Created WH-DEFAULT warehouse record.');
    }

    const updatedInvs = await prisma.inventory.updateMany({
      where: { warehouseId: null },
      data: { warehouseId: defaultWarehouse.id }
    });
    if (updatedInvs.count > 0) {
      logger.info(`Associated ${updatedInvs.count} legacy inventory records with WH-DEFAULT.`);
    }

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

process.on('unhandledRejection', (reason: any) => {
  logger.error(`🚨 Unhandled Rejection: ${reason instanceof Error ? reason.message : reason}`, { 
    stack: reason instanceof Error ? reason.stack : undefined 
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error(`🚨 Uncaught Exception: ${error.message}`, { stack: error.stack });
  // Uncaught exceptions require immediate process restart
  process.exit(1);
});

startServer();
