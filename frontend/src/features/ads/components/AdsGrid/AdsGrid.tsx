import { generatePath, Link } from 'react-router-dom';
import { Button, Tooltip, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, LinkOutlined, PlayCircleFilled } from '@ant-design/icons';
import { AdType } from '../../../../constants/ad.constants';
import { Routes } from '../../../../constants/routes.constants';
import { formatDate } from '../../../../lib/formatDate';
import type { Advertisement } from '../../../../types/advertisement.types';
import { AdTypeTag } from '../AdTypeTag/AdTypeTag';
import './AdsGrid.css';

const { Text } = Typography;

type AdsGridProps = {
  ads: Advertisement[];
  onEdit: (ad: Advertisement) => void;
};

/**
 * @description Card-grid listing of ads - a banner's real creative renders as its own thumbnail
 * (assetUrl is a plain image URL), while a video ad (pre-roll/mid-roll) gets a colored tile since
 * previewing the whole video isn't worth it here. The thumbnail and title/description link to
 * that ad's details page.
 */
export const AdsGrid = ({ ads, onEdit }: AdsGridProps) => (
  <div className="ads-grid">
    {ads.map((ad) => (
      <div className="ads-grid__card" key={ad.id}>
        <Link to={generatePath(Routes.AD_DETAILS, { adId: ad.id })} className="ads-grid__link">
          <div className="ads-grid__thumb" data-ad-type={ad.adType}>
            {ad.adType === AdType.BANNER_OVERLAY ? (
              <img src={ad.assetUrl} alt={ad.title} className="ads-grid__thumb-image" />
            ) : (
              <PlayCircleFilled className="ads-grid__play" />
            )}
            <AdTypeTag adType={ad.adType} />
            <span className="ads-grid__placement-count">
              {ad.placementCount} {ad.placementCount === 1 ? 'video' : 'videos'}
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
          <span className="mono">{formatDate(ad.createdAt)}</span>
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
                aria-label="Delete ad"
              />
            </Tooltip>
          </span>
        </div>
      </div>
    ))}
  </div>
);
