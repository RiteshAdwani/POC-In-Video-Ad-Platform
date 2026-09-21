import { App } from 'antd';
import { useDeleteVideoMutation } from './useDeleteVideoMutation';
import type { Video } from '../../../types/video.types';

/**
 * @description Shared delete-confirmation flow for a video - used by both the videos list and a
 * video's own details page, so the dialog copy and behavior can't drift between them. Returning
 * the mutation's promise from onOk lets antd's own confirm dialog show the pending state on its
 * OK button - the page's underlying delete button sits behind that dialog for the whole window,
 * so a `loading` prop there would be invisible until the dialog closes.
 */
export const useDeleteVideoModal = () => {
  const { modal } = App.useApp();
  const deleteMutation = useDeleteVideoMutation();

  return (video: Video, options?: { onSuccess?: () => void }) => {
    modal.confirm({
      title: 'Delete this video?',
      content: `"${video.title}" and its uploaded file will be permanently removed. This can't be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutateAsync(video.id).then(options?.onSuccess),
    });
  };
};
