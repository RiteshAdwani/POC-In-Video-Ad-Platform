export const ModalMode = {
  CREATE: 'create',
  EDIT: 'edit',
} as const;

export type ModalMode = (typeof ModalMode)[keyof typeof ModalMode];

export const VideoFormFields = {
  Title: 'title',
  Description: 'description',
  VideoFile: 'videoFile',
} as const;

export type VideoFormFields = (typeof VideoFormFields)[keyof typeof VideoFormFields];

// Shared by the Form rule (CreateEditVideoModal.rules.ts) and the input's own `maxLength` prop,
// so the two can't drift apart. The backend's createVideoSchema doesn't enforce these yet.
export const VIDEO_TITLE_MAX_LENGTH = 150;
export const VIDEO_DESCRIPTION_MAX_LENGTH = 500;
