import { Typography } from 'antd';
import { useDashboardStatsQuery } from '../../features/dashboard/hooks/useDashboardStatsQuery';
import './AdPlacementRowStat.css';

const { Text } = Typography;

type AdPlacementRowStatProps = {
  videoId: string;
  adPlacementId: string;
  startDate: string;
  endDate: string;
};

/**
 * @description One placement's own impressions/completion rate for the shared window above it -
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
      <Text type="secondary" className="ad-placement-row-stat">
        No impressions yet
      </Text>
    );
  }

  return (
    <Text type="secondary" className="ad-placement-row-stat">
      {data.impressions.toLocaleString()} impressions · {(data.completionRate * 100).toFixed(1)}%
      completion
    </Text>
  );
};
