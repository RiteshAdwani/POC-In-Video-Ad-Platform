import { App } from 'antd';
import { useDeleteAdMutation } from './useDeleteAdMutation';
import type { Advertisement } from '../../../types/advertisement.types';

/**
 * @description Shared delete-confirmation flow for an ad - used by both the ads list and an ad's
 * own details page, so the dialog copy and behavior can't drift between them. Returning the
 * mutation's promise from onOk lets antd's own confirm dialog show the pending state on its OK
 * button - the page's underlying delete button sits behind that dialog for the whole window, so
 * a `loading` prop there would be invisible until the dialog closes.
 */
export const useDeleteAdModal = () => {
  const { modal } = App.useApp();
  const deleteMutation = useDeleteAdMutation();

  return (ad: Advertisement, options?: { onSuccess?: () => void }) => {
    modal.confirm({
      title: 'Delete this ad?',
      content: `"${ad.title}" and its uploaded creative will be permanently removed. This can't be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutateAsync(ad.id).then(options?.onSuccess),
    });
  };
};
