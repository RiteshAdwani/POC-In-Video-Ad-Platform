import './BrandMark.css';

/**
 * @description FrameCue's logo mark - a video frame with a play glyph and the accent cue marker
 * on its top edge. Strokes in the current text colour so it fits either theme.
 */
export const BrandMark = () => (
  <svg className="brand-mark" viewBox="0 0 28 28" aria-hidden="true">
    <rect
      x="2.5"
      y="6.5"
      width="23"
      height="16"
      rx="4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M11.5 11v7l6-3.5z" fill="currentColor" />
    <rect
      className="brand-mark__cue"
      x="17"
      y="2.6"
      width="5.5"
      height="5.5"
      rx="1"
      transform="rotate(45 19.75 5.35)"
    />
  </svg>
);
