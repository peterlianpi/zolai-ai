/**
 * Custom Authentication and Authorization Errors
 * 
 * Provides unified error classes for better error handling across the auth layer.
 */

export class AuthError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string = "AUTH_ERROR", status: number = 401) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string = "Authentication required") {
    super(message, "UNAUTHENTICATED", 401);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AuthError {
  constructor(message: string = "Insufficient permissions") {
    super(message, "UNAUTHORIZED", 403);
    this.name = "AuthorizationError";
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message: string = "Session has expired. Please log in again.") {
    super(message, "SESSION_EXPIRED", 401);
    this.name = "SessionExpiredError";
    Object.setPrototypeOf(this, SessionExpiredError.prototype);
  }
}

export class AccountBannedError extends AuthError {
  constructor(message: string = "Account has been banned.") {
    super(message, "ACCOUNT_BANNED", 403);
    this.name = "AccountBannedError";
    Object.setPrototypeOf(this, AccountBannedError.prototype);
  }
}

export class CSRFError extends AuthError {
  constructor(message: string = "Invalid or missing CSRF token.") {
    super(message, "CSRF_INVALID", 403);
    this.name = "CSRFError";
    Object.setPrototypeOf(this, CSRFError.prototype);
  }
}
