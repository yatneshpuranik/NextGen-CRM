export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details: any[];

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access request', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden to this resource', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict state encountered', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request format', code = 'BAD_REQUEST', details: any[] = []) {
    super(message, 400, code, details);
  }
}
