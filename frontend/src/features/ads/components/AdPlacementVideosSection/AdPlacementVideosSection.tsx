import dayjs from 'dayjs';
import { Card, Empty, Spin, Typography } from 'antd';
import {
  DASHBOARD_DATE_FORMAT,
  PLACEMENT_STATS_WINDOW_DAYS,
} from '../../../../constants/dashboard.constants';
import { AdPlacementVideosList } from '../AdPlacementVideosList/AdPlacementVideosList';
import { useAdPlacementsByAdQuery } from '../../hooks/useAdPlacementsByAdQuery';
import { useInfiniteScrollTrigger } from '../../../../hooks/useInfiniteScrollTrigger';
import './AdPlacementVideosSection.css';

const { Text } = Typography;

type AdPlacementVideosSectionProps = {
  adId: string;
  isDeleted: boolean;
};

/**
 * @description Ad details page's "Placed on" section - the mirror of AdPlacementsSection: a card
 * whose body scrolls every video the ad is placed on (loading the next batch as its bottom comes
 * into view), with a "Showing N of M" footer - or an empty state. Each row's stats cover a fixed
 * trailing window.
 */
export const AdPlacementVideosSection = ({ adId, isDeleted }: AdPlacementVideosSectionProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdPlacementsByAdQuery(adId);
  const scrollTriggerRef = useInfiniteScrollTrigger(
    fetchNextPage,
    hasNextPage && !isFetchingNextPage,
  );
  const adPlacements = data?.adPlacements ?? [];
  const totalItems = data?.totalItems ?? 0;

  const endDate = dayjs().format(DASHBOARD_DATE_FORMAT);
  const startDate = dayjs()
    .subtract(PLACEMENT_STATS_WINDOW_DAYS - 1, 'day')
    .format(DASHBOARD_DATE_FORMAT);

  return (
    <Card
      size="small"
      title={
        <span>
          Placed on <Text type="secondary">· {totalItems}</Text>
        </span>
      }
      className="ad-placement-videos-section"
      classNames={{ body: 'ad-placement-videos-section__body' }}
    >
      {adPlacements.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={isDeleted ? 'Was never placed on a video' : 'Not placed on any video yet'}
          className="ad-placement-videos-section__empty"
        />
      ) : (
        <>
          <div className="ad-placement-videos-section__scroll">
            <AdPlacementVideosList items={adPlacements} startDate={startDate} endDate={endDate} />
            <div ref={scrollTriggerRef} className="ad-placement-videos-section__load-more">
              {isFetchingNextPage && <Spin />}
            </div>
          </div>
          <Text type="secondary" className="ad-placement-videos-section__footer">
            {hasNextPage
              ? `Showing ${adPlacements.length} of ${totalItems} · scroll for more`
              : `Showing all ${totalItems}`}
          </Text>
        </>
      )}
    </Card>
  );
};
