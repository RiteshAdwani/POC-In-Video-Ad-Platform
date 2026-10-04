import { useState } from 'react';
import { Button, Empty, Flex, Input, Pagination, Result, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { ModalMode } from '../../constants/modalMode.constants';
import { AdsGrid } from '../../features/ads/components/AdsGrid/AdsGrid';
import { CreateEditAdModal } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal';
import { AdFormFields } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal.constants';
import type { AdFormType } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal.types';
import { PageSpinner } from '../../components/PageSpinner/PageSpinner';
import { useAdsQuery } from '../../features/ads/hooks/useAdsQuery';
import { useCreateAdMutation } from '../../features/ads/hooks/useCreateAdMutation';
import { useUpdateAdMutation } from '../../features/ads/hooks/useUpdateAdMutation';
import { useDeleteAdModal } from '../../features/ads/hooks/useDeleteAdModal';
import { useModalState } from '../../hooks/useModalState';
import { usePaginationParam } from '../../hooks/usePaginationParam';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { SEARCH_DEBOUNCE_MS } from '../../constants/search.constants';
import type { Advertisement } from '../../types/advertisement.types';
import type { UpdateAdvertisementRequestDto } from '../../dtos/advertisement.dto';
import './AdsPage.css';

const { Title, Text } = Typography;

/**
 * @description Admin ad library - lists every advertisement with its asset type and how many
 * videos it's placed on.
 */
export const AdsPage = () => {
  const { open, handleOpen, handleClose } = useModalState();
  const [modalMode, setModalMode] = useState<ModalMode>(ModalMode.CREATE);
  const [editingAd, setEditingAd] = useState<Advertisement | undefined>(undefined);

  const { page, onPageChange } = usePaginationParam();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { data, isLoading, isError } = useAdsQuery(page, debouncedSearch);

  /**
   * @description Jumps back to page 1 as soon as the search term changes - otherwise a search
   * typed while on, say, page 3 would show "page 3 of filtered results" (likely nonexistent)
   * instead of starting from the top of the new results.
   */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    onPageChange(1);
  };
  const { mutate: createAdMutation, isPending: isCreateAdMutationPending } = useCreateAdMutation();
  const { mutate: updateAdMutation, isPending: isUpdateAdMutationPending } = useUpdateAdMutation();
  const confirmDeleteAd = useDeleteAdModal();

  /**
   * @description Opens the shared modal in create mode, with a blank form.
   */
  const openCreateModal = () => {
    setModalMode(ModalMode.CREATE);
    setEditingAd(undefined);
    handleOpen();
  };

  /**
   * @description Opens the shared modal in edit mode, pre-filled with the clicked ad.
   */
  const openEditModal = (ad: Advertisement) => {
    setModalMode(ModalMode.EDIT);
    setEditingAd(ad);
    handleOpen();
  };

  /**
   * @description Hides the modal and clears the ad being edited, so a stale ad isn't carried
   * into the next create-mode open.
   */
  const closeModal = () => {
    handleClose();
    setEditingAd(undefined);
  };

  /**
   * @description Creating uploads the creative (multipart); editing only ever touches title/
   * description/click-through URL - the Form.Item for the file doesn't even render in edit mode.
   */
  const handleSubmit = (values: AdFormType) => {
    if (modalMode === ModalMode.CREATE) {
      const file = values[AdFormFields.AssetFile]?.[0]?.originFileObj;
      if (!file) {
        return;
      }
      const description = values[AdFormFields.Description];
      const clickThroughUrl = values[AdFormFields.ClickThroughUrl];
      const formData = new FormData();
      formData.append('title', values[AdFormFields.Title]);
      if (description) {
        formData.append('description', description);
      }
      if (clickThroughUrl) {
        formData.append('clickThroughUrl', clickThroughUrl);
      }
      formData.append('assetFile', file);
      createAdMutation(formData, { onSuccess: closeModal });
    } else {
      const reqBody: UpdateAdvertisementRequestDto = {
        title: values[AdFormFields.Title],
        description: values[AdFormFields.Description],
        // An emptied input arrives as '', not undefined - map that to null so it actually clears.
        clickThroughUrl: values[AdFormFields.ClickThroughUrl] || null,
      };
      updateAdMutation({ id: editingAd!.id, data: reqBody }, { onSuccess: closeModal });
    }
  };

  let content;
  if (isLoading) {
    content = <PageSpinner />;
  } else if (isError) {
    content = (
      <Result status="error" title="Couldn't load ads" subTitle="Please try again shortly." />
    );
  } else if (!data || data.pagination.totalItems === 0) {
    content = debouncedSearch ? (
      <Empty description={`No ads match "${debouncedSearch}"`} />
    ) : (
      <Empty description="No ads yet">
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Create your first ad
        </Button>
      </Empty>
    );
  } else {
    content = (
      <>
        <AdsGrid ads={data.advertisements} onEdit={openEditModal} onDelete={confirmDeleteAd} />
        <Flex justify="flex-end" className="ads-page__pagination">
          <Pagination
            current={data.pagination.page}
            pageSize={data.pagination.pageSize}
            total={data.pagination.totalItems}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        </Flex>
      </>
    );
  }

  return (
    <div className="ads-page">
      <Flex justify="space-between" align="center" className="ads-page__header">
        <Flex vertical gap={4}>
          <Title level={2}>Ads</Title>
          <Text type="secondary">{data?.pagination.totalItems ?? 0} ads in your library</Text>
        </Flex>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreateModal}>
          Create ad
        </Button>
      </Flex>

      <Input
        placeholder="Search ads by title"
        prefix={<SearchOutlined />}
        allowClear
        value={search}
        onChange={(event) => handleSearchChange(event.target.value)}
        className="ads-page__search"
      />

      <div className="ads-page__body">{content}</div>

      {open && (
        <CreateEditAdModal
          open
          mode={modalMode}
          ad={editingAd}
          submitting={isCreateAdMutationPending || isUpdateAdMutationPending}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
