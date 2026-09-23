import { Line } from '@ant-design/plots';
import { Card, Empty } from 'antd';
import type { DashboardSeriesPoint } from '../../../../types/dashboard.types';

type DashboardTrendChartProps = {
  series: DashboardSeriesPoint[];
};

type TrendChartPoint = { day: string; value: number; metric: 'Impressions' | 'Completions' };

/**
 * @description Plots impressions and completions as two lines over the date range. The chart
 * takes one row per (day, series) pair rather than one row per day with multiple value columns,
 * so the day-by-day series is reshaped into that long form here.
 */
export const DashboardTrendChart = ({ series }: DashboardTrendChartProps) => {
  if (series.length === 0) {
    return (
      <Card title="Ad impressions & completions over time">
        <Empty description="No data in this range yet" />
      </Card>
    );
  }

  const data: TrendChartPoint[] = series.flatMap((point) => [
    { day: point.day, value: point.impressions, metric: 'Impressions' },
    { day: point.day, value: point.completions, metric: 'Completions' },
  ]);

  return (
    <Card title="Ad impressions & completions over time">
      <Line
        data={data}
        xField="day"
        yField="value"
        colorField="metric"
        height={300}
        scale={{ color: { range: ['#0369A1', '#16A34A'] } }}
        style={{ lineWidth: 2.5, shape: 'smooth' }}
        point={{ style: { r: 3 } }}
        axis={{ y: { labelFormatter: (value: number) => value.toLocaleString() } }}
        legend={{ color: { position: 'top' } }}
      />
    </Card>
  );
};
