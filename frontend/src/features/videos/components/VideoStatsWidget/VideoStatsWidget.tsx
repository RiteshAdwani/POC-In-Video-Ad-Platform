import { useState } from 'react';
import dayjs from 'dayjs';
import { Card, Empty, Segmented } from 'antd';
import { useDashboardStatsQuery } from '../../../dashboard/hooks/useDashboardStatsQuery';
import {
  DASHBOARD_DATE_FORMAT,
  STATS_WIDGET_RANGE_OPTIONS,
  VIDEO_TREND_METRIC_COLORS,
  VideoTrendMetric,
} from '../../../../constants/dashboard.constants';
import { useThemeMode } from '../../../theme/hooks/useThemeMode';
import { formatPercent } from '../../../../lib/formatPercent';
import { StatTile } from '../../../../components/StatTile/StatTile';
import { StatMarker, StatMetric } from '../../../../components/StatTile/StatTile.constants';
import './VideoStatsWidget.css';

type VideoStatsWidgetProps = {
  videoId: string;
};

/**
 * @description This video's own engagement - plays with their daily trend, and how many of them
 * finished or left early -
 * scoped via useDashboardStatsQuery's videoId filter. Per-ad numbers live on each AdPlacementsList
 * row instead, so one blended ad rate never hides which specific ad is under-performing.
 */
export const VideoStatsWidget = ({ videoId }: VideoStatsWidgetProps) => {
  const [rangeDays, setRangeDays] = useState(30);
  const endDate = dayjs().format(DASHBOARD_DATE_FORMAT);
  const startDate = dayjs()
    .subtract(rangeDays - 1, 'day')
    .format(DASHBOARD_DATE_FORMAT);
  const { data, isLoading } = useDashboardStatsQuery({ startDate, endDate, videoId });
  const { mode } = useThemeMode();

  const plays = data?.videoViews ?? 0;
  const finished = data?.videoCompletions ?? 0;
  const finishedRate = data?.videoCompletionRate ?? 0;

  return (
    <Card
      title="Video engagement"
      extra={
        <Segmented
          options={STATS_WIDGET_RANGE_OPTIONS}
          value={rangeDays}
          onChange={(value) => setRangeDays(value as number)}
        />
      }
      loading={isLoading}
      classNames={{ body: 'video-stats-widget__body' }}
    >
      {!data || plays === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="video-stats-widget__empty"
          description="No plays in this range yet"
        />
      ) : (
        <div className="video-stats-widget__tiles">
          <StatTile
            label="Plays"
            metric={StatMetric.PLAYS}
            marker={StatMarker.DOT}
            value={plays.toLocaleString()}
            caption={`in the last ${rangeDays} days`}
            trend={{
              values: data.series.map((point) => point.videoViews),
              color: VIDEO_TREND_METRIC_COLORS[mode][VideoTrendMetric.PLAYS],
            }}
          />
          <StatTile
            label="Finished"
            metric={StatMetric.VIDEO_COMPLETIONS}
            marker={StatMarker.DOT}
            value={formatPercent(finishedRate)}
            caption={`${finished.toLocaleString()} of ${plays.toLocaleString()} plays`}
            ratio={finishedRate}
          />
          <StatTile
            label="Left early"
            metric={StatMetric.SKIPS}
            marker={StatMarker.DOT}
            value={formatPercent(1 - finishedRate)}
            caption={`${(plays - finished).toLocaleString()} of ${plays.toLocaleString()} plays`}
            ratio={1 - finishedRate}
          />
        </div>
      )}
    </Card>
  );
};
