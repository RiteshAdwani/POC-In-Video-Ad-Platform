import { Button, Empty, Flex, Tooltip, Typography } from 'antd';
import { VideoStatus } from '../../../../constants/video.constants';
import { AdPlacementsList } from '../AdPlacementsList/AdPlacementsList';
import type { AdPlacement } from '../../../../types/adPlacement.types';
import './AdPlacementsSection.css';

const { Title } = Typography;

type AdPlacementsSectionProps = {
  adPlacements: AdPlacement[] | undefined;
  videoStatus: VideoStatus;
  onAdd: () => void;
  onEdit: (adPlacement: AdPlacement) => void;
  onDelete: (adPlacement: AdPlacement) => void;
};

/**
 * @description Video details page's ad placements section - a count/manage header plus either
 * the placements list or an empty state. Managing placements is disabled until the video is
 * READY, since a placement needs a playable video to preview against.
 */
export const AdPlacementsSection = ({
  adPlacements,
  videoStatus,
  onAdd,
  onEdit,
  onDelete,
}: AdPlacementsSectionProps) => (
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
      <AdPlacementsList adPlacements={adPlacements} onEdit={onEdit} onDelete={onDelete} />
    )}
  </div>
);
