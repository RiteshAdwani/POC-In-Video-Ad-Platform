import { Progress, Typography } from 'antd';
import { useDashboardStatsQuery } from '../../features/dashboard/hooks/useDashboardStatsQuery';
import { formatPercent } from '../../lib/formatPercent';
import './AdPlacementRowStat.css';

const { Text } = Typography;

type AdPlacementRowStatProps = {
  videoId: string;
  adPlacementId: string;
  startDate: string;
  endDate: string;
};

/**
 * @description One placement's own impressions and completion rate (with a bar in the completions
 * colour) for the shared window above it -
 * scoped via useDashboardStatsQuery's existing adPlacementId filter. Lets an admin spot which
 * specific ad on this video is under/over-performing, instead of only ever seeing one rate blended
 * across every ad on the video. Shared by AdPlacementsList (a video's own ads) and
 * AdPlacementVideosList (an ad's own videos) - the two mirror-image placement lists.
 */
export const AdPlacementRowStat = ({
  videoId,
  adPlacementId,
  startDate,
  endDate,
}: AdPlacementRowStatProps) => {
  const { data, isLoading } = useDashboardStatsQuery({
    startDate,
    endDate,
    videoId,
    adPlacementId,
  });

  if (isLoading || !data) {
    return null;
  }

  if (data.impressions === 0) {
    return (
      <Text type="secondary" className="ad-placement-row-stat__empty">
        No impressions yet
      </Text>
    );
  }

  return (
    <div className="ad-placement-row-stat">
      <Text type="secondary">
        <Text strong>{data.impressions.toLocaleString()}</Text> impressions ·{' '}
        <Text strong>{formatPercent(data.completionRate)}</Text> completed
      </Text>
      <Progress
        percent={data.completionRate * 100}
        strokeColor="var(--fc-metric-completions)"
        railColor="var(--fc-track)"
        showInfo={false}
        size={[160, 5]}
        className="ad-placement-row-stat__bar"
      />
    </div>
  );
};
