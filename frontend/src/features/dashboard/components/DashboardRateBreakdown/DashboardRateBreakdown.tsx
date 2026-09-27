import type { ReactNode } from 'react';
import { AimOutlined, PercentageOutlined, StepForwardOutlined } from '@ant-design/icons';
import { Card, Empty, Flex, Typography } from 'antd';
import type { DashboardStats } from '../../../../types/dashboard.types';
import './DashboardRateBreakdown.css';

const { Text } = Typography;

type DashboardRateBreakdownProps = {
  stats: DashboardStats;
};

type RateMetric = {
  label: string;
  value: number;
  numerator: number;
  icon: ReactNode;
  className: string;
  explainer: string;
};

/**
 * @description Ranks completion rate, skip rate, and CTR by size, largest first - adapted from
 * Instagram's "What impacts your views" panel. Sorts by raw magnitude only, not real impact on
 * reach, since this app has no equivalent signal to compute the latter. Each rate is captioned
 * with its "N of M impressions" breakdown and a plain-English line on what's being counted, rather
 * than showing a bare percentage.
 */
export const DashboardRateBreakdown = ({ stats }: DashboardRateBreakdownProps) => {
  if (stats.impressions === 0) {
    return (
      <Card title="Ad rate breakdown">
        <Empty description="No impressions in this range yet" />
      </Card>
    );
  }

  const metrics: RateMetric[] = [
    {
      label: 'Completion rate',
      value: stats.completionRate,
      numerator: stats.completions,
      icon: <PercentageOutlined />,
      className: 'dashboard-rate-breakdown__icon--success',
      explainer: 'An ad counts as complete when it plays through without being skipped.',
    },
    {
      label: 'Skip rate',
      value: stats.skipRate,
      numerator: stats.skips,
      icon: <StepForwardOutlined />,
      className: 'dashboard-rate-breakdown__icon--warning',
      explainer: 'An ad counts as skipped when the viewer skips it before it finishes.',
    },
    {
      label: 'Click-through rate',
      value: stats.ctr,
      numerator: stats.clicks,
      icon: <AimOutlined />,
      className: 'dashboard-rate-breakdown__icon--accent',
      explainer: 'A click is counted when the viewer clicks through on an ad.',
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
              <Flex vertical gap={0}>
                <Text strong className="dashboard-rate-breakdown__label">
                  {metric.label}
                </Text>
                <Text type="secondary" className="dashboard-rate-breakdown__explainer">
                  {metric.explainer}
                </Text>
              </Flex>
            </Flex>
            <Flex vertical align="flex-end" gap={0} className="dashboard-rate-breakdown__value">
              <Text strong className="dashboard-rate-breakdown__percent">
                {(metric.value * 100).toFixed(1)}%
              </Text>
              <Text type="secondary" className="dashboard-rate-breakdown__count">
                {metric.numerator.toLocaleString()} of {stats.impressions.toLocaleString()}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
};
