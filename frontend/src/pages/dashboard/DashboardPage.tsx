import { Col, Flex, Result, Row, Typography } from 'antd';
import { PageSpinner } from '../../components/PageSpinner/PageSpinner';
import { useDashboardStatsQuery } from '../../features/dashboard/hooks/useDashboardStatsQuery';
import { useDashboardDateRange } from '../../features/dashboard/hooks/useDashboardDateRange';
import { DashboardFilters } from '../../features/dashboard/components/DashboardFilters/DashboardFilters';
import { DashboardStatsGrid } from '../../features/dashboard/components/DashboardStatsGrid/DashboardStatsGrid';
import { DashboardTrendChart } from '../../features/dashboard/components/DashboardTrendChart/DashboardTrendChart';
import { DashboardOutcomeBreakdown } from '../../features/dashboard/components/DashboardOutcomeBreakdown/DashboardOutcomeBreakdown';
import { DashboardRateBreakdown } from '../../features/dashboard/components/DashboardRateBreakdown/DashboardRateBreakdown';
import './DashboardPage.css';

const { Title, Text } = Typography;

/**
 * @description Admin dashboard - impressions/completion-rate/CTR totals and a trend chart for a
 * chosen date range, scoped to the signed-in admin's own videos.
 */
export const DashboardPage = () => {
  const { range, onRangeChange, startDate, endDate } = useDashboardDateRange();
  const { data, isLoading, isError } = useDashboardStatsQuery({ startDate, endDate });

  let content;
  if (isLoading) {
    content = <PageSpinner />;
  } else if (isError || !data) {
    content = (
      <Result
        status="error"
        title="Couldn't load dashboard stats"
        subTitle="Please try again shortly."
      />
    );
  } else {
    content = (
      <>
        <DashboardStatsGrid stats={data} />
        <DashboardTrendChart series={data.series} />
        <Row gutter={[16, 16]} className="dashboard-page__insights-row">
          <Col xs={24} lg={12}>
            <DashboardRateBreakdown stats={data} />
          </Col>
          <Col xs={24} lg={12}>
            <DashboardOutcomeBreakdown stats={data} />
          </Col>
        </Row>
      </>
    );
  }

  return (
    <div className="dashboard-page">
      <Flex justify="space-between" align="flex-start" className="dashboard-page__header">
        <Flex vertical gap={4}>
          <Title level={2}>Dashboard</Title>
          <Text type="secondary">
            Impressions, completions, and click-through across your videos.
          </Text>
        </Flex>
        <DashboardFilters range={range} onRangeChange={onRangeChange} />
      </Flex>

      {content}
    </div>
  );
};
