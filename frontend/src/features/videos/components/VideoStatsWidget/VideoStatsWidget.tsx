import { useState } from 'react';
import dayjs from 'dayjs';
import { Tiny } from '@ant-design/plots';
import { Card, Empty, Flex, Segmented, Typography } from 'antd';
import { CheckCircleOutlined, ExportOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useDashboardStatsQuery } from '../../../dashboard/hooks/useDashboardStatsQuery';
import {
  DASHBOARD_DATE_FORMAT,
  STATS_WIDGET_RANGE_OPTIONS,
} from '../../../../constants/dashboard.constants';
import { PageSpinner } from '../../../../components/PageSpinner/PageSpinner';
import './VideoStatsWidget.css';

const { Text } = Typography;

type VideoStatsWidgetProps = {
  videoId: string;
};

/**
 * @description This video's own engagement: plays, a trend sparkline, and a retention split
 * (finished vs left early) - scoped via useDashboardStatsQuery's existing videoId filter, no new
 * backend work. Deliberately video-only: per-ad numbers live inline on each AdPlacementsList row
 * instead of being blended in here, since one blended ad rate hides which specific ad is
 * under/over-performing. No week/month bucketing toggle - the backend only aggregates by day, so a
 * granularity switch here would claim a capability the API doesn't actually have.
 */
export const VideoStatsWidget = ({ videoId }: VideoStatsWidgetProps) => {
  const [rangeDays, setRangeDays] = useState(30);
  const endDate = dayjs().format(DASHBOARD_DATE_FORMAT);
  const startDate = dayjs()
    .subtract(rangeDays - 1, 'day')
    .format(DASHBOARD_DATE_FORMAT);
  const { data, isLoading } = useDashboardStatsQuery({ startDate, endDate, videoId });

  const rangeControl = (
    <Segmented
      size="small"
      options={STATS_WIDGET_RANGE_OPTIONS}
      value={rangeDays}
      onChange={(value) => setRangeDays(value as number)}
    />
  );

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!data || data.videoViews === 0) {
    return (
      <Card
        title="Video engagement"
        size="small"
        extra={rangeControl}
        className="video-stats-widget"
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="video-stats-widget__empty"
          description="No plays in this range yet"
        />
      </Card>
    );
  }

  const watchedThrough = data.videoCompletions;
  const leftEarly = data.videoViews - data.videoCompletions;
  const watchedThroughPct = data.videoCompletionRate * 100;

  const sparklineData = data.series.map((point, index) => ({ x: index, y: point.videoViews }));

  return (
    <Card title="Video engagement" size="small" extra={rangeControl} className="video-stats-widget">
      <Flex gap={24} wrap>
        <div className="video-stats-widget__tile">
          <div className="video-stats-widget__icon video-stats-widget__icon--plays">
            <PlayCircleOutlined />
          </div>
          <Text type="secondary" className="video-stats-widget__label">
            Plays
          </Text>
          <Text strong className="video-stats-widget__value">
            {data.videoViews.toLocaleString()}
          </Text>
          <div className="video-stats-widget__sparkline">
            <Tiny.Line data={sparklineData} xField="x" yField="y" height={32} color="#0369a1" />
          </div>
        </div>

        <div className="video-stats-widget__tile">
          <div className="video-stats-widget__icon video-stats-widget__icon--finished">
            <CheckCircleOutlined />
          </div>
          <Text type="secondary" className="video-stats-widget__label">
            Finished
          </Text>
          <Text strong className="video-stats-widget__value">
            {watchedThroughPct.toFixed(1)}%
          </Text>
          <Text type="secondary" className="video-stats-widget__caption">
            {watchedThrough.toLocaleString()} of {data.videoViews.toLocaleString()} plays
          </Text>
        </div>

        <div className="video-stats-widget__tile">
          <div className="video-stats-widget__icon video-stats-widget__icon--early">
            <ExportOutlined />
          </div>
          <Text type="secondary" className="video-stats-widget__label">
            Left early
          </Text>
          <Text strong className="video-stats-widget__value">
            {(100 - watchedThroughPct).toFixed(1)}%
          </Text>
          <Text type="secondary" className="video-stats-widget__caption">
            {leftEarly.toLocaleString()} of {data.videoViews.toLocaleString()} plays
          </Text>
        </div>
      </Flex>
    </Card>
  );
};
