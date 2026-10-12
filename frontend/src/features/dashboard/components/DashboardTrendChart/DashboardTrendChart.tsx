import { Line } from '@ant-design/plots';
import { Card, Empty } from 'antd';
import type { DashboardSeriesPoint } from '../../../../types/dashboard.types';
import {
  AdTrendMetric,
  AD_TREND_METRIC_COLORS,
  CHART_THEME,
  TREND_CHART_AXIS,
  TREND_CHART_HEIGHT,
} from '../../../../constants/dashboard.constants';
import { useThemeMode } from '../../../theme/hooks/useThemeMode';

type DashboardTrendChartProps = {
  series: DashboardSeriesPoint[];
};

type TrendChartPoint = { day: string; value: number; metric: AdTrendMetric };

/**
 * @description Plots all four ad-performance metrics (impressions, completions, skips, clicks) as
 * lines over the date range - the same counts as DashboardStatsGrid's tiles above it, just shown
 * as a trend instead of a range-wide total. The chart takes one row per (day, series) pair rather
 * than one row per day with multiple value columns, so the day-by-day series is reshaped into that
 * long form here.
 */
export const DashboardTrendChart = ({ series }: DashboardTrendChartProps) => {
  const { mode } = useThemeMode();
  const colors = AD_TREND_METRIC_COLORS[mode];

  if (series.length === 0) {
    return (
      <Card title="Ad performance over time">
        <Empty description="No data in this range yet" />
      </Card>
    );
  }

  const data: TrendChartPoint[] = series.flatMap((point) => [
    { day: point.day, value: point.impressions, metric: AdTrendMetric.IMPRESSIONS },
    { day: point.day, value: point.completions, metric: AdTrendMetric.COMPLETIONS },
    { day: point.day, value: point.skips, metric: AdTrendMetric.SKIPS },
    { day: point.day, value: point.clicks, metric: AdTrendMetric.CLICKS },
  ]);

  return (
    <Card title="Ad performance over time">
      <Line
        data={data}
        xField="day"
        yField="value"
        colorField="metric"
        height={TREND_CHART_HEIGHT}
        theme={CHART_THEME[mode]}
        scale={{
          color: {
            domain: Object.keys(colors),
            range: Object.values(colors),
          },
        }}
        style={{ lineWidth: 2.5, shape: 'smooth' }}
        point={{ style: { r: 3 } }}
        axis={TREND_CHART_AXIS}
        legend={{ color: { position: 'top' } }}
      />
    </Card>
  );
};
