import type { ReactNode } from 'react';
import { Progress, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  AD_TREND_METRIC_COLORS,
  AdTrendMetric,
  DashboardSection,
  VIDEO_TREND_METRIC_COLORS,
  VideoTrendMetric,
} from '../../../../constants/dashboard.constants';
import { useThemeMode } from '../../../theme/hooks/useThemeMode';
import { formatPercent } from '../../../../lib/formatPercent';
import type { DashboardStats, DeletedContribution } from '../../../../types/dashboard.types';
import './DashboardStatsGrid.css';

type DashboardStatsGridProps = {
  section: DashboardSection;
  stats: DashboardStats;
  deleted: DeletedContribution;
};

type Tile = {
  title: string;
  // Matches a --fc-metric-* CSS variable, for the tile's marker.
  metricKey: string;
  color: string;
  value: number;
  // How much of `value` came from since-deleted videos/ads.
  deletedValue: number;
  explainer: string;
  caption?: ReactNode;
};

/**
 * @description One section's KPI tiles - the four ad counts in a row, or the two video counts
 * stacked. When deleted content contributed to the range, every tile shows its active/deleted split.
 */
export const DashboardStatsGrid = ({ section, stats, deleted }: DashboardStatsGridProps) => {
  const { mode } = useThemeMode();
  const adColors = AD_TREND_METRIC_COLORS[mode];
  const videoColors = VIDEO_TREND_METRIC_COLORS[mode];
  const showSplit = Object.values(deleted).some((count) => count > 0);
  const hasImpressions = stats.impressions > 0;
  const hasPlays = stats.videoViews > 0;

  const adTiles: Tile[] = [
    {
      title: AdTrendMetric.IMPRESSIONS,
      metricKey: 'impressions',
      color: adColors[AdTrendMetric.IMPRESSIONS],
      value: stats.impressions,
      deletedValue: deleted.impressions,
      explainer: 'Counted every time an ad is shown to a viewer.',
      caption: hasPlays && (
        <>
          <strong>{(stats.impressions / stats.videoViews).toFixed(1)}</strong> ads per play
        </>
      ),
    },
    {
      title: AdTrendMetric.COMPLETIONS,
      metricKey: 'completions',
      color: adColors[AdTrendMetric.COMPLETIONS],
      value: stats.completions,
      deletedValue: deleted.completions,
      explainer: 'Counted when an ad plays all the way through without being skipped.',
      caption: hasImpressions && (
        <>
          <strong>{formatPercent(stats.completionRate)}</strong> watched to the end
        </>
      ),
    },
    {
      title: AdTrendMetric.SKIPS,
      metricKey: 'skips',
      color: adColors[AdTrendMetric.SKIPS],
      value: stats.skips,
      deletedValue: deleted.skips,
      explainer: 'Counted when a viewer skips an ad before it finishes.',
      caption: hasImpressions && (
        <>
          <strong>{formatPercent(stats.skipRate)}</strong> skipped
        </>
      ),
    },
    {
      title: AdTrendMetric.CLICKS,
      metricKey: 'clicks',
      color: adColors[AdTrendMetric.CLICKS],
      value: stats.clicks,
      deletedValue: deleted.clicks,
      explainer: 'Counted when a viewer clicks through on an ad.',
      caption: hasImpressions && (
        <>
          <strong>{formatPercent(stats.ctr)}</strong> click-through
        </>
      ),
    },
  ];

  const videoTiles: Tile[] = [
    {
      title: VideoTrendMetric.PLAYS,
      metricKey: 'plays',
      color: videoColors[VideoTrendMetric.PLAYS],
      value: stats.videoViews,
      deletedValue: deleted.videoViews,
      explainer: 'Counted the first time a viewer starts the video.',
    },
    {
      title: VideoTrendMetric.VIDEO_COMPLETIONS,
      metricKey: 'video-completions',
      color: videoColors[VideoTrendMetric.VIDEO_COMPLETIONS],
      value: stats.videoCompletions,
      deletedValue: deleted.videoCompletions,
      explainer: 'Counted when a viewer watches the video all the way through.',
      caption: hasPlays && (
        <>
          <strong>{formatPercent(stats.videoCompletionRate)}</strong> finish the video
        </>
      ),
    },
  ];

  const tiles = section === DashboardSection.ADS ? adTiles : videoTiles;

  return (
    <div className={`dashboard-stats-grid dashboard-stats-grid--${section}`}>
      {tiles.map((tile) => (
        <div className="dashboard-stats-grid__tile" key={tile.title}>
          <div className="dashboard-stats-grid__label">
            <span
              className={`dashboard-stats-grid__marker dashboard-stats-grid__marker--${tile.metricKey}`}
            />
            {tile.title}
            <Tooltip title={tile.explainer}>
              <QuestionCircleOutlined className="dashboard-stats-grid__explainer-icon" />
            </Tooltip>
          </div>
          <div className="dashboard-stats-grid__value">{tile.value.toLocaleString()}</div>
          {tile.caption && <div className="dashboard-stats-grid__caption">{tile.caption}</div>}

          {showSplit && (
            <div className="dashboard-stats-grid__split">
              <div className="dashboard-stats-grid__split-legend">
                <span>
                  <span
                    className={`dashboard-stats-grid__swatch dashboard-stats-grid__marker--${tile.metricKey}`}
                  />
                  <strong>{(tile.value - tile.deletedValue).toLocaleString()}</strong> active
                </span>
                {tile.deletedValue > 0 ? (
                  <span>
                    <span className="dashboard-stats-grid__swatch dashboard-stats-grid__swatch--deleted" />
                    <strong>{tile.deletedValue.toLocaleString()}</strong> deleted
                  </span>
                ) : (
                  <span className="dashboard-stats-grid__none">No deleted content</span>
                )}
              </div>
              <Progress
                percent={tile.value > 0 ? ((tile.value - tile.deletedValue) / tile.value) * 100 : 0}
                showInfo={false}
                strokeColor={tile.color}
                strokeLinecap="butt"
                size={['100%', 6]}
                className={`dashboard-stats-grid__bar ${tile.value === 0 ? 'dashboard-stats-grid__bar--empty' : ''}`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
