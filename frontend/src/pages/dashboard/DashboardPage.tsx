import { Flex, Result, Typography } from 'antd';
import { PageSpinner } from '../../components/PageSpinner/PageSpinner';
import { DashboardSection } from '../../constants/dashboard.constants';
import { useDashboardStatsQuery } from '../../features/dashboard/hooks/useDashboardStatsQuery';
import { useDashboardDateRange } from '../../features/dashboard/hooks/useDashboardDateRange';
import { DashboardFilters } from '../../features/dashboard/components/DashboardFilters/DashboardFilters';
import { DashboardStatsGrid } from '../../features/dashboard/components/DashboardStatsGrid/DashboardStatsGrid';
import { DashboardTrendChart } from '../../features/dashboard/components/DashboardTrendChart/DashboardTrendChart';
import { VideoTrendChart } from '../../features/dashboard/components/VideoTrendChart/VideoTrendChart';
import { DashboardSectionHeader } from '../../features/dashboard/components/DashboardSectionHeader/DashboardSectionHeader';
import { DashboardOutcomeBreakdown } from '../../features/dashboard/components/DashboardOutcomeBreakdown/DashboardOutcomeBreakdown';
import './DashboardPage.css';

const { Title, Text } = Typography;

/**
 * @description Admin dashboard for a chosen date range, scoped to the signed-in admin's own
 * videos - an Ads section (counts, trend, how ads ended) and a Videos section (plays, trend).
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
        <DashboardSectionHeader section={DashboardSection.ADS} />
        <DashboardStatsGrid
          section={DashboardSection.ADS}
          stats={data}
          deleted={data.deletedContribution}
        />
        <div className="dashboard-page__row dashboard-page__row--ads">
          <DashboardTrendChart series={data.series} />
          <DashboardOutcomeBreakdown stats={data} />
        </div>

        <DashboardSectionHeader section={DashboardSection.VIDEOS} />
        <div className="dashboard-page__row dashboard-page__row--videos">
          <DashboardStatsGrid
            section={DashboardSection.VIDEOS}
            stats={data}
            deleted={data.deletedContribution}
          />
          <VideoTrendChart series={data.series} />
        </div>
      </>
    );
  }

  return (
    <div className="dashboard-page">
      <Flex justify="space-between" align="flex-end" gap={24} className="dashboard-page__header">
        <Flex vertical gap={6}>
          <Title level={2} className="dashboard-page__title">
            Dashboard
          </Title>
          <Text type="secondary">How your ads and videos performed</Text>
        </Flex>
        <DashboardFilters range={range} onRangeChange={onRangeChange} />
      </Flex>

      {content}
    </div>
  );
};
