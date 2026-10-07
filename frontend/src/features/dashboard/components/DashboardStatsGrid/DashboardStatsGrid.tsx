import type { ReactNode } from 'react';
import { Card, Col, Progress, Row, Statistic, Tooltip, Typography } from 'antd';
import {
  CheckCircleOutlined,
  EyeOutlined,
  FlagOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  StepForwardOutlined,
} from '@ant-design/icons';
import { STATS_SPLIT_COLORS } from '../../../../constants/dashboard.constants';
import type { DashboardStats, DeletedContribution } from '../../../../types/dashboard.types';
import './DashboardStatsGrid.css';

const { Text } = Typography;

type DashboardStatsGridProps = {
  stats: DashboardStats;
  deleted: DeletedContribution;
};

type Tile = {
  title: string;
  value: number;
  // How much of `value` came from since-deleted videos/ads.
  deletedValue: number;
  icon: ReactNode;
  accent: 'primary' | 'success';
  explainer: string;
  // A visible one-line derived-ratio callout, shown under the value - reserved for the one or two
  // stats where a ratio is more informative than the raw count on its own.
  caption?: string;
};

/**
 * @description Renders the dashboard's raw-count KPI tiles in two rows, grouped by whether the
 * underlying event is ad-scoped or video-scoped. When deleted videos/ads contributed to the range,
 * every tile splits its total into active vs deleted. Rates live in DashboardRateBreakdown.
 */
export const DashboardStatsGrid = ({ stats, deleted }: DashboardStatsGridProps) => {
  const showSplit = Object.values(deleted).some((count) => count > 0);
  const adsPerPlay = stats.videoViews > 0 ? stats.impressions / stats.videoViews : null;

  const adTiles: Tile[] = [
    {
      title: 'Impressions',
      value: stats.impressions,
      deletedValue: deleted.impressions,
      icon: <EyeOutlined />,
      accent: 'primary',
      explainer: 'Counted every time an ad is shown to a viewer.',
      caption:
        adsPerPlay !== null
          ? `${adsPerPlay.toFixed(1)} ads served for every video play`
          : undefined,
    },
    {
      title: 'Completions',
      value: stats.completions,
      deletedValue: deleted.completions,
      icon: <CheckCircleOutlined />,
      accent: 'primary',
      explainer: 'Counted when an ad plays all the way through without being skipped.',
    },
    {
      title: 'Skips',
      value: stats.skips,
      deletedValue: deleted.skips,
      icon: <StepForwardOutlined />,
      accent: 'primary',
      explainer: 'Counted when a viewer skips an ad before it finishes.',
    },
    {
      title: 'Clicks',
      value: stats.clicks,
      deletedValue: deleted.clicks,
      icon: <LinkOutlined />,
      accent: 'primary',
      explainer: 'Counted when a viewer clicks through on an ad.',
    },
  ];

  const videoTiles: Tile[] = [
    {
      title: 'Plays',
      value: stats.videoViews,
      deletedValue: deleted.videoViews,
      icon: <PlayCircleOutlined />,
      accent: 'success',
      explainer: 'Counted the first time a viewer starts the video.',
    },
    {
      title: 'Video completions',
      value: stats.videoCompletions,
      deletedValue: deleted.videoCompletions,
      icon: <FlagOutlined />,
      accent: 'success',
      explainer: 'Counted when a viewer watches the video all the way through.',
      caption:
        stats.videoViews > 0
          ? `${(stats.videoCompletionRate * 100).toFixed(1)}% of plays finish the video`
          : undefined,
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
              <Statistic
                title={
                  <span>
                    {tile.title}{' '}
                    <Tooltip title={tile.explainer}>
                      <QuestionCircleOutlined className="dashboard-stats-grid__explainer-icon" />
                    </Tooltip>
                  </span>
                }
                value={tile.value}
              />
              {showSplit && (
                <div className="dashboard-stats-grid__split">
                  <Progress
                    percent={
                      tile.value > 0 ? ((tile.value - tile.deletedValue) / tile.value) * 100 : 0
                    }
                    showInfo={false}
                    size="small"
                    strokeColor={STATS_SPLIT_COLORS[tile.accent]}
                    railColor={STATS_SPLIT_COLORS.deleted}
                  />
                  <div className="dashboard-stats-grid__split-legend">
                    <span>
                      <span
                        className={`dashboard-stats-grid__split-dot dashboard-stats-grid__split-dot--${tile.accent}`}
                      />
                      {(tile.value - tile.deletedValue).toLocaleString()} active
                    </span>
                    <span>
                      <span className="dashboard-stats-grid__split-dot dashboard-stats-grid__split-dot--deleted" />
                      {tile.deletedValue.toLocaleString()} deleted
                    </span>
                  </div>
                </div>
              )}
              {tile.caption && (
                <Text type="secondary" className="dashboard-stats-grid__caption">
                  {tile.caption}
                </Text>
              )}
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
