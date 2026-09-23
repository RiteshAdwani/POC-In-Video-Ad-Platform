import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { getDashboardStats } from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/', requireAuth, getDashboardStats);
