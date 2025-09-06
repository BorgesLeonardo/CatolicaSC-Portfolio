import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Security event types
export enum SecurityEventType {
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_AUTH_ATTEMPT = 'invalid_auth_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  MALICIOUS_REQUEST = 'malicious_request',
}

// Security event interface
export interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  ip: string;
  userAgent: string;
  userId?: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  metadata?: any;
}

// Security monitoring class
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Log security event
  logEvent(event: SecurityEvent): void {
    this.events.unshift(event);
    
    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Security Event: ${event.type} - ${event.message}`, {
        ip: event.ip,
        endpoint: event.endpoint,
        severity: event.severity,
      });
    }

    // In production, you might want to send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(event);
    }
  }

  // Get recent events
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(0, limit);
  }

  // Get events by type
  getEventsByType(type: SecurityEventType, limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(0, limit);
  }

  // Get events by severity
  getEventsBySeverity(severity: string, limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.severity === severity)
      .slice(0, limit);
  }

  // Check for suspicious patterns
  checkSuspiciousPatterns(ip: string, userAgent: string): boolean {
    const recentEvents = this.events.filter(event => 
      event.ip === ip && 
      event.timestamp > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
    );

    // Check for multiple failed auth attempts
    const failedAuthAttempts = recentEvents.filter(event => 
      event.type === SecurityEventType.INVALID_AUTH_ATTEMPT
    ).length;

    if (failedAuthAttempts >= 5) {
      this.logEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: 'high',
        message: `Multiple failed auth attempts from IP ${ip}`,
        ip,
        userAgent,
        endpoint: 'unknown',
        method: 'unknown',
        timestamp: new Date(),
        metadata: { failedAttempts: failedAuthAttempts },
      });
      return true;
    }

    // Check for rate limit violations
    const rateLimitViolations = recentEvents.filter(event => 
      event.type === SecurityEventType.RATE_LIMIT_EXCEEDED
    ).length;

    if (rateLimitViolations >= 3) {
      this.logEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: 'medium',
        message: `Multiple rate limit violations from IP ${ip}`,
        ip,
        userAgent,
        endpoint: 'unknown',
        method: 'unknown',
        timestamp: new Date(),
        metadata: { violations: rateLimitViolations },
      });
      return true;
    }

    return false;
  }

  // Send to external monitoring service (placeholder)
  private sendToExternalService(event: SecurityEvent): void {
    // In a real implementation, you would send to services like:
    // - Sentry
    // - DataDog
    // - New Relic
    // - Custom monitoring service
    
    console.log('Sending security event to external service:', event.type);
  }

  // Get security statistics
  getSecurityStats(): any {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(event => event.timestamp > last24Hours);
    
    const stats = {
      totalEvents: recentEvents.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      topIPs: {} as Record<string, number>,
      topEndpoints: {} as Record<string, number>,
    };

    recentEvents.forEach(event => {
      // Count by type
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
      
      // Count by IP
      stats.topIPs[event.ip] = (stats.topIPs[event.ip] || 0) + 1;
      
      // Count by endpoint
      stats.topEndpoints[event.endpoint] = (stats.topEndpoints[event.endpoint] || 0) + 1;
    });

    return stats;
  }
}

// Middleware to monitor requests
export const securityMonitorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const monitor = SecurityMonitor.getInstance();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  // Check for suspicious patterns
  if (monitor.checkSuspiciousPatterns(ip, userAgent)) {
    // You might want to block the request or add additional logging
    console.warn(`Suspicious activity detected from IP: ${ip}`);
  }

  // Monitor response
  res.on('finish', () => {
    // Log suspicious responses
    if (res.statusCode >= 400) {
      const severity = res.statusCode >= 500 ? 'high' : 'medium';
      
      monitor.logEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity,
        message: `HTTP ${res.statusCode} response from ${req.method} ${req.path}`,
        ip,
        userAgent,
        userId: (req as any).auth?.userId,
        endpoint: req.path,
        method: req.method,
        timestamp: new Date(),
        metadata: {
          statusCode: res.statusCode,
          responseTime: Date.now() - (req as any).startTime,
        },
      });
    }
  });

  // Record request start time
  (req as any).startTime = Date.now();
  
  next();
};

// Middleware to detect SQL injection attempts
export const sqlInjectionDetector = (req: Request, res: Response, next: NextFunction) => {
  const monitor = SecurityMonitor.getInstance();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  // Common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
    /(\b(OR|AND)\s+1\s*=\s*1)/i,
    /(\b(OR|AND)\s+0\s*=\s*0)/i,
    /(\bUNION\s+SELECT\b)/i,
    /(\bDROP\s+TABLE\b)/i,
    /(\bINSERT\s+INTO\b)/i,
    /(\bDELETE\s+FROM\b)/i,
    /(\bUPDATE\s+SET\b)/i,
  ];

  // Check request body, query, and params
  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of sqlPatterns) {
    if (pattern.test(requestData)) {
      monitor.logEvent({
        type: SecurityEventType.SQL_INJECTION_ATTEMPT,
        severity: 'critical',
        message: `SQL injection attempt detected in ${req.method} ${req.path}`,
        ip,
        userAgent,
        userId: (req as any).auth?.userId,
        endpoint: req.path,
        method: req.method,
        timestamp: new Date(),
        metadata: {
          pattern: pattern.toString(),
          requestData: requestData.substring(0, 500), // Limit size
        },
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid request detected',
      });
    }
  }

  next();
};

// Middleware to detect XSS attempts
export const xssDetector = (req: Request, res: Response, next: NextFunction) => {
  const monitor = SecurityMonitor.getInstance();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  // Common XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>.*?<\/link>/gi,
    /<meta[^>]*>.*?<\/meta>/gi,
    /<style[^>]*>.*?<\/style>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
  ];

  // Check request body, query, and params
  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of xssPatterns) {
    if (pattern.test(requestData)) {
      monitor.logEvent({
        type: SecurityEventType.XSS_ATTEMPT,
        severity: 'high',
        message: `XSS attempt detected in ${req.method} ${req.path}`,
        ip,
        userAgent,
        userId: (req as any).auth?.userId,
        endpoint: req.path,
        method: req.method,
        timestamp: new Date(),
        metadata: {
          pattern: pattern.toString(),
          requestData: requestData.substring(0, 500), // Limit size
        },
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid request detected',
      });
    }
  }

  next();
};
