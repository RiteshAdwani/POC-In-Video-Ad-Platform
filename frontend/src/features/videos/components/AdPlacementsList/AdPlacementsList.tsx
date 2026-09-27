import { Button, Flex, Tooltip, Typography } from 'antd';
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FieldTimeOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { AssetType } from '../../../../constants/ad.constants';
import { formatDuration } from '../../../../lib/formatDuration';
import { formatDurationOrSkip } from '../../../../lib/formatDurationOrSkip';
import { getVideoThumbnailUrl } from '../../../../lib/videoThumbnail';
import type { AdPlacement } from '../../../../types/adPlacement.types';
import { AdTypeTag } from '../../../../components/AdTypeTag/AdTypeTag';
import { AdPlacementRowStat } from '../../../../components/AdPlacementRowStat/AdPlacementRowStat';
import './AdPlacementsList.css';

const { Text } = Typography;

type AdPlacementsListProps = {
  adPlacements: AdPlacement[];
  videoId: string;
  startDate: string;
  endDate: string;
  onEdit: (adPlacement: AdPlacement) => void;
  onDelete: (adPlacement: AdPlacement) => void;
};

/**
 * @description Row-per-placement list, thumbnail-and-metadata style (like a video search
 * result) - the ad's real creative (its image, or a frame from its video) where available, a
 * colored tile standing in otherwise. The placement's type, start offset, and duration/skip
 * behavior render as a type tag plus small labeled chips rather than a single string of plain
 * text - a bare timestamp is easy to misread as the ad's own duration rather than when it starts.
 * Each row also carries its own performance line for the given window, via AdPlacementRowStat.
 */
export const AdPlacementsList = ({
  adPlacements,
  videoId,
  startDate,
  endDate,
  onEdit,
  onDelete,
}: AdPlacementsListProps) => (
  <div className="ad-placements-list">
    {adPlacements.map((adPlacement) => {
      const { assetType, assetUrl } = adPlacement.advertisement;
      const videoThumbnailUrl =
        assetType === AssetType.VIDEO ? getVideoThumbnailUrl(assetUrl) : null;

      return (
        <div className="ad-placements-list__row" key={adPlacement.id}>
          <div className="ad-placements-list__thumb" data-ad-type={adPlacement.adType}>
            {assetType === AssetType.IMAGE ? (
              <img src={assetUrl} alt="" className="ad-placements-list__thumb-image" />
            ) : (
              <>
                {videoThumbnailUrl && (
                  <img src={videoThumbnailUrl} alt="" className="ad-placements-list__thumb-image" />
                )}
                <PlayCircleOutlined className="ad-placements-list__play" />
              </>
            )}
          </div>

          <div className="ad-placements-list__info">
            <Text strong ellipsis className="ad-placements-list__title">
              {adPlacement.advertisement.title}
            </Text>
            <Flex align="center" gap={6} wrap className="ad-placements-list__tags">
              <AdTypeTag adType={adPlacement.adType} />
              <span className="ad-placements-list__chip">
                <ClockCircleOutlined /> Plays at {formatDuration(adPlacement.startOffsetSeconds)}
              </span>
              <span className="ad-placements-list__chip">
                <FieldTimeOutlined /> {formatDurationOrSkip(adPlacement)}
              </span>
            </Flex>
            <AdPlacementRowStat
              videoId={videoId}
              adPlacementId={adPlacement.id}
              startDate={startDate}
              endDate={endDate}
            />
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
      );
    })}
  </div>
);
