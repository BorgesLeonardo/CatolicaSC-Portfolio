import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { responseHandler } from './middlewares/responseHandler';
import { 
  securityMiddleware, 
  generalRateLimit, 
  speedLimiter,
  securityLogger,
  requestSizeLimit 
} from './middlewares/security';
import { 
  securityMonitorMiddleware, 
  sqlInjectionDetector, 
  xssDetector 
} from './middlewares/securityMonitor';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware stack
app.use(securityMiddleware);

// Security monitoring
app.use(securityMonitorMiddleware);
app.use(sqlInjectionDetector);
app.use(xssDetector);

// Rate limiting
app.use(generalRateLimit);
app.use(speedLimiter);

// Request size limiting
app.use(requestSizeLimit('10mb'));

// Security logging
app.use(securityLogger);

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response handler middleware
app.use(responseHandler);

// Routes
app.use('/', routes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
