import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/', getDashboardStats);
