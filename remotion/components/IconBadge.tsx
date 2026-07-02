import React from 'react';
import {Img} from 'remotion';
import {INK} from '../theme/palette';
import {OUTLINE} from '../theme/tokens';

/**
 * Circular icon badge — the "evidence token" of the style (style_analysis §5).
 * A flat-colour circle with a dark outline containing an animal/object cutout.
 */
export type IconBadgeProps = {
  imageUrl: string;
  size?: number;
  circleColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  imageScale?: number; // fraction of badge diameter the cutout occupies
};

export const IconBadge: React.FC<IconBadgeProps> = ({
  imageUrl,
  size = 240,
  circleColor = '#C2CFA5', // sage — canonical badge colour
  outlineColor = INK.line,
  outlineWidth = OUTLINE.object,
  imageScale = 0.72,
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: circleColor,
        border: `${outlineWidth}px solid ${outlineColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Img
        src={imageUrl}
        style={{
          width: size * imageScale,
          height: size * imageScale,
          objectFit: 'contain',
        }}
      />
    </div>
  );
};
