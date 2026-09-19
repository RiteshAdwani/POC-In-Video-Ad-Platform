import { Typography } from 'antd';
import { PictureOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { AdType, AD_TYPE_LABEL } from '../../../../constants/ad.constants';
import { formatDuration } from '../../../../lib/formatDuration';
import type { AdPlacement } from '../../../../types/adPlacement.types';
import './AdPlacementsList.css';

const { Text } = Typography;

/**
 * @description One placement has either a duration (banners) or a skip-after point (skippable
 * video ads) or neither (non-skippable video ads) - never both, per the backend's own model.
 */
const formatDurationOrSkip = (placement: AdPlacement) => {
  if (placement.durationSeconds !== null) {
    return `${formatDuration(placement.durationSeconds)} long`;
  }
  if (placement.skipAfterSeconds !== null) {
    return `Skippable after ${placement.skipAfterSeconds}s`;
  }
  return 'Not skippable';
};

type AdPlacementsListProps = {
  placements: AdPlacement[];
};

/**
 * @description Row-per-placement list, thumbnail-and-metadata style (like a video search
 * result) - a colored tile standing in for a real ad creative, with the start offset overlaid
 * the way a video thumbnail shows its own duration.
 */
export const AdPlacementsList = ({ placements }: AdPlacementsListProps) => (
  <div className="ad-placements-list">
    {placements.map((placement) => (
      <div className="ad-placements-list__row" key={placement.id}>
        <div className="ad-placements-list__thumb" data-ad-type={placement.advertisement.adType}>
          {placement.advertisement.adType === AdType.BANNER_OVERLAY ? (
            <PictureOutlined />
          ) : (
            <PlayCircleOutlined />
          )}
          <span className="ad-placements-list__offset">
            {formatDuration(placement.startOffsetSeconds)}
          </span>
        </div>

        <div className="ad-placements-list__info">
          <Text strong ellipsis className="ad-placements-list__title">
            {placement.advertisement.title}
          </Text>
          <Text type="secondary" className="ad-placements-list__meta">
            {AD_TYPE_LABEL[placement.advertisement.adType]} · {formatDurationOrSkip(placement)}
          </Text>
        </div>
      </div>
    ))}
  </div>
);
