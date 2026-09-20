import { useEffect, useMemo } from 'react';
import { Form, InputNumber, Modal, Select } from 'antd';
import { AdType, AD_TYPE_LABEL, AssetType } from '../../../../constants/ad.constants';
import { ModalMode } from '../../../../constants/modalMode.constants';
import type { Advertisement } from '../../../../types/advertisement.types';
import type { AdPlacement } from '../../../../types/adPlacement.types';
import { PlacementFormFields } from './CreateEditPlacementModal.constants';
import type { PlacementFormType } from './CreateEditPlacementModal.types';
import { getPlacementFormRules } from './CreateEditPlacementModal.rules';

const AD_TYPE_OPTIONS_BY_ASSET_TYPE: Record<AssetType, { value: AdType; label: string }[]> = {
  [AssetType.IMAGE]: [
    { value: AdType.BANNER_OVERLAY, label: AD_TYPE_LABEL[AdType.BANNER_OVERLAY] },
  ],
  [AssetType.VIDEO]: [
    { value: AdType.PRE_ROLL, label: AD_TYPE_LABEL[AdType.PRE_ROLL] },
    { value: AdType.MID_ROLL, label: AD_TYPE_LABEL[AdType.MID_ROLL] },
  ],
};

type CreateEditPlacementModalProps = {
  open: boolean;
  mode: ModalMode;
  ads: Advertisement[];
  placement?: AdPlacement;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: PlacementFormType) => void;
};

/**
 * @description Create/edit form for attaching an ad to this video at a position. An image ad can
 * only be placed as a banner overlay; a video ad can be placed as either a pre-roll or a mid-roll -
 * the same video creative can be one on this video and the other elsewhere, since placement type
 * is a per-placement choice, not a property of the ad itself. Which of the remaining fields apply
 * then depends on that choice: pre-roll is locked to offset 0, banner overlay requires a duration
 * and can't be skippable, mid-roll can optionally be skippable - mirroring the backend's own
 * placement validators. Editing can't change which ad is placed (only its type/timing), matching
 * the backend's update schema, which omits advertisementId.
 */
export const CreateEditPlacementModal = ({
  open,
  mode,
  ads,
  placement,
  submitting,
  onCancel,
  onSubmit,
}: CreateEditPlacementModalProps) => {
  const [form] = Form.useForm<PlacementFormType>();
  const isEdit = mode === ModalMode.EDIT;

  const adOptions =
    isEdit && placement
      ? [{ value: placement.advertisement.id, label: placement.advertisement.title }]
      : ads.map((ad) => ({ value: ad.id, label: ad.title }));

  const selectedAdId = Form.useWatch(PlacementFormFields.AdvertisementId, form);
  const selectedAssetType = isEdit
    ? placement?.advertisement.assetType
    : ads.find((ad) => ad.id === selectedAdId)?.assetType;

  const adTypeOptions = useMemo(
    () => (selectedAssetType ? AD_TYPE_OPTIONS_BY_ASSET_TYPE[selectedAssetType] : []),
    [selectedAssetType],
  );
  const selectedAdType = Form.useWatch(PlacementFormFields.AdType, form);

  const isPreRoll = selectedAdType === AdType.PRE_ROLL;
  const isBanner = selectedAdType === AdType.BANNER_OVERLAY;
  const rules = getPlacementFormRules(selectedAdType);

  /**
   * @description Keeps the placement-type field and its dependents in sync in one pass: picks the
   * only valid type automatically for an image ad, clears a stale selection left over from a
   * previously selected ad once it's no longer valid (e.g. switching from an image ad to a video
   * ad invalidates "banner overlay"), locks pre-roll to offset 0, and clears whichever of
   * duration/skip-after doesn't apply - using the type resolved just above rather than the
   * (possibly stale, pre-update) watched value, so all three stay consistent within the same run.
   */
  useEffect(() => {
    let adType: AdType | undefined = selectedAdType;

    if (adTypeOptions.length === 1) {
      adType = adTypeOptions[0].value;
      form.setFieldValue(PlacementFormFields.AdType, adType);
    } else if (!adTypeOptions.some((option) => option.value === adType)) {
      adType = undefined;
      form.setFieldValue(PlacementFormFields.AdType, adType);
    }

    if (adType === AdType.PRE_ROLL) {
      form.setFieldValue(PlacementFormFields.StartOffsetSeconds, 0);
    }

    if (adType === AdType.BANNER_OVERLAY) {
      form.setFieldValue(PlacementFormFields.SkipAfterSeconds, undefined);
    } else {
      form.setFieldValue(PlacementFormFields.DurationSeconds, undefined);
    }
  }, [adTypeOptions, selectedAdType, form]);

  return (
    <Modal
      title={isEdit ? 'Edit placement' : 'Add placement'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={isEdit ? 'Save changes' : 'Add'}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form<PlacementFormType>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          [PlacementFormFields.AdvertisementId]: placement?.advertisement.id,
          [PlacementFormFields.AdType]: placement?.adType,
          [PlacementFormFields.StartOffsetSeconds]: placement?.startOffsetSeconds ?? 0,
          [PlacementFormFields.DurationSeconds]: placement?.durationSeconds ?? undefined,
          [PlacementFormFields.SkipAfterSeconds]: placement?.skipAfterSeconds ?? undefined,
        }}
      >
        <Form.Item<PlacementFormType>
          label="Ad"
          name={PlacementFormFields.AdvertisementId}
          rules={rules[PlacementFormFields.AdvertisementId]}
        >
          <Select placeholder="Select an ad to place" options={adOptions} disabled={isEdit} />
        </Form.Item>

        {selectedAssetType && (
          <>
            <Form.Item<PlacementFormType>
              label="Placement type"
              name={PlacementFormFields.AdType}
              rules={rules[PlacementFormFields.AdType]}
              extra={
                adTypeOptions.length === 1
                  ? "This ad's asset only supports this placement type"
                  : undefined
              }
            >
              <Select
                placeholder="Select where this ad plays"
                options={adTypeOptions}
                disabled={adTypeOptions.length === 1}
              />
            </Form.Item>

            {selectedAdType && (
              <>
                <Form.Item<PlacementFormType>
                  label="Start offset (seconds)"
                  name={PlacementFormFields.StartOffsetSeconds}
                  rules={rules[PlacementFormFields.StartOffsetSeconds]}
                  extra={isPreRoll ? "Pre-roll ads always play at the video's start" : undefined}
                >
                  <InputNumber min={0} disabled={isPreRoll} style={{ width: '100%' }} />
                </Form.Item>

                {isBanner ? (
                  <Form.Item<PlacementFormType>
                    label="Duration (seconds)"
                    name={PlacementFormFields.DurationSeconds}
                    rules={rules[PlacementFormFields.DurationSeconds]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                ) : (
                  <Form.Item<PlacementFormType>
                    label="Skip after (seconds)"
                    name={PlacementFormFields.SkipAfterSeconds}
                    rules={rules[PlacementFormFields.SkipAfterSeconds]}
                    extra="Leave empty if this ad can't be skipped"
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                )}
              </>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};
