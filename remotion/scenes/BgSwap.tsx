import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame} from 'remotion';
import {SceneBackground} from '../components/SceneBackground';
import {resolveField} from '../theme/palette';
import {CANVAS} from '../theme/tokens';
import type {SceneBaseProps} from '../theme/types';

/**
 * T7 — Background-swap reveal. The subject cutout stays pixel-identical while
 * the background crossfades between states (camouflage reveal, scene switch).
 * Backgrounds may be images or flat palette fields.
 */
export type BgSwapProps = SceneBaseProps & {
  subjectImageUrl: string;
  backgrounds: string[]; // image URLs or palette field keys
  swapFrames: number[]; // frame at which each background after the first arrives
  crossfade?: number;
  subjectSize?: number;
  subjectY?: number;
};

export const bgSwapDefaults: BgSwapProps = {
  bgField: 'sage',
  durationInFrames: 150,
  subjectImageUrl: '',
  backgrounds: ['sage', 'storm'],
  swapFrames: [70],
  crossfade: 18,
  subjectSize: 460,
};

const isImage = (bg: string) => /^https?:\/\//.test(bg) || bg.startsWith('/');

const Layer: React.FC<{bg: string; opacity: number}> = ({bg, opacity}) => {
  if (isImage(bg)) {
    return (
      <Img
        src={bg}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity,
        }}
      />
    );
  }
  return (
    <AbsoluteFill style={{backgroundColor: resolveField(bg), opacity}} />
  );
};

export const BgSwap: React.FC<BgSwapProps> = ({
  bgField,
  subjectImageUrl,
  backgrounds,
  swapFrames,
  crossfade = 18,
  subjectSize = 460,
  subjectY,
}) => {
  const frame = useCurrentFrame();

  const opacityFor = (index: number): number => {
    const arrive = index === 0 ? 0 : swapFrames[index - 1] ?? 0;
    const nextArrive = swapFrames[index];
    const fadeIn =
      index === 0
        ? 1
        : interpolate(frame, [arrive, arrive + crossfade], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
    const fadeOut =
      nextArrive === undefined
        ? 1
        : interpolate(frame, [nextArrive, nextArrive + crossfade], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
    return Math.min(fadeIn, fadeOut);
  };

  const topY = subjectY ?? CANVAS.height / 2 - subjectSize / 2;

  return (
    <SceneBackground bgField={bgField} grain={false}>
      {backgrounds.map((bg, i) => (
        <Layer key={i} bg={bg} opacity={opacityFor(i)} />
      ))}

      {subjectImageUrl ? (
        <Img
          src={subjectImageUrl}
          style={{
            position: 'absolute',
            width: subjectSize,
            left: CANVAS.width / 2 - subjectSize / 2,
            top: topY,
            objectFit: 'contain',
          }}
        />
      ) : null}
    </SceneBackground>
  );
};
