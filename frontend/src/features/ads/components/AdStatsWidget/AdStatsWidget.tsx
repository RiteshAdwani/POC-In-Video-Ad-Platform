import { useState } from 'react';
import dayjs from 'dayjs';
import { Tiny } from '@ant-design/plots';
import { Card, Empty, Flex, Segmented, Typography } from 'antd';
import {
  AimOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  StepForwardOutlined,
} from '@ant-design/icons';
import { useDashboardStatsQuery } from '../../../dashboard/hooks/useDashboardStatsQuery';
import {
  DASHBOARD_DATE_FORMAT,
  STATS_WIDGET_RANGE_OPTIONS,
} from '../../../../constants/dashboard.constants';
import { PageSpinner } from '../../../../components/PageSpinner/PageSpinner';
import './AdStatsWidget.css';

const { Text } = Typography;

type AdStatsWidgetProps = {
  advertisementId: string;
};

/**
 * @description This ad's own performance, summed across every video/placement it's on - scoped
 * via useDashboardStatsQuery's advertisementId filter (backend sums across all of the ad's
 * placements, since one ad can be placed on many videos and there's no single "the" placement to
 * pick). Per-placement numbers live inline on each AdPlacementVideosList row instead, mirroring
 * VideoStatsWidget's own video/per-ad split.
 */
export const AdStatsWidget = ({ advertisementId }: AdStatsWidgetProps) => {
  const [rangeDays, setRangeDays] = useState(30);
  const endDate = dayjs().format(DASHBOARD_DATE_FORMAT);
  const startDate = dayjs()
    .subtract(rangeDays - 1, 'day')
    .format(DASHBOARD_DATE_FORMAT);
  const { data, isLoading } = useDashboardStatsQuery({ startDate, endDate, advertisementId });

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

  if (!data || data.impressions === 0) {
    return (
      <Card title="Ad performance" extra={rangeControl} className="ad-stats-widget">
        <Empty description="No impressions in this range yet" />
      </Card>
    );
  }

  const sparklineData = data.series.map((point, index) => ({ x: index, y: point.impressions }));

  return (
    <Card title="Ad performance" extra={rangeControl} className="ad-stats-widget">
      <Flex gap={24} wrap>
        <div className="ad-stats-widget__tile">
          <div className="ad-stats-widget__icon ad-stats-widget__icon--impressions">
            <EyeOutlined />
          </div>
          <Text type="secondary" className="ad-stats-widget__label">
            Impressions
          </Text>
          <Text strong className="ad-stats-widget__value">
            {data.impressions.toLocaleString()}
          </Text>
          <div className="ad-stats-widget__sparkline">
            <Tiny.Line data={sparklineData} xField="x" yField="y" height={32} color="#0369a1" />
          </div>
        </div>

        <div className="ad-stats-widget__tile">
          <div className="ad-stats-widget__icon ad-stats-widget__icon--completion">
            <CheckCircleOutlined />
          </div>
          <Text type="secondary" className="ad-stats-widget__label">
            Completion rate
          </Text>
          <Text strong className="ad-stats-widget__value">
            {(data.completionRate * 100).toFixed(1)}%
          </Text>
          <Text type="secondary" className="ad-stats-widget__caption">
            {data.completions.toLocaleString()} of {data.impressions.toLocaleString()} impressions
          </Text>
        </div>

        <div className="ad-stats-widget__tile">
          <div className="ad-stats-widget__icon ad-stats-widget__icon--skip">
            <StepForwardOutlined />
          </div>
          <Text type="secondary" className="ad-stats-widget__label">
            Skip rate
          </Text>
          <Text strong className="ad-stats-widget__value">
            {(data.skipRate * 100).toFixed(1)}%
          </Text>
          <Text type="secondary" className="ad-stats-widget__caption">
            {data.skips.toLocaleString()} of {data.impressions.toLocaleString()} impressions
          </Text>
        </div>

        <div className="ad-stats-widget__tile">
          <div className="ad-stats-widget__icon ad-stats-widget__icon--ctr">
            <AimOutlined />
          </div>
          <Text type="secondary" className="ad-stats-widget__label">
            Click-through rate
          </Text>
          <Text strong className="ad-stats-widget__value">
            {(data.ctr * 100).toFixed(1)}%
          </Text>
          <Text type="secondary" className="ad-stats-widget__caption">
            {data.clicks.toLocaleString()} of {data.impressions.toLocaleString()} impressions
          </Text>
        </div>
      </Flex>
    </Card>
  );
};
