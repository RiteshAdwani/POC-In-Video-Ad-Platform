import { useState } from 'react';
import { Flex, Segmented } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModalMode } from '../../constants/modalMode.constants';
import { AdsListContent } from '../../features/ads/components/AdsListContent/AdsListContent';
import { CreateEditAdModal } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal';
import { AdFormFields } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal.constants';
import type { AdFormType } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal.types';
import { useAdsQuery } from '../../features/ads/hooks/useAdsQuery';
import { useCreateAdMutation } from '../../features/ads/hooks/useCreateAdMutation';
import { useUpdateAdMutation } from '../../features/ads/hooks/useUpdateAdMutation';
import { useDeleteAdModal } from '../../features/ads/hooks/useDeleteAdModal';
import { useModalState } from '../../hooks/useModalState';
import { LIST_VIEW_OPTIONS, ListView } from '../../constants/listView.constants';
import { ListPageHeader } from '../../components/ListPageHeader/ListPageHeader';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import type { Advertisement } from '../../types/advertisement.types';
import type { UpdateAdvertisementRequestDto } from '../../dtos/advertisement.dto';
import './AdsPage.css';

/**
 * @description Admin ad library - lists every advertisement with its asset type and how many
 * videos it's placed on.
 */
export const AdsPage = () => {
  const { open, handleOpen, handleClose } = useModalState();
  const [modalMode, setModalMode] = useState<ModalMode>(ModalMode.CREATE);
  const [editingAd, setEditingAd] = useState<Advertisement | undefined>(undefined);

  const { data, isLoading, isError, search, filters, onPageChange, onSearch, onFilterChange } =
    useAdsQuery();
  const isDeletedView = filters.view === ListView.DELETED;

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

  return (
    <div className="ads-page">
      <ListPageHeader
        title="Ads"
        subtitle={`${data?.pagination.totalItems ?? 0} ${isDeletedView ? 'deleted ads' : 'ads in your library'}`}
        actionLabel="Create ad"
        actionIcon={<PlusOutlined />}
        onAction={openCreateModal}
      />

      <Flex justify="space-between" align="center" gap={16} wrap className="ads-page__toolbar">
        <SearchInput
          placeholder="Search ads by title"
          onSearch={onSearch}
          initialValue={search}
          className="ads-page__search"
        />
        <Segmented
          options={LIST_VIEW_OPTIONS}
          value={filters.view}
          onChange={(value) => onFilterChange({ view: value as ListView })}
        />
      </Flex>

      <div className="ads-page__body">
        <AdsListContent
          data={data}
          isLoading={isLoading}
          isError={isError}
          search={search}
          isDeletedView={isDeletedView}
          onCreate={openCreateModal}
          onEdit={openEditModal}
          onDelete={confirmDeleteAd}
          onPageChange={onPageChange}
        />
      </div>

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
