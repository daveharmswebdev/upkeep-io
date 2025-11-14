import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, DomainError } from '@domain/errors';
import { ILogger } from '../../domain/services';

export const createErrorMiddleware = (logger: ILogger) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
      res.status(400).json({
        error: err.message,
        type: 'ValidationError',
      });
      return;
    }

    if (err instanceof NotFoundError) {
      res.status(404).json({
        error: err.message,
        type: 'NotFoundError',
      });
      return;
    }

    if (err instanceof DomainError) {
      res.status(400).json({
        error: err.message,
        type: 'DomainError',
      });
      return;
    }

    // Unexpected errors
    logger.error('Unexpected error', err);
    res.status(500).json({
      error: 'Internal server error',
      type: 'InternalError',
    });
  };
};
