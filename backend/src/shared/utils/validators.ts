import { AppError } from '../errors/AppError';

export function validateEmail(email: unknown): string {
  if (typeof email !== 'string' || !email.trim()) {
    throw new AppError('Email is required', 400);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new AppError('Invalid email format', 400);
  }
  return email.trim().toLowerCase();
}

export function validateRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(`${fieldName} is required`, 400);
  }
  return value.trim();
}

export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new AppError(`${fieldName} must be a boolean`, 400);
  }
  return value;
}
