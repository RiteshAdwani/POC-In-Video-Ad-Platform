// Which slice of an admin list is showing - live items, or retired (soft-deleted) ones.
export const ListView = {
  ACTIVE: 'active',
  DELETED: 'deleted',
} as const;

export type ListView = (typeof ListView)[keyof typeof ListView];

export const LIST_VIEW_PARAM = 'view';

export const LIST_VIEW_OPTIONS = [
  { label: 'Active', value: ListView.ACTIVE },
  { label: 'Deleted', value: ListView.DELETED },
];

export const DELETED_READ_ONLY_NOTE = 'Its past performance is kept as a read-only record.';
