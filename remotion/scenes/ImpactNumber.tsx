import React from 'react';
import { Img, interpolate, useCurrentFrame, spring } from 'remotion';
import { FaintResolveText } from '../components/FaintResolveText';
import { CANVAS } from '../theme/tokens';
import type { SceneBaseProps } from '../theme/types';

export type FallingSprite = {
  url: string;
  xFrac: number;
  startFrame: number;
  spinDeg?: number;
};

export type ImpactNumberProps = Omit<SceneBaseProps, 'bgField'> & {
  fallingSprites: FallingSprite[];
  fallDurationFrames?: number;
  numberData: {
    text: string;
    startFrame: number;
    emphasis?: boolean;
  };
};

export const impactNumberDefaults: ImpactNumberProps = {
  durationInFrames: 60,
  fallingSprites: [
    { url: '', xFrac: 0.2, startFrame: 0, spinDeg: 45 },
    { url: '', xFrac: 0.8, startFrame: 10, spinDeg: -30 },
  ],
  fallDurationFrames: 25,
  numberData: {
    text: 'Millions',
    startFrame: 30,
    emphasis: true,
  },
};

export const ImpactNumber: React.FC<ImpactNumberProps> = ({
  fallingSprites,
  fallDurationFrames = 45,
  numberData,
}) => {
  const frame = useCurrentFrame();

  const numberProgress = spring({
    frame: frame - numberData.startFrame,
    fps: 30, // Using standard 30fps for this hardcoded spring
    config: { damping: 14, mass: 1.2 },
  });
  
  const textY = interpolate(numberProgress, [0, 1], [-CANVAS.height, 0]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
      {fallingSprites.map((sprite, i) => {
        const t = (frame - sprite.startFrame) / fallDurationFrames;
        const clampedT = Math.max(0, Math.min(1, t));
        const y = interpolate(clampedT, [0, 1], [-300, CANVAS.height + 300]);
        const rotation = interpolate(clampedT, [0, 1], [0, sprite.spinDeg ?? 90]);

        if (frame < sprite.startFrame || frame > sprite.startFrame + fallDurationFrames + 30) {
          return null;
        }

        return sprite.url ? (
          <Img
            key={i}
            src={sprite.url}
            style={{
              position: 'absolute',
              left: sprite.xFrac * CANVAS.width,
              top: y,
              width: 250,
              transform: `translateX(-50%) rotate(${rotation}deg)`,
            }}
          />
        ) : null;
      })}

      <div
        style={{
          position: 'absolute',
          width: '100%',
          top: CANVAS.height * 0.4,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
          transform: `translateY(${textY}px)`,
        }}
      >
        <FaintResolveText
          startFrame={numberData.startFrame}
          fontSize={200}
          fill={numberData.emphasis ? '#FF3333' : '#FFFFFF'}
        >
          {numberData.text}
        </FaintResolveText>
      </div>
    </div>
  );
};
