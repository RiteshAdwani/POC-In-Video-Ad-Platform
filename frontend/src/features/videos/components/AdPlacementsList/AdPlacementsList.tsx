import { Button, Tooltip, Typography } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { AdType, AD_TYPE_LABEL } from '../../../../constants/ad.constants';
import { formatDuration } from '../../../../lib/formatDuration';
import { formatDurationOrSkip } from '../../../../lib/formatDurationOrSkip';
import type { AdPlacement } from '../../../../types/adPlacement.types';
import './AdPlacementsList.css';

const { Text } = Typography;

type AdPlacementsListProps = {
  adPlacements: AdPlacement[];
  onEdit: (adPlacement: AdPlacement) => void;
  onDelete: (adPlacement: AdPlacement) => void;
};

/**
 * @description Row-per-placement list, thumbnail-and-metadata style (like a video search
 * result) - a colored tile standing in for a real ad creative, with the start offset overlaid
 * the way a video thumbnail shows its own duration.
 */
export const AdPlacementsList = ({ adPlacements, onEdit, onDelete }: AdPlacementsListProps) => (
  <div className="ad-placements-list">
    {adPlacements.map((adPlacement) => (
      <div className="ad-placements-list__row" key={adPlacement.id}>
        <div className="ad-placements-list__thumb" data-ad-type={adPlacement.adType}>
          {adPlacement.adType === AdType.BANNER_OVERLAY ? (
            <PictureOutlined />
          ) : (
            <PlayCircleOutlined />
          )}
          <span className="ad-placements-list__offset">
            {formatDuration(adPlacement.startOffsetSeconds)}
          </span>
        </div>

        <div className="ad-placements-list__info">
          <Text strong ellipsis className="ad-placements-list__title">
            {adPlacement.advertisement.title}
          </Text>
          <Text type="secondary" className="ad-placements-list__meta">
            {AD_TYPE_LABEL[adPlacement.adType]} · {formatDurationOrSkip(adPlacement)}
          </Text>
        </div>

        <span className="ad-placements-list__actions">
          <Tooltip title="Edit placement">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(adPlacement)}
              aria-label="Edit placement"
            />
          </Tooltip>
          <Tooltip title="Remove placement">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(adPlacement)}
              aria-label="Remove placement"
            />
          </Tooltip>
        </span>
      </div>
    ))}
  </div>
);
