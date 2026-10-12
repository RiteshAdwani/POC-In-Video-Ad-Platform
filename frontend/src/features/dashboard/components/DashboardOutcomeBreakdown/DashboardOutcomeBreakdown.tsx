import { Card, Empty, Progress, Typography } from 'antd';
import {
  AD_TREND_METRIC_COLORS,
  AdTrendMetric,
  Outcome,
} from '../../../../constants/dashboard.constants';
import { useThemeMode } from '../../../theme/hooks/useThemeMode';
import { formatPercent } from '../../../../lib/formatPercent';
import type { DashboardStats } from '../../../../types/dashboard.types';
import './DashboardOutcomeBreakdown.css';

const { Text } = Typography;

type DashboardOutcomeBreakdownProps = {
  stats: DashboardStats;
};

/**
 * @description How each ad impression ended - watched to the end, skipped, or no outcome yet
 * (which can include ads still playing) - plus click-through, shown apart since a click can
 * happen alongside either outcome.
 */
export const DashboardOutcomeBreakdown = ({ stats }: DashboardOutcomeBreakdownProps) => {
  const { mode } = useThemeMode();
  const colors = AD_TREND_METRIC_COLORS[mode];

  if (stats.impressions === 0) {
    return (
      <Card title="How ads ended" className="dashboard-outcome-breakdown">
        <Empty description="No impressions in this range yet" />
      </Card>
    );
  }

  const noOutcomeYet = Math.max(stats.impressions - stats.completions - stats.skips, 0);
  const rows = [
    { outcome: Outcome.COMPLETED, count: stats.completions, modifier: 'completed' },
    { outcome: Outcome.SKIPPED, count: stats.skips, modifier: 'skipped' },
    { outcome: Outcome.NO_OUTCOME_YET, count: noOutcomeYet, modifier: 'pending' },
  ];

  return (
    <Card
      title="How ads ended"
      extra={
        <Text type="secondary">
          {stats.impressions.toLocaleString()} {stats.impressions === 1 ? 'ad' : 'ads'}
        </Text>
      }
      className="dashboard-outcome-breakdown"
    >
      {/* Completed shows as the "success" segment, skipped as the rest of the fill, and the
          empty rail is what has no outcome yet. */}
      <Progress
        percent={((stats.completions + stats.skips) / stats.impressions) * 100}
        success={{
          percent: stats.completionRate * 100,
          strokeColor: colors[AdTrendMetric.COMPLETIONS],
        }}
        strokeColor={colors[AdTrendMetric.SKIPS]}
        showInfo={false}
        size={['100%', 12]}
        className="dashboard-outcome-breakdown__bar"
      />

      <ul className="dashboard-outcome-breakdown__rows">
        {rows.map((row) => (
          <li key={row.outcome}>
            <span
              className={`dashboard-outcome-breakdown__swatch dashboard-outcome-breakdown__swatch--${row.modifier}`}
            />
            {row.outcome}
            <strong>{row.count.toLocaleString()}</strong>
            <span className="dashboard-outcome-breakdown__share">
              {formatPercent(row.count / stats.impressions)}
            </span>
          </li>
        ))}
      </ul>

      <div className="dashboard-outcome-breakdown__ctr">
        <div className="dashboard-outcome-breakdown__ctr-head">
          <span>Click-through rate</span>
          <strong>{formatPercent(stats.ctr)}</strong>
        </div>
        <Progress
          percent={stats.ctr * 100}
          strokeColor={colors[AdTrendMetric.IMPRESSIONS]}
          showInfo={false}
          size={['100%', 8]}
          className="dashboard-outcome-breakdown__bar"
        />
        <Text type="secondary" className="dashboard-outcome-breakdown__note">
          {stats.clicks.toLocaleString()} clicks from {stats.impressions.toLocaleString()}{' '}
          impressions
        </Text>
      </div>
    </Card>
  );
};
