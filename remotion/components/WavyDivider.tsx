import React from 'react';
import {CANVAS, OUTLINE} from '../theme/tokens';
import {INK} from '../theme/palette';

/**
 * Hand-drawn wavy divider for split comparisons (style_analysis §5 device #5).
 * Vertical by default; a gentle sine wobble keeps it from reading as a UI line.
 */
export type WavyDividerProps = {
  orientation?: 'vertical' | 'horizontal';
  color?: string;
  strokeWidth?: number;
  amplitude?: number;
  wavelength?: number;
};

export const WavyDivider: React.FC<WavyDividerProps> = ({
  orientation = 'vertical',
  color = INK.line,
  strokeWidth = OUTLINE.object,
  amplitude = 18,
  wavelength = 160,
}) => {
  const {width, height} = CANVAS;
  const vertical = orientation === 'vertical';
  const length = vertical ? height : width;
  const steps = Math.ceil(length / 8);

  const points = Array.from({length: steps + 1}).map((_, i) => {
    const along = (i / steps) * length;
    const offset = amplitude * Math.sin((along / wavelength) * Math.PI * 2);
    const cx = vertical ? width / 2 + offset : along;
    const cy = vertical ? along : height / 2 + offset;
    return `${cx.toFixed(1)},${cy.toFixed(1)}`;
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{position: 'absolute', left: 0, top: 0}}
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
