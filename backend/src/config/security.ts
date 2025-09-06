import { config } from 'dotenv';

config();

// Security configuration
export const securityConfig = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    authMax: 5, // 5 auth requests per window
    paymentMax: 10, // 10 payment requests per hour
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
  
  // Request size limits
  requestSize: {
    json: '10mb',
    urlencoded: '10mb',
  },
  
  // Security headers
  helmet: {
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
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  },
  
  // IP whitelist (for admin endpoints)
  ipWhitelist: process.env.ADMIN_IP_WHITELIST?.split(',') || [],
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  
  // Database security
  database: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'dev',
    enableSecurityLogging: true,
  },
  
  // Monitoring
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableHealthChecks: true,
    healthCheckInterval: 30000, // 30 seconds
  },
  
  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    key: process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars',
  },
  
  // File upload security
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
  
  // API security
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableCors: true,
  },
  
  // External services
  external: {
    mercadoPago: {
      timeout: 30000, // 30 seconds
      retries: 3,
      retryDelay: 1000, // 1 second
    },
    clerk: {
      timeout: 10000, // 10 seconds
      retries: 3,
      retryDelay: 500, // 500ms
    },
  },
};

// Security validation functions
export const validateSecurityConfig = () => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'CLERK_PUBLISHABLE_KEY',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Validate JWT secret
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.warn('Warning: JWT_SECRET should be at least 32 characters long');
  }
  
  // Validate encryption key
  if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
    console.warn('Warning: ENCRYPTION_KEY should be at least 32 characters long');
  }
  
  return true;
};

// Security middleware factory
export const createSecurityMiddleware = (config: any) => {
  return {
    rateLimit: (windowMs: number, max: number) => ({
      windowMs,
      max,
      message: `Too many requests from this IP, please try again in ${Math.round(windowMs / 1000)} seconds`,
    }),
    
    cors: (origins: string[]) => ({
      origin: origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
    
    helmet: (options: any) => ({
      contentSecurityPolicy: options.contentSecurityPolicy,
      crossOriginEmbedderPolicy: options.crossOriginEmbedderPolicy,
      hsts: options.hsts,
    }),
  };
};
