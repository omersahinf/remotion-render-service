import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {resolveField} from '../theme/palette';

/**
 * Flat pastel colour field (the transition system) with an optional subtle paper
 * grain — the only "gradient" the style allows (style_analysis §8 #3). May host
 * a full-frame illustration on top for storybook/diagram-base scenes.
 */
export type SceneBackgroundProps = {
  bgField: string;
  imageUrl?: string;
  grain?: boolean;
  children?: React.ReactNode;
};

// Data-URI 1x1 turbulence tile kept tiny; scaled up for a faint paper texture.
const GRAIN_OVERLAY =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")";

export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  bgField,
  imageUrl,
  grain = true,
  children,
}) => {
  return (
    <AbsoluteFill
      style={{backgroundColor: resolveField(bgField), overflow: 'hidden'}}
    >
      {imageUrl ? (
        <Img
          src={imageUrl}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : null}

      {grain ? (
        <AbsoluteFill
          style={{
            backgroundImage: GRAIN_OVERLAY,
            backgroundRepeat: 'repeat',
            opacity: 0.05,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {children}
    </AbsoluteFill>
  );
};
