import { useEffect, useMemo } from 'react';
import { Form, InputNumber, Modal, Select } from 'antd';
import { AdType } from '../../../../constants/ad.constants';
import { ModalMode } from '../../../../constants/modalMode.constants';
import type { Advertisement } from '../../../../types/advertisement.types';
import type { AdPlacement } from '../../../../types/adPlacement.types';
import {
  AdPlacementFormFields,
  AD_TYPE_OPTIONS_BY_ASSET_TYPE,
} from './CreateEditAdPlacementModal.constants';
import type { AdPlacementFormType } from './CreateEditAdPlacementModal.types';
import { getAdPlacementFormRules } from './CreateEditAdPlacementModal.rules';
import './CreateEditAdPlacementModal.css';

type CreateEditAdPlacementModalProps = {
  open: boolean;
  mode: ModalMode;
  ads: Advertisement[];
  adPlacement?: AdPlacement;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: AdPlacementFormType) => void;
};

/**
 * @description Create/edit form for attaching an ad to this video at a position. An image ad can
 * only be a banner overlay; a video ad can be a pre-roll or mid-roll - a per-placement choice, not
 * a property of the ad itself. Editing can't change which ad is placed, matching the backend.
 */
export const CreateEditAdPlacementModal = ({
  open,
  mode,
  ads,
  adPlacement,
  submitting,
  onCancel,
  onSubmit,
}: CreateEditAdPlacementModalProps) => {
  const [form] = Form.useForm<AdPlacementFormType>();
  const isEdit = mode === ModalMode.EDIT;

  const adOptions =
    isEdit && adPlacement
      ? [{ value: adPlacement.advertisement.id, label: adPlacement.advertisement.title }]
      : ads.map((ad) => ({ value: ad.id, label: ad.title }));

  const selectedAdId = Form.useWatch(AdPlacementFormFields.AdvertisementId, form);
  const selectedAssetType = isEdit
    ? adPlacement?.advertisement.assetType
    : ads.find((ad) => ad.id === selectedAdId)?.assetType;

  const adTypeOptions = useMemo(
    () => (selectedAssetType ? AD_TYPE_OPTIONS_BY_ASSET_TYPE[selectedAssetType] : []),
    [selectedAssetType],
  );
  const selectedAdType = Form.useWatch(AdPlacementFormFields.AdType, form);

  const isPreRoll = selectedAdType === AdType.PRE_ROLL;
  const isMidRoll = selectedAdType === AdType.MID_ROLL;
  const isBanner = selectedAdType === AdType.BANNER_OVERLAY;
  const rules = getAdPlacementFormRules(selectedAdType);

  let startOffsetHelpText: string | undefined;
  if (isPreRoll) {
    startOffsetHelpText = "Pre-roll ads always play at the video's start";
  } else if (isMidRoll) {
    startOffsetHelpText = 'Mid-roll ads must start after the video begins';
  }

  /**
   * @description Auto-resolves the placement type against the selected ad's asset type. Create
   * mode only - in edit mode, selectedAdType reads undefined on the first render (Form.useWatch
   * lags initialValues), which would wrongly look stale and get cleared.
   */
  useEffect(() => {
    if (isEdit) return;

    if (adTypeOptions.length === 1) {
      form.setFieldValue(AdPlacementFormFields.AdType, adTypeOptions[0].value);
    } else if (!adTypeOptions.some((option) => option.value === selectedAdType)) {
      form.setFieldValue(AdPlacementFormFields.AdType, undefined);
    }
  }, [isEdit, adTypeOptions, selectedAdType, form]);

  /**
   * @description Syncs timing fields to the selected type, in both modes. Guarded on
   * selectedAdType being defined so it can't fire on Form.useWatch's transient undefined on the
   * first render and wipe the placement's real values before they're shown.
   */
  useEffect(() => {
    if (!selectedAdType) return;

    if (selectedAdType === AdType.PRE_ROLL) {
      form.setFieldValue(AdPlacementFormFields.StartOffsetSeconds, 0);
    }

    if (selectedAdType === AdType.BANNER_OVERLAY) {
      form.setFieldValue(AdPlacementFormFields.SkipAfterSeconds, undefined);
    } else {
      form.setFieldValue(AdPlacementFormFields.DurationSeconds, undefined);
    }
  }, [selectedAdType, form]);

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
      <Form<AdPlacementFormType>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          [AdPlacementFormFields.AdvertisementId]: adPlacement?.advertisement.id,
          [AdPlacementFormFields.AdType]: adPlacement?.adType,
          [AdPlacementFormFields.StartOffsetSeconds]: adPlacement?.startOffsetSeconds ?? 0,
          [AdPlacementFormFields.DurationSeconds]: adPlacement?.durationSeconds ?? undefined,
          [AdPlacementFormFields.SkipAfterSeconds]: adPlacement?.skipAfterSeconds ?? undefined,
        }}
      >
        <Form.Item<AdPlacementFormType>
          label="Ad"
          name={AdPlacementFormFields.AdvertisementId}
          rules={rules[AdPlacementFormFields.AdvertisementId]}
        >
          <Select placeholder="Select an ad to place" options={adOptions} disabled={isEdit} />
        </Form.Item>

        {selectedAssetType && (
          <>
            <Form.Item<AdPlacementFormType>
              label="Placement type"
              name={AdPlacementFormFields.AdType}
              rules={rules[AdPlacementFormFields.AdType]}
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
                <Form.Item<AdPlacementFormType>
                  label="Start offset (seconds)"
                  name={AdPlacementFormFields.StartOffsetSeconds}
                  rules={rules[AdPlacementFormFields.StartOffsetSeconds]}
                  extra={startOffsetHelpText}
                >
                  <InputNumber
                    min={isMidRoll ? 1 : 0}
                    disabled={isPreRoll}
                    className="ad-placement-form__number-input"
                  />
                </Form.Item>

                {isBanner ? (
                  <Form.Item<AdPlacementFormType>
                    label="Duration (seconds)"
                    name={AdPlacementFormFields.DurationSeconds}
                    rules={rules[AdPlacementFormFields.DurationSeconds]}
                  >
                    <InputNumber min={1} className="ad-placement-form__number-input" />
                  </Form.Item>
                ) : (
                  <Form.Item<AdPlacementFormType>
                    label="Skip after (seconds)"
                    name={AdPlacementFormFields.SkipAfterSeconds}
                    rules={rules[AdPlacementFormFields.SkipAfterSeconds]}
                    extra="Leave empty if this ad can't be skipped"
                  >
                    <InputNumber min={0} className="ad-placement-form__number-input" />
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
