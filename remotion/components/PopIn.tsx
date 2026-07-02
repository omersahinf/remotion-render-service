import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SPRING} from '../theme/tokens';

/**
 * Additive pop-in wrapper (the core motion of this style, style_analysis §6):
 * an element appears at `startFrame` with a small scale-overshoot pop and fade.
 * Everything before startFrame is invisible so beats land on the spoken word.
 */
export type PopInProps = {
  children: React.ReactNode;
  startFrame: number;
  from?: number; // starting scale
  soft?: boolean; // gentler spring for large elements
  style?: React.CSSProperties;
};

export const PopIn: React.FC<PopInProps> = ({
  children,
  startFrame,
  from = 0.6,
  soft = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  if (frame < startFrame) {
    return null;
  }

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: soft ? SPRING.softPop : SPRING.pop,
  });
  const scale = from + (1 - from) * progress;
  const opacity = Math.min(1, progress * 1.4);

  return (
    <div style={{transform: `scale(${scale})`, opacity, ...style}}>
      {children}
    </div>
  );
};
