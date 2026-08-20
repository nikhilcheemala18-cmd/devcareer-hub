import mongoose from "mongoose";

export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class InvalidIdError extends AppError {
  constructor(id: string) {
    super(`Invalid id: ${id}`, "INVALID_ID");
    this.name = "InvalidIdError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class DuplicateSlugError extends AppError {
  constructor(slug: string) {
    super(`Slug already exists: ${slug}`, "DUPLICATE_SLUG");
    this.name = "DuplicateSlugError";
  }
}

export class DatabaseError extends AppError {
  constructor(message = "A database error occurred.") {
    super(message, "DATABASE_ERROR");
    this.name = "DatabaseError";
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

/**
 * Converts an unexpected Mongoose/MongoDB error into a predictable AppError.
 * Unknown errors are logged server-side and replaced with a generic message
 * so raw database internals are never returned to callers.
 */
export function toAppError(error: unknown, slug?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (isDuplicateKeyError(error)) {
    return new DuplicateSlugError(slug ?? "unknown");
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return new ValidationError(error.message);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new InvalidIdError(String(error.value));
  }

  console.error(error);
  return new DatabaseError();
}
