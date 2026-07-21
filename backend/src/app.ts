import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import v1Routes from './routes';
import { globalErrorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logging.middleware';

// Load environment variables
dotenv.config();

const app = express();

// Apply request logging and response compression
app.use(requestLogger);
app.use(compression());

// Apply security headers
app.use(helmet());

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Apply Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/', limiter);

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI Documentation Endpoint
app.use(['/api-docs', '/crm/api'], swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Root Health Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    application: "NextGen ERP + CRM API",
    status: "Running",
    version: "1.0.0",
    swagger: "/crm/api",
    api: "/crm/v1",
    documentation: `${req.protocol}://${req.get("host")}/crm/api`
  });
});

// Mount REST API Routers
app.use('/', v1Routes);

// Global Error Handler Middleware
app.use(globalErrorHandler);

export default app;
