import { generatePath, Link } from 'react-router-dom';
import { Button, Tooltip, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, LinkOutlined, PlayCircleFilled } from '@ant-design/icons';
import { AssetType } from '../../../../constants/ad.constants';
import { Routes } from '../../../../constants/routes.constants';
import { formatRelativeTime } from '../../../../lib/formatRelativeTime';
import { getVideoThumbnailUrl } from '../../../../lib/videoThumbnail';
import type { Advertisement } from '../../../../types/advertisement.types';
import { AssetTypeTag } from '../AssetTypeTag/AssetTypeTag';
import './AdsGrid.css';

const { Text } = Typography;

type AdsGridProps = {
  ads: Advertisement[];
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
};

/**
 * @description Card-grid listing of ads - an image ad's real creative renders as its own
 * thumbnail, while a video ad gets a colored tile since previewing the whole video isn't worth it
 * here. The thumbnail and title/description link to that ad's details page.
 */
export const AdsGrid = ({ ads, onEdit, onDelete }: AdsGridProps) => (
  <div className="ads-grid">
    {ads.map((ad) => {
      const videoThumbnailUrl =
        ad.assetType === AssetType.VIDEO ? getVideoThumbnailUrl(ad.assetUrl) : null;

      return (
        <div className="ads-grid__card" key={ad.id}>
          <Link to={generatePath(Routes.AD_DETAILS, { adId: ad.id })} className="ads-grid__link">
            <div className="ads-grid__thumb" data-asset-type={ad.assetType}>
              {ad.assetType === AssetType.IMAGE ? (
                <img src={ad.assetUrl} alt={ad.title} className="ads-grid__thumb-image" />
              ) : (
                <>
                  {videoThumbnailUrl && (
                    <img src={videoThumbnailUrl} alt="" className="ads-grid__thumb-image" />
                  )}
                  <PlayCircleFilled className="ads-grid__play" />
                </>
              )}
              <AssetTypeTag assetType={ad.assetType} />
              <span className="ads-grid__ad-placement-count">
                {ad.adPlacementCount} {ad.adPlacementCount === 1 ? 'video' : 'videos'}
              </span>
              {ad.clickThroughUrl && (
                <Tooltip title="Has a click-through link">
                  <LinkOutlined className="ads-grid__click-through" />
                </Tooltip>
              )}
            </div>

            <div className="ads-grid__body">
              <Text strong ellipsis className="ads-grid__title">
                {ad.title}
              </Text>
              <Text type="secondary" ellipsis className="ads-grid__description">
                {ad.description ?? 'No description'}
              </Text>
            </div>
          </Link>

          <div className="ads-grid__footer">
            <span>{formatRelativeTime(ad.createdAt)}</span>
            <span className="ads-grid__actions">
              <Tooltip title="Edit ad">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(ad)}
                  aria-label="Edit ad"
                />
              </Tooltip>
              <Tooltip title="Delete ad">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(ad)}
                  aria-label="Delete ad"
                />
              </Tooltip>
            </span>
          </div>
        </div>
      );
    })}
  </div>
);
