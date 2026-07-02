import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {INK} from '../theme/palette';
import {MOTION} from '../theme/tokens';

/**
 * Radiating tick marks that flash outward when an element lands
 * (style_analysis §6: "radiating ticks on landing"). Purely decorative accent.
 */
export type RadiatingTicksProps = {
  startFrame: number;
  count?: number;
  radius?: number;
  color?: string;
  tickLength?: number;
  tickWidth?: number;
};

export const RadiatingTicks: React.FC<RadiatingTicksProps> = ({
  startFrame,
  count = 8,
  radius = 70,
  color = INK.line,
  tickLength = 22,
  tickWidth = 6,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - startFrame;
  const life = MOTION.tickFlash;

  if (local < 0 || local > life) {
    return null;
  }

  const grow = interpolate(local, [0, life], [radius * 0.55, radius]);
  const opacity = interpolate(local, [0, life * 0.4, life], [0, 1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        opacity,
      }}
    >
      {Array.from({length: count}).map((_, i) => {
        const angle = (360 / count) * i;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: tickLength,
              height: tickWidth,
              borderRadius: tickWidth,
              backgroundColor: color,
              transformOrigin: '0% 50%',
              transform: `rotate(${angle}deg) translateX(${grow}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
