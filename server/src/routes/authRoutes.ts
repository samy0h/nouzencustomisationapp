import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateAdmin, requireAdmin, getAdminUsers, addAdminUser, removeAdminUser, changeAdminPassword } from '../middleware/adminAuth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/admin/login', asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError('Invalid username or password', 401);

  const token = authenticateAdmin(parsed.data.username, parsed.data.password);
  if (!token) throw new AppError('Invalid username or password', 401);

  res.json({ status: 'success', data: { token, username: parsed.data.username } });
}));

router.get('/admin/users', requireAdmin, asyncHandler(async (_req: Request, res: Response) => {
  const users = getAdminUsers();
  res.json({ status: 'success', data: { users } });
}));

router.post('/admin/users', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) throw new AppError('Username and password are required', 400);

  addAdminUser(username, password);
  res.json({ status: 'success', message: 'User added successfully' });
}));

router.delete('/admin/users/:username', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const username = String(req.params.username);
  removeAdminUser(username);
  res.json({ status: 'success', message: 'User removed successfully' });
}));

router.post('/admin/change-password', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) throw new AppError('Username and new password are required', 400);

  changeAdminPassword(username, newPassword);
  res.json({ status: 'success', message: 'Password changed successfully' });
}));

export default router;
