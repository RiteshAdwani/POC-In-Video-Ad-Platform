import { Pie } from '@ant-design/plots';
import { Card, Empty, Flex, Typography } from 'antd';
import type { DashboardStats } from '../../../../types/dashboard.types';
import {
  Outcome,
  OUTCOME_COLORS,
  OUTCOME_DOT_CLASS,
} from '../../../../constants/dashboard.constants';
import './DashboardOutcomeBreakdown.css';

const { Text } = Typography;

type DashboardOutcomeBreakdownProps = {
  stats: DashboardStats;
};

/**
 * @description Donut breakdown of what happens after an ad impression - Completed vs Skipped vs
 * no outcome recorded yet (impressions minus completions and skips; may include ads still playing,
 * not just abandonment). Clicks are shown separately since a click isn't mutually exclusive with
 * completing or skipping.
 */
export const DashboardOutcomeBreakdown = ({ stats }: DashboardOutcomeBreakdownProps) => {
  if (stats.impressions === 0) {
    return (
      <Card title="Ad outcomes">
        <Empty description="No impressions in this range yet" />
      </Card>
    );
  }

  const noOutcomeYet = Math.max(stats.impressions - stats.completions - stats.skips, 0);
  const slices: { outcome: Outcome; count: number }[] = [
    { outcome: Outcome.COMPLETED, count: stats.completions },
    { outcome: Outcome.SKIPPED, count: stats.skips },
    ...(noOutcomeYet > 0 ? [{ outcome: Outcome.NO_OUTCOME_YET, count: noOutcomeYet }] : []),
  ];

  return (
    <Card title="Ad outcomes">
      <Flex vertical align="center" gap={12}>
        <Pie
          data={slices}
          angleField="count"
          colorField="outcome"
          innerRadius={0.6}
          scale={{
            color: {
              domain: slices.map((slice) => slice.outcome),
              range: slices.map((slice) => OUTCOME_COLORS[slice.outcome]),
            },
          }}
          legend={false}
          height={200}
        />
        <Flex wrap justify="center" gap={16}>
          {slices.map((slice) => (
            <Flex align="center" gap={6} key={slice.outcome}>
              <span
                className={`dashboard-outcome-breakdown__dot ${OUTCOME_DOT_CLASS[slice.outcome]}`}
              />
              <Text>
                {slice.outcome} ({slice.count.toLocaleString()})
              </Text>
            </Flex>
          ))}
        </Flex>
        <Text type="secondary" className="dashboard-outcome-breakdown__caption">
          "No outcome yet" may include ads still playing, not only abandoned ones.
        </Text>
        <Text type="secondary" className="dashboard-outcome-breakdown__caption">
          {stats.clicks.toLocaleString()} clicks recorded during these impressions (not mutually
          exclusive with the above)
        </Text>
      </Flex>
    </Card>
  );
};
