import type { ReactNode } from 'react';
import { AimOutlined, PercentageOutlined, StepForwardOutlined } from '@ant-design/icons';
import { Card, Empty, Flex, Typography } from 'antd';
import type { DashboardStats } from '../../../../types/dashboard.types';
import './DashboardRateBreakdown.css';

const { Text } = Typography;

type DashboardRateBreakdownProps = {
  stats: DashboardStats;
};

type RateMetric = { label: string; value: number; icon: ReactNode; className: string };

/**
 * @description Ranks completion rate, skip rate, and CTR by size, largest first - adapted from
 * Instagram's "What impacts your views" panel. Sorts by raw magnitude only, not real impact on
 * reach, since this app has no equivalent signal to compute the latter.
 */
export const DashboardRateBreakdown = ({ stats }: DashboardRateBreakdownProps) => {
  if (stats.impressions === 0) {
    return (
      <Card title="Ad rate breakdown">
        <Empty description="No impressions in this range yet" />
      </Card>
    );
  }

  const skipRate = stats.skips / stats.impressions;

  const metrics: RateMetric[] = [
    {
      label: 'Completion rate',
      value: stats.completionRate,
      icon: <PercentageOutlined />,
      className: 'dashboard-rate-breakdown__icon--primary',
    },
    {
      label: 'Skip rate',
      value: skipRate,
      icon: <StepForwardOutlined />,
      className: 'dashboard-rate-breakdown__icon--success',
    },
    {
      label: 'Click-through rate',
      value: stats.ctr,
      icon: <AimOutlined />,
      className: 'dashboard-rate-breakdown__icon--primary',
    },
  ].sort((a, b) => b.value - a.value);

  return (
    <Card title="Ad rate breakdown">
      <Flex vertical gap={16}>
        {metrics.map((metric) => (
          <Flex align="center" justify="space-between" key={metric.label}>
            <Flex align="center" gap={12}>
              <div className={`dashboard-rate-breakdown__icon ${metric.className}`}>
                {metric.icon}
              </div>
              <Text>{metric.label}</Text>
            </Flex>
            <Text strong>{(metric.value * 100).toFixed(1)}%</Text>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
};
