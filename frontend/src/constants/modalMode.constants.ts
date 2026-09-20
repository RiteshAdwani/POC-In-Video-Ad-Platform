export const ModalMode = {
  CREATE: 'create',
  EDIT: 'edit',
} as const;

export type ModalMode = (typeof ModalMode)[keyof typeof ModalMode];
