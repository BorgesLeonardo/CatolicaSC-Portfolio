import { Router } from 'express';
import { SecurityMonitor, SecurityEventType } from '../middlewares/securityMonitor';
import { authMiddleware } from '../middlewares/auth';
import { createError } from '../middlewares/errorHandler';

const router = Router();
const monitor = SecurityMonitor.getInstance();

// Get security statistics
router.get('/stats', authMiddleware, (req, res, next) => {
  try {
    const stats = monitor.getSecurityStats();
    res.success(stats);
  } catch (error) {
    next(error);
  }
});

// Get recent security events
router.get('/events', authMiddleware, (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const events = monitor.getRecentEvents(limit);
    res.success(events);
  } catch (error) {
    next(error);
  }
});

// Get events by type
router.get('/events/:type', authMiddleware, (req, res, next) => {
  try {
    const { type } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    if (!Object.values(SecurityEventType).includes(type as SecurityEventType)) {
      throw createError('Invalid event type', 400);
    }
    
    const events = monitor.getEventsByType(type as SecurityEventType, limit);
    res.success(events);
  } catch (error) {
    next(error);
  }
});

// Get events by severity
router.get('/events/severity/:severity', authMiddleware, (req, res, next) => {
  try {
    const { severity } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
      throw createError('Invalid severity level', 400);
    }
    
    const events = monitor.getEventsBySeverity(severity, limit);
    res.success(events);
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

export default router;
