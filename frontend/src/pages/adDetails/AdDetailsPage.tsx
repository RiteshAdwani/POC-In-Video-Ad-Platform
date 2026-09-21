import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Empty, Flex, Result, Typography } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { AssetType } from '../../constants/ad.constants';
import { ModalMode } from '../../constants/modalMode.constants';
import { Routes } from '../../constants/routes.constants';
import { AdPlacementVideosList } from '../../features/ads/components/AdPlacementVideosList/AdPlacementVideosList';
import { AssetTypeTag } from '../../features/ads/components/AssetTypeTag/AssetTypeTag';
import { CreateEditAdModal } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal';
import { AdFormFields } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal.constants';
import type { AdFormType } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal.types';
import { PageSpinner } from '../../components/PageSpinner/PageSpinner';
import { MOCK_AD_PLACEMENTS } from '../../features/videos/mocks/adPlacements.mock';
import { MOCK_VIDEOS } from '../../features/videos/mocks/videos.mock';
import { useAdQuery } from '../../features/ads/hooks/useAdQuery';
import { useUpdateAdMutation } from '../../features/ads/hooks/useUpdateAdMutation';
import { useDeleteAdModal } from '../../features/ads/hooks/useDeleteAdModal';
import { useModalState } from '../../hooks/useModalState';
import { formatDate } from '../../lib/formatDate';
import type { UpdateAdvertisementRequestDto } from '../../dtos/advertisement.dto';
import './AdDetailsPage.css';

const { Title, Text } = Typography;

/**
 * @description One ad's full detail view - a plain asset preview, metadata, edit/delete actions,
 * and every video it's placed on. The placements list is still mock data for now - that's a
 * separate API integration pass, same as VideoDetailsPage's own placements section.
 */
export const AdDetailsPage = () => {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const { open, handleOpen, handleClose } = useModalState();

  const { data: ad, isLoading, isError, error } = useAdQuery(adId);
  const { mutate: updateAdMutation, isPending: isUpdateAdMutationPending } = useUpdateAdMutation();
  const confirmDeleteAd = useDeleteAdModal();

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
   * @description Editing an ad only ever touches title/description/click-through URL.
   */
  const handleSubmit = (values: AdFormType) => {
    const reqBody: UpdateAdvertisementRequestDto = {
      title: values[AdFormFields.Title],
      description: values[AdFormFields.Description],
      clickThroughUrl: values[AdFormFields.ClickThroughUrl],
    };
    updateAdMutation({ id: ad!.id, data: reqBody }, { onSuccess: handleClose });
  };

  /**
   * @description Confirms before permanently deleting this ad and its uploaded creative -
   * rejected by the backend if it's still placed on any video.
   */
  const handleDelete = () => {
    confirmDeleteAd(ad!, { onSuccess: () => navigate(Routes.ADS) });
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !ad) {
    const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;
    return (
      <Result
        status={isNotFound ? '404' : 'error'}
        title={isNotFound ? 'Ad not found' : "Couldn't load this ad"}
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
          {ad.assetType === AssetType.IMAGE ? (
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
                <AssetTypeTag assetType={ad.assetType} />
              </Flex>
              <Text type="secondary">Created {formatDate(ad.createdAt)}</Text>
            </Flex>

            <Flex gap={8}>
              <Button icon={<EditOutlined />} onClick={handleOpen}>
                Edit ad
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
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
          submitting={isUpdateAdMutationPending}
          onCancel={handleClose}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
