import { useNavigate, useParams } from 'react-router-dom';
import { Button, Empty, Flex, Result, Typography } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { AdType } from '../../constants/ad.constants';
import { ModalMode } from '../../constants/modalMode.constants';
import { Routes } from '../../constants/routes.constants';
import { AdPlacementVideosList } from '../../features/ads/components/AdPlacementVideosList/AdPlacementVideosList';
import { AdTypeTag } from '../../features/ads/components/AdTypeTag/AdTypeTag';
import { CreateEditAdModal } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal';
import type { AdFormType } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal.types';
import { MOCK_ADS } from '../../features/ads/mocks/ads.mock';
import { MOCK_AD_PLACEMENTS } from '../../features/videos/mocks/adPlacements.mock';
import { MOCK_VIDEOS } from '../../features/videos/mocks/videos.mock';
import { useModalState } from '../../hooks/useModalState';
import { formatDate } from '../../lib/formatDate';
import './AdDetailsPage.css';

const { Title, Text } = Typography;

/**
 * @description One ad's full detail view - a plain asset preview, metadata, edit/delete actions,
 * and every video it's placed on. Backed by mock data for now, since there's no get-single-ad
 * wiring on the frontend yet.
 */
export const AdDetailsPage = () => {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const { open, handleOpen, handleClose } = useModalState();

  const ad = MOCK_ADS.find((mockAd) => mockAd.id === adId);
  const placementVideos = MOCK_AD_PLACEMENTS.filter(
    (placement) => placement.advertisement.id === adId,
  )
    .map((placement) => {
      const video = MOCK_VIDEOS.find((mockVideo) => mockVideo.id === placement.videoId);
      return video ? { placement, video } : null;
    })
    .filter((item) => item !== null)
    .sort((a, b) => a.video.title.localeCompare(b.video.title));

  /**
   * @description Visual only for now - wiring this up needs auth this app doesn't have yet.
   */
  const handleSubmit = (values: AdFormType) => {
    console.log(values);
    handleClose();
  };

  if (!ad) {
    return (
      <Result
        status="404"
        title="Ad not found"
        extra={
          <Button type="primary" onClick={() => navigate(Routes.ADS)}>
            Back to ads
          </Button>
        }
      />
    );
  }

  return (
    <div className="ad-details-page">
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(Routes.ADS)}>
        Back to ads
      </Button>

      <Flex gap={24} align="flex-start" className="ad-details-page__header">
        <div className="ad-details-page__asset">
          {ad.adType === AdType.BANNER_OVERLAY ? (
            <img src={ad.assetUrl} alt={ad.title} />
          ) : (
            <video src={ad.assetUrl} controls />
          )}
        </div>

        <Flex vertical gap={8} className="ad-details-page__meta">
          <Flex justify="space-between" align="flex-start" gap={16}>
            <Flex vertical gap={8}>
              <Flex align="flex-start" gap={12}>
                <Title level={2} className="ad-details-page__title">
                  {ad.title}
                </Title>
                <AdTypeTag adType={ad.adType} />
              </Flex>
              <Text type="secondary">Created {formatDate(ad.createdAt)}</Text>
            </Flex>

            <Flex gap={8}>
              <Button icon={<EditOutlined />} onClick={handleOpen}>
                Edit ad
              </Button>
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Flex>
          </Flex>

          <Text>{ad.description ?? 'No description'}</Text>

          {ad.clickThroughUrl && (
            <a
              href={ad.clickThroughUrl}
              target="_blank"
              rel="noreferrer"
              className="ad-details-page__click-through"
            >
              <LinkOutlined /> {ad.clickThroughUrl}
            </a>
          )}
        </Flex>
      </Flex>

      <div className="ad-details-page__placements">
        <Title level={4}>Placed on ({placementVideos.length})</Title>

        {placementVideos.length === 0 ? (
          <Empty description="Not placed on any video yet" />
        ) : (
          <AdPlacementVideosList items={placementVideos} />
        )}
      </div>

      {open && (
        <CreateEditAdModal
          open
          mode={ModalMode.EDIT}
          ad={ad}
          onCancel={handleClose}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
