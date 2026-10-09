import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Flex, Result, Tooltip, Typography } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { AssetType, DELETE_AD_BLOCKED_TOOLTIP } from '../../constants/ad.constants';
import { ModalMode } from '../../constants/modalMode.constants';
import { Routes } from '../../constants/routes.constants';
import { AdPlacementVideosSection } from '../../features/ads/components/AdPlacementVideosSection/AdPlacementVideosSection';
import { AdStatsWidget } from '../../features/ads/components/AdStatsWidget/AdStatsWidget';
import { AssetTypeTag } from '../../features/ads/components/AssetTypeTag/AssetTypeTag';
import { CreateEditAdModal } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal';
import { AdFormFields } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal.constants';
import type { AdFormType } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal.types';
import { PageSpinner } from '../../components/PageSpinner/PageSpinner';
import { DeletedBanner } from '../../components/DeletedBanner/DeletedBanner';
import { LIST_VIEW_PARAM, ListView } from '../../constants/listView.constants';
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
 * and every video it's placed on. A deleted ad opens read-only: a banner, no actions, and every
 * placement it ever had.
 */
export const AdDetailsPage = () => {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const { open, handleOpen, handleClose } = useModalState();

  const { data: ad, isLoading, isError, error } = useAdQuery(adId);
  const { mutate: updateAdMutation, isPending: isUpdateAdMutationPending } = useUpdateAdMutation();
  const confirmDeleteAd = useDeleteAdModal();

  /**
   * @description Editing an ad only ever touches title/description/click-through URL.
   */
  const handleSubmit = (values: AdFormType) => {
    const reqBody: UpdateAdvertisementRequestDto = {
      title: values[AdFormFields.Title],
      description: values[AdFormFields.Description],
      // An emptied input arrives as '', not undefined - map that to null so it actually clears.
      clickThroughUrl: values[AdFormFields.ClickThroughUrl] || null,
    };
    updateAdMutation({ id: ad!.id, data: reqBody }, { onSuccess: handleClose });
  };

  /**
   * @description Confirms before deleting this ad, then returns to the ads list.
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

  // Backend rejects deleting an ad that's still live on any video - block it here up front.
  const isPlaced = ad.adPlacementCount > 0;
  const isDeleted = Boolean(ad.deletedAt);
  // A deleted ad's page is reached from the Deleted list, so "back" returns there.
  const backTo = isDeleted ? `${Routes.ADS}?${LIST_VIEW_PARAM}=${ListView.DELETED}` : Routes.ADS;

  return (
    <div className="ad-details-page">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(backTo)}
        className="ad-details-page__back"
      >
        Back to ads
      </Button>

      {isDeleted && <DeletedBanner itemLabel="ad" deletedAt={ad.deletedAt!} />}

      <Flex gap={24} align="flex-start" className="ad-details-page__header">
        <div className="ad-details-page__asset">
          {ad.assetType === AssetType.IMAGE ? (
            <img src={ad.assetUrl} alt={ad.title} />
          ) : (
            <video src={ad.assetUrl} controls />
          )}
        </div>

        <Flex vertical gap={8} className="ad-details-page__meta">
          <Flex justify="space-between" align="center" gap={16}>
            <Flex vertical gap={8}>
              <Flex align="flex-start" gap={12}>
                <Title level={2} className="ad-details-page__title">
                  {ad.title}
                </Title>
                <AssetTypeTag assetType={ad.assetType} />
              </Flex>
              <Text type="secondary">Created {formatDate(ad.createdAt)}</Text>
            </Flex>

            {!isDeleted && (
              <Flex gap={8}>
                <Button icon={<EditOutlined />} onClick={handleOpen}>
                  Edit ad
                </Button>
                <Tooltip title={isPlaced ? DELETE_AD_BLOCKED_TOOLTIP : undefined}>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={isPlaced}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </Tooltip>
              </Flex>
            )}
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

      <AdStatsWidget advertisementId={ad.id} />

      <AdPlacementVideosSection adId={ad.id} isDeleted={isDeleted} />

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
