import { useState } from 'react';
import dayjs from 'dayjs';
import { Card, Empty, Segmented } from 'antd';
import { useDashboardStatsQuery } from '../../../dashboard/hooks/useDashboardStatsQuery';
import {
  AD_TREND_METRIC_COLORS,
  AdTrendMetric,
  DASHBOARD_DATE_FORMAT,
  STATS_WIDGET_RANGE_OPTIONS,
} from '../../../../constants/dashboard.constants';
import { useThemeMode } from '../../../theme/hooks/useThemeMode';
import { formatPercent } from '../../../../lib/formatPercent';
import { StatTile } from '../../../../components/StatTile/StatTile';
import { StatMarker, StatMetric } from '../../../../components/StatTile/StatTile.constants';
import './AdStatsWidget.css';

type AdStatsWidgetProps = {
  advertisementId: string;
};

/**
 * @description This ad's own performance, summed across every video it's placed on - scoped via
 * useDashboardStatsQuery's advertisementId filter. Per-placement numbers live on each
 * AdPlacementVideosList row instead, mirroring VideoStatsWidget's own video/per-ad split.
 */
export const AdStatsWidget = ({ advertisementId }: AdStatsWidgetProps) => {
  const [rangeDays, setRangeDays] = useState(30);
  const endDate = dayjs().format(DASHBOARD_DATE_FORMAT);
  const startDate = dayjs()
    .subtract(rangeDays - 1, 'day')
    .format(DASHBOARD_DATE_FORMAT);
  const { data, isLoading } = useDashboardStatsQuery({ startDate, endDate, advertisementId });
  const { mode } = useThemeMode();

  return (
    <Card
      title="Ad performance"
      extra={
        <Segmented
          options={STATS_WIDGET_RANGE_OPTIONS}
          value={rangeDays}
          onChange={(value) => setRangeDays(value as number)}
        />
      }
      loading={isLoading}
      classNames={{ body: 'ad-stats-widget__body' }}
    >
      {!data || data.impressions === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="ad-stats-widget__empty"
          description="No impressions in this range yet"
        />
      ) : (
        <div className="ad-stats-widget__tiles">
          <StatTile
            label="Impressions"
            metric={StatMetric.IMPRESSIONS}
            marker={StatMarker.DIAMOND}
            value={data.impressions.toLocaleString()}
            caption={`in the last ${rangeDays} days`}
            trend={{
              values: data.series.map((point) => point.impressions),
              color: AD_TREND_METRIC_COLORS[mode][AdTrendMetric.IMPRESSIONS],
            }}
          />
          <StatTile
            label="Completions"
            metric={StatMetric.COMPLETIONS}
            marker={StatMarker.DIAMOND}
            value={data.completions.toLocaleString()}
            caption={`${formatPercent(data.completionRate)} watched to the end`}
            ratio={data.completionRate}
          />
          <StatTile
            label="Skips"
            metric={StatMetric.SKIPS}
            marker={StatMarker.DIAMOND}
            value={data.skips.toLocaleString()}
            caption={`${formatPercent(data.skipRate)} skipped`}
            ratio={data.skipRate}
          />
          <StatTile
            label="Clicks"
            metric={StatMetric.CLICKS}
            marker={StatMarker.DIAMOND}
            value={data.clicks.toLocaleString()}
            caption={`${formatPercent(data.ctr)} click-through`}
            ratio={data.ctr}
          />
        </div>
      )}
    </Card>
  );
};
