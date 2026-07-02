import React from 'react';
import {LABEL_FONT} from '../theme/fonts';
import {INK} from '../theme/palette';

/**
 * Thin hand-printed diagram label (style_analysis §3 voice #2). Small dark ink,
 * always attached to a diagram element — no outline, unlike titles.
 */
export type HandLabelProps = {
  children: React.ReactNode;
  fontSize?: number;
  color?: string;
  uppercase?: boolean;
  style?: React.CSSProperties;
};

export const HandLabel: React.FC<HandLabelProps> = ({
  children,
  fontSize = 34,
  color = INK.line,
  uppercase = true,
  style,
}) => {
  return (
    <span
      style={{
        fontFamily: LABEL_FONT,
        fontSize,
        fontWeight: 400,
        color,
        textTransform: uppercase ? 'uppercase' : 'none',
        letterSpacing: '0.02em',
        lineHeight: 1.15,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
