import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler.js';

const adminUsers = new Map([
  ['Samy', process.env.ADMIN_SAMY_PASSWORD || 'Nouzen#746878'],
  ['Akram', process.env.ADMIN_AKRAM_PASSWORD || 'Nouzen#746878'],
]);
const authSecret = process.env.ADMIN_AUTH_SECRET || 'nouzen-admin-auth-secret-change-me';

export function authenticateAdmin(username: string, password: string): string | null {
  if (!adminUsers.has(username) || adminUsers.get(username) !== password) return null;
  const payload = `${username}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', authSecret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return next(new AppError('Admin authentication required', 401));

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const separator = decoded.lastIndexOf(':');
    const payload = decoded.slice(0, separator);
    const signature = decoded.slice(separator + 1);
    const expected = crypto.createHmac('sha256', authSecret).update(payload).digest('hex');
    if (!payload || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return next(new AppError('Invalid admin session', 401));
    }
    const [username, issuedAt] = payload.split(':');
    if (!username || !adminUsers.has(username) || Date.now() - Number(issuedAt) > 8 * 60 * 60 * 1000) {
      return next(new AppError('Admin session expired', 401));
    }
    return next();
  } catch {
    return next(new AppError('Invalid admin session', 401));
  }
}

export function getAdminUsers(): string[] {
  return Array.from(adminUsers.keys());
}

export function addAdminUser(username: string, password: string): void {
  if (adminUsers.has(username)) {
    throw new AppError('User already exists', 400);
  }
  adminUsers.set(username, password);
}

export function removeAdminUser(username: string): void {
  if (adminUsers.size <= 1) {
    throw new AppError('Cannot remove the last admin user', 400);
  }
  if (!adminUsers.has(username)) {
    throw new AppError('User not found', 404);
  }
  adminUsers.delete(username);
}

export function changeAdminPassword(username: string, newPassword: string): void {
  if (!adminUsers.has(username)) {
    throw new AppError('User not found', 404);
  }
  adminUsers.set(username, newPassword);
}
