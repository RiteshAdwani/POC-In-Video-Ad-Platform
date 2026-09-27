import { Line } from '@ant-design/plots';
import { Card, Empty } from 'antd';
import type { DashboardSeriesPoint } from '../../../../types/dashboard.types';
import {
  VideoTrendMetric,
  VIDEO_TREND_METRIC_COLORS,
} from '../../../../constants/dashboard.constants';

type VideoTrendChartProps = {
  series: DashboardSeriesPoint[];
};

type TrendChartPoint = { day: string; value: number; metric: VideoTrendMetric };

/**
 * @description Plots plays and video completions as lines over the date range - the video-side
 * mirror of DashboardTrendChart's ad-side trend, reading the same per-day series the ad chart
 * already gets, just pivoted to the video-scoped fields instead.
 */
export const VideoTrendChart = ({ series }: VideoTrendChartProps) => {
  if (series.length === 0) {
    return (
      <Card title="Video engagement over time">
        <Empty description="No data in this range yet" />
      </Card>
    );
  }

  const data: TrendChartPoint[] = series.flatMap((point) => [
    { day: point.day, value: point.videoViews, metric: VideoTrendMetric.PLAYS },
    { day: point.day, value: point.videoCompletions, metric: VideoTrendMetric.VIDEO_COMPLETIONS },
  ]);

  return (
    <Card title="Video engagement over time">
      <Line
        data={data}
        xField="day"
        yField="value"
        colorField="metric"
        height={300}
        scale={{
          color: {
            domain: Object.keys(VIDEO_TREND_METRIC_COLORS),
            range: Object.values(VIDEO_TREND_METRIC_COLORS),
          },
        }}
        style={{ lineWidth: 2.5, shape: 'smooth' }}
        point={{ style: { r: 3 } }}
        axis={{ y: { labelFormatter: (value: number) => value.toLocaleString() } }}
        legend={{ color: { position: 'top' } }}
      />
    </Card>
  );
};
