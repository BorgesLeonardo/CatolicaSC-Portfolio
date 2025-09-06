import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Rate limiting configuration
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests from this IP, please try again later.',
        retryAfter: Math.round(windowMs / 1000),
      });
    },
  });
};

// General rate limiting (100 requests per 15 minutes)
export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests from this IP, please try again in 15 minutes.'
);

// Strict rate limiting for auth endpoints (5 requests per 15 minutes)
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests
  'Too many authentication attempts, please try again in 15 minutes.'
);

// Payment rate limiting (10 requests per hour)
export const paymentRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 requests
  'Too many payment attempts, please try again in 1 hour.'
);

// Slow down configuration
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes, then...
  delayMs: 500, // Add 500ms delay per request above 50
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Compression configuration
export const compressionConfig = compression({
  level: 6,
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// MongoDB sanitization
export const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`MongoDB injection attempt detected in ${key}:`, req.body);
  },
});

// XSS protection
export const xssProtection = xss({
  whiteList: {
    p: [],
    br: [],
    strong: [],
    em: [],
    u: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    ul: [],
    ol: [],
    li: [],
    a: ['href', 'title'],
    img: ['src', 'alt', 'title'],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'],
});

// HTTP Parameter Pollution protection
export const hppConfig = hpp({
  whitelist: ['sort', 'order', 'limit', 'offset', 'page'],
});

// Security middleware stack
export const securityMiddleware = [
  helmetConfig,
  compressionConfig,
  cors(corsOptions),
  mongoSanitizeConfig,
  xssProtection,
  hppConfig,
];

// Request size limiting
export const requestSizeLimit = (size: string) => {
  return (req: any, res: any, next: any) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = parseInt(size.replace(/[^0-9]/g, '')) * 1024 * 1024; // Convert to bytes
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: `Request entity too large. Maximum size allowed is ${size}`,
      });
    }
    
    next();
  };
};

// IP whitelist middleware
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: any, res: any, next: any) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. IP not whitelisted.',
      });
    }
  };
};

// Request logging for security monitoring
export const securityLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };
    
    // Log suspicious activities
    if (res.statusCode >= 400) {
      console.warn('Suspicious activity detected:', logData);
    }
    
    // Log all requests in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Request:', logData);
    }
  });
  
  next();
};
