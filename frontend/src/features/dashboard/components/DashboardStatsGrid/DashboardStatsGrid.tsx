import type { ReactNode } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import {
  CheckCircleOutlined,
  EyeOutlined,
  FlagOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  StepForwardOutlined,
} from '@ant-design/icons';
import type { DashboardStats } from '../../../../types/dashboard.types';
import './DashboardStatsGrid.css';

const { Text } = Typography;

type DashboardStatsGridProps = {
  stats: DashboardStats;
};

type Tile = {
  title: string;
  value: number;
  icon: ReactNode;
  accent: 'primary' | 'success';
};

/**
 * @description Renders the dashboard's raw-count KPI tiles in two rows, grouped by whether the
 * underlying event is ad-scoped or video-scoped. Rate metrics derived from these counts live in
 * DashboardRateBreakdown instead, so they aren't duplicated here.
 */
export const DashboardStatsGrid = ({ stats }: DashboardStatsGridProps) => {
  const adTiles: Tile[] = [
    { title: 'Impressions', value: stats.impressions, icon: <EyeOutlined />, accent: 'primary' },
    {
      title: 'Completions',
      value: stats.completions,
      icon: <CheckCircleOutlined />,
      accent: 'primary',
    },
    { title: 'Skips', value: stats.skips, icon: <StepForwardOutlined />, accent: 'primary' },
    { title: 'Clicks', value: stats.clicks, icon: <LinkOutlined />, accent: 'primary' },
  ];

  const videoTiles: Tile[] = [
    { title: 'Plays', value: stats.videoViews, icon: <PlayCircleOutlined />, accent: 'success' },
    {
      title: 'Video completions',
      value: stats.videoCompletions,
      icon: <FlagOutlined />,
      accent: 'success',
    },
  ];

  const renderRow = (
    label: string,
    tiles: Tile[],
    lgSpan: number,
    accent: 'primary' | 'success',
  ) => (
    <div className="dashboard-stats-grid__section">
      <div className="dashboard-stats-grid__section-label">
        <span
          className={`dashboard-stats-grid__section-bar dashboard-stats-grid__section-bar--${accent}`}
        />
        <Text type="secondary" className="dashboard-stats-grid__section-label-text">
          {label}
        </Text>
      </div>
      <Row gutter={[16, 16]}>
        {tiles.map((tile) => (
          <Col xs={24} sm={12} lg={lgSpan} key={tile.title}>
            <Card className="dashboard-stats-grid__card">
              <div
                className={`dashboard-stats-grid__icon dashboard-stats-grid__icon--${tile.accent}`}
              >
                {tile.icon}
              </div>
              <Statistic title={tile.title} value={tile.value} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  return (
    <>
      {renderRow('Ad performance', adTiles, 6, 'primary')}
      {renderRow('Video engagement', videoTiles, 12, 'success')}
    </>
  );
};
