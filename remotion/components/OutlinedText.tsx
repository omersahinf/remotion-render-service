import React from 'react';
import {TITLE_FONT} from '../theme/fonts';
import {INK} from '../theme/palette';
import {OUTLINE} from '../theme/tokens';

/**
 * Rounded-bold title text with a dark wobbly-style stroke, drawn stroke-under-fill
 * (paintOrder) so the outline never eats the letter. White fill by default;
 * emphasis words swap to a saturated fill with a darker stroke.
 */
export type OutlinedTextProps = {
  children: React.ReactNode;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontFamily?: string;
  style?: React.CSSProperties;
};

export const OutlinedText: React.FC<OutlinedTextProps> = ({
  children,
  fontSize = 120,
  fill = '#FFFFFF',
  stroke = INK.line,
  strokeWidth = OUTLINE.subject,
  fontFamily = TITLE_FONT,
  style,
}) => {
  return (
    <span
      style={{
        fontFamily,
        fontSize,
        fontWeight: 800,
        color: fill,
        WebkitTextStroke: `${strokeWidth}px ${stroke}`,
        paintOrder: 'stroke',
        lineHeight: 1.04,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
};
