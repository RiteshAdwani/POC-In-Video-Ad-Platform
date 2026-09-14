import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { signAccessToken } from '../../lib/jwt';
import { UnauthorizedError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { loginSchema } from './auth.schema';

/**
 * @description Verifies an admin's credentials and issues an access token.
 */
export const login: RequestHandler = async (req, res) => {
  // Extract credentials from req body
  const { email, password } = loginSchema.parse(req.body);

  // Fetch admin from DB
  const admin = await prisma.admin.findUnique({ where: { email } });

  // Check if password matches
  const passwordMatches = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

  if (!admin || !passwordMatches) {
    throw new UnauthorizedError(ErrorMessages.INVALID_CREDENTIALS);
  }

  // Sign the access token
  const accessToken = signAccessToken({ adminId: admin.id });
  res.json({ data: { accessToken }, message: ApiSuccessMessages.LOGIN_SUCCESSFUL });
};
