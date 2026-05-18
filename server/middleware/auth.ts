import { Request, Response, NextFunction } from 'express';
import { adminUsers } from '../data/mock-db';

// Mock JWT verification (in real app, use proper JWT library)
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  // Mock token validation (just check if it starts with 'mock-jwt-token')
  if (!token.startsWith('mock-jwt-token')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid token',
    });
  }

  // Attach mock admin user to request
  (req as Request & { user?: typeof adminUsers[0] }).user = adminUsers[0];
  
  next();
};

// Role-based access control
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: typeof adminUsers[0] }).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No user found',
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions',
      });
    }

    next();
  };
};
