import dayjs from 'dayjs';
import { Button, Empty, Flex, Tooltip, Typography } from 'antd';
import { VideoStatus } from '../../../../constants/video.constants';
import {
  DASHBOARD_DATE_FORMAT,
  PLACEMENT_STATS_WINDOW_DAYS,
} from '../../../../constants/dashboard.constants';
import { AdPlacementsList } from '../AdPlacementsList/AdPlacementsList';
import type { AdPlacement } from '../../../../types/adPlacement.types';
import './AdPlacementsSection.css';

const { Title } = Typography;

type AdPlacementsSectionProps = {
  adPlacements: AdPlacement[] | undefined;
  videoId: string;
  videoStatus: VideoStatus;
  onAdd: () => void;
  onEdit: (adPlacement: AdPlacement) => void;
  onDelete: (adPlacement: AdPlacement) => void;
};

/**
 * @description Video details page's ad placements section - a count/manage header plus either
 * the placements list or an empty state. Managing placements is disabled until the video is
 * READY, since a placement needs a playable video to preview against. Each row in the list also
 * gets its own performance line for a fixed trailing window - kept fixed rather than pickable, to
 * not duplicate VideoStatsWidget's own range control on the same page.
 */
export const AdPlacementsSection = ({
  adPlacements,
  videoId,
  videoStatus,
  onAdd,
  onEdit,
  onDelete,
}: AdPlacementsSectionProps) => {
  const endDate = dayjs().format(DASHBOARD_DATE_FORMAT);
  const startDate = dayjs()
    .subtract(PLACEMENT_STATS_WINDOW_DAYS - 1, 'day')
    .format(DASHBOARD_DATE_FORMAT);

  return (
    <div className="ad-placements-section">
      <Flex justify="space-between" align="center">
        <Title level={4}>Ad placements ({adPlacements?.length ?? 0})</Title>
        <Tooltip title="Manage ad placements">
          <Button disabled={videoStatus !== VideoStatus.READY} onClick={onAdd}>
            Manage ad placements
          </Button>
        </Tooltip>
      </Flex>

      {!adPlacements || adPlacements.length === 0 ? (
        <Empty description="No ad placements yet" />
      ) : (
        <AdPlacementsList
          adPlacements={adPlacements}
          videoId={videoId}
          startDate={startDate}
          endDate={endDate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};
