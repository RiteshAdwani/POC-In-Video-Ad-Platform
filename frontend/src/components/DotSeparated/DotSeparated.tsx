import { Fragment, type ReactNode } from 'react';

type DotSeparatedProps = {
  // Falsy entries are skipped, so callers can include a part conditionally.
  parts: ReactNode[];
  className?: string;
};

/**
 * @description Short facts on one line with a dot between each, e.g. "Ready · Uploaded Oct 7".
 */
export const DotSeparated = ({ parts, className }: DotSeparatedProps) => (
  <div className={className}>
    {parts.filter(Boolean).map((part, index) => (
      <Fragment key={index}>
        {index > 0 && <span aria-hidden>·</span>}
        {part}
      </Fragment>
    ))}
  </div>
);
