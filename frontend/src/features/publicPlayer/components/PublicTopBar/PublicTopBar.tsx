import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Flex } from 'antd';
import { Routes } from '../../../../constants/routes.constants';
import { BrandMark } from '../../../../components/BrandMark/BrandMark';
import { ThemeToggle } from '../../../../components/ThemeToggle/ThemeToggle';
import './PublicTopBar.css';

/**
 * @description The public pages' top bar - the FrameCue mark (linking home) on the left, and the
 * theme toggle plus the page's own action (admin login, or back to all videos) on the right.
 */
export const PublicTopBar = ({ children }: { children: ReactNode }) => (
  <header className="public-top-bar">
    <Link to={Routes.HOME} className="public-top-bar__brand">
      <BrandMark />
      FrameCue
    </Link>
    <Flex align="center" gap={12}>
      <ThemeToggle />
      {children}
    </Flex>
  </header>
);
