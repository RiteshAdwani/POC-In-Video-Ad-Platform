import { App } from 'antd';
import { AD_TYPE_LABEL } from '../../../constants/ad.constants';
import { useDeleteAdPlacementMutation } from './useDeleteAdPlacementMutation';
import type { AdPlacement } from '../../../types/adPlacement.types';

/**
 * @description Shared delete-confirmation flow for an ad placement. Returning the mutation's
 * promise from onOk lets antd's own confirm dialog show the pending state on its OK button - the
 * page's underlying remove button sits behind that dialog for the whole window, so a `loading`
 * prop there would be invisible until the dialog closes.
 */
export const useDeleteAdPlacementModal = (videoId: string) => {
  const { modal } = App.useApp();
  const deleteMutation = useDeleteAdPlacementMutation(videoId);

  return (adPlacement: AdPlacement) => {
    modal.confirm({
      title: 'Remove this placement?',
      content: `"${adPlacement.advertisement.title}" (${AD_TYPE_LABEL[adPlacement.adType]}) will no longer play on this video. This can't be undone.`,
      okText: 'Remove',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutateAsync(adPlacement.id),
    });
  };
};
