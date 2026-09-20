import { useState } from 'react';
import { Button, Flex, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModalMode } from '../../constants/modalMode.constants';
import { AdsGrid } from '../../features/ads/components/AdsGrid/AdsGrid';
import { CreateEditAdModal } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal';
import type { AdFormType } from '../../features/ads/components/CreateEditAdModal/CreateEditAdModal.types';
import { MOCK_ADS } from '../../features/ads/mocks/ads.mock';
import { useModalState } from '../../hooks/useModalState';
import type { Advertisement } from '../../types/advertisement.types';
import './AdsPage.css';

const { Title, Text } = Typography;

/**
 * @description Admin ad library - lists every advertisement with its type and how many videos
 * it's placed on.
 */
export const AdsPage = () => {
  const { open, handleOpen, handleClose } = useModalState();
  const [modalMode, setModalMode] = useState<ModalMode>(ModalMode.CREATE);
  const [editingAd, setEditingAd] = useState<Advertisement | undefined>(undefined);

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
   * @description Visual only for now - wiring this up needs auth this app doesn't have yet.
   */
  const handleSubmit = (values: AdFormType) => {
    console.log(values);
    closeModal();
  };

  return (
    <div className="ads-page">
      <Flex justify="space-between" align="flex-start" className="ads-page__header">
        <Flex vertical gap={4}>
          <Title level={2}>Ads</Title>
          <Text type="secondary">{MOCK_ADS.length} ads in your library</Text>
        </Flex>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreateModal}>
          Create ad
        </Button>
      </Flex>

      <AdsGrid ads={MOCK_ADS} onEdit={openEditModal} />

      {open && (
        <CreateEditAdModal
          open
          mode={modalMode}
          ad={editingAd}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
