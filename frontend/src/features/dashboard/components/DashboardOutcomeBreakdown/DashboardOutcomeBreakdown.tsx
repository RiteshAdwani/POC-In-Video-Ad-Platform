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
 * not just abandonment). CTR is overlaid in the donut's own hollow center rather than drawn as a
 * slice, since a click isn't mutually exclusive with completing or skipping - it doesn't partition
 * the ring the way the other three do, so it can't honestly be one of its wedges.
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
        <div className="dashboard-outcome-breakdown__chart">
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
            tooltip={{
              items: [
                (datum: { outcome: Outcome; count: number }) => ({
                  name: datum.outcome,
                  value: datum.count.toLocaleString(),
                }),
              ],
            }}
          />
          <div className="dashboard-outcome-breakdown__center">
            <Text strong className="dashboard-outcome-breakdown__center-value">
              {(stats.ctr * 100).toFixed(1)}%
            </Text>
            <Text type="secondary" className="dashboard-outcome-breakdown__center-label">
              CTR
            </Text>
          </div>
        </div>
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
        {noOutcomeYet > 0 && (
          <Text type="secondary" className="dashboard-outcome-breakdown__caption">
            "No outcome yet" may include ads still playing, not only abandoned ones.
          </Text>
        )}
        <Text type="secondary" className="dashboard-outcome-breakdown__caption">
          <Text strong className="dashboard-outcome-breakdown__caption-value">
            {stats.clicks.toLocaleString()}
          </Text>{' '}
          clicks recorded - not exclusive with completing or skipping above.
        </Text>
      </Flex>
    </Card>
  );
};
