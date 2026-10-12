import { BrandMark } from '../../../../components/BrandMark/BrandMark';
import { SHOWCASE_AD_FRAME_INDEX, SHOWCASE_FRAME_COUNT } from './LoginShowcase.constants';
import './LoginShowcase.css';

/**
 * @description The login page's brand panel - the FrameCue mark, what the product does, and an
 * illustrative film strip: abstract frames on a timeline, with one frame marked as the ad and cued
 * in yellow, the same way the player marks ad breaks.
 */
export const LoginShowcase = () => (
  <section className="login-showcase">
    <span className="login-showcase__brand">
      <BrandMark />
      FrameCue
    </span>

    <div className="login-showcase__body">
      <h2 className="login-showcase__headline">
        Put the right ad on the <em>right frame</em>.
      </h2>
      <p className="login-showcase__copy">
        Upload videos, place pre-roll, mid-roll and banner ads at exact moments, and see how every
        placement performs.
      </p>

      <div className="login-showcase__strip" aria-hidden>
        {Array.from({ length: SHOWCASE_FRAME_COUNT }, (_, index) => (
          <div
            key={index}
            className="login-showcase__frame"
            data-ad={index === SHOWCASE_AD_FRAME_INDEX}
          >
            {index === SHOWCASE_AD_FRAME_INDEX && (
              <span className="login-showcase__ad-tag">AD</span>
            )}
          </div>
        ))}
      </div>
      <div className="login-showcase__timeline" aria-hidden>
        <span className="login-showcase__progress" />
        <span className="login-showcase__cue" />
        <span className="login-showcase__knob" />
      </div>
    </div>
  </section>
);
