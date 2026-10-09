// Which slice of an admin list to return - live items, or retired (soft-deleted) ones.
export const ListView = {
  ACTIVE: 'active',
  DELETED: 'deleted',
} as const;

export type ListView = (typeof ListView)[keyof typeof ListView];
