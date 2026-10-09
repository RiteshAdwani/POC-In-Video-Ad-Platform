import dayjs from 'dayjs';
import { Button, Card, Empty, Spin, Typography } from 'antd';
import { VideoStatus } from '../../../../constants/video.constants';
import {
  DASHBOARD_DATE_FORMAT,
  PLACEMENT_STATS_WINDOW_DAYS,
} from '../../../../constants/dashboard.constants';
import { AdPlacementsList } from '../AdPlacementsList/AdPlacementsList';
import type { AdPlacement } from '../../../../types/adPlacement.types';
import { useInfiniteScrollTrigger } from '../../../../hooks/useInfiniteScrollTrigger';
import './AdPlacementsSection.css';

const { Text } = Typography;

type AdPlacementsSectionProps = {
  adPlacements: AdPlacement[] | undefined;
  totalItems: number;
  // Loads the next batch as the list scrolls - straight from the infinite query.
  loadMore: { hasNextPage: boolean; isFetchingNextPage: boolean; fetchNextPage: () => void };
  videoId: string;
  videoStatus: VideoStatus;
  onAdd: () => void;
  onEdit: (adPlacement: AdPlacement) => void;
  onDelete: (adPlacement: AdPlacement) => void;
  readOnly?: boolean;
};

/**
 * @description Video details page's ad placements section - a card with a count/manage header
 * whose body scrolls the placements list (loading the next batch as its bottom comes into view),
 * with a "Showing N of M" footer - or an empty state. Managing placements is disabled until the video is
 * READY, since a placement needs a playable video to preview against. Each row in the list also
 * gets its own performance line for a fixed trailing window - kept fixed rather than pickable, to
 * not duplicate VideoStatsWidget's own range control on the same page. readOnly (a deleted video)
 * hides every management action.
 */
export const AdPlacementsSection = ({
  adPlacements,
  totalItems,
  loadMore: { hasNextPage, isFetchingNextPage, fetchNextPage },
  videoId,
  videoStatus,
  onAdd,
  onEdit,
  onDelete,
  readOnly = false,
}: AdPlacementsSectionProps) => {
  const endDate = dayjs().format(DASHBOARD_DATE_FORMAT);
  const startDate = dayjs()
    .subtract(PLACEMENT_STATS_WINDOW_DAYS - 1, 'day')
    .format(DASHBOARD_DATE_FORMAT);

  const scrollTriggerRef = useInfiniteScrollTrigger(
    fetchNextPage,
    hasNextPage && !isFetchingNextPage,
  );
  const loadedCount = adPlacements?.length ?? 0;

  return (
    <Card
      size="small"
      title={
        <span>
          Ad placements <Text type="secondary">· {totalItems}</Text>
        </span>
      }
      extra={
        !readOnly && (
          <Button size="small" disabled={videoStatus !== VideoStatus.READY} onClick={onAdd}>
            Manage ad placements
          </Button>
        )
      }
      className="ad-placements-section"
      classNames={{ body: 'ad-placements-section__body' }}
    >
      {loadedCount === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={readOnly ? 'No ad placements' : 'No ad placements yet'}
          className="ad-placements-section__empty"
        />
      ) : (
        <>
          <div className="ad-placements-section__scroll">
            <AdPlacementsList
              adPlacements={adPlacements!}
              videoId={videoId}
              startDate={startDate}
              endDate={endDate}
              onEdit={onEdit}
              onDelete={onDelete}
              readOnly={readOnly}
            />
            <div ref={scrollTriggerRef} className="ad-placements-section__load-more">
              {isFetchingNextPage && <Spin />}
            </div>
          </div>
          <Text type="secondary" className="ad-placements-section__footer">
            {hasNextPage
              ? `Showing ${loadedCount} of ${totalItems} · scroll for more`
              : `Showing all ${totalItems}`}
          </Text>
        </>
      )}
    </Card>
  );
};
