import { Router } from 'express';
import { loginRateLimiter } from '../../middleware/rateLimit';
import { login } from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', loginRateLimiter, login);
