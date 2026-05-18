import { Request, Response, NextFunction } from 'express';

// Basic validation middleware
export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter(field => !(field in req.body));

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

// Validate ID parameter
export const validateIdParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} parameter`,
      });
    }

    next();
  };
};

// Validate query parameters
export const validateQuery = (allowedParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const queryParams = Object.keys(req.query);
    const invalidParams = queryParams.filter(param => !allowedParams.includes(param));

    if (invalidParams.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid query parameters: ${invalidParams.join(', ')}`,
      });
    }

    next();
  };
};
