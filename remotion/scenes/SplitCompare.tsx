import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SceneBackground} from '../components/SceneBackground';
import {WavyDivider} from '../components/WavyDivider';
import {HandLabel} from '../components/HandLabel';
import {resolveField} from '../theme/palette';
import {CANVAS, SAFE_AREA, SPRING} from '../theme/tokens';
import type {SceneBaseProps} from '../theme/types';

/**
 * T8 — Split comparison. Two half-frames divided by a hand-drawn wavy divider;
 * the second half slides in after the first (forest vs construction, before/after).
 */
export type SplitHalf = {
  imageUrl?: string;
  bgField: string;
  label?: string;
};

export type SplitCompareProps = SceneBaseProps & {
  left: SplitHalf;
  right: SplitHalf;
  rightStartFrame?: number;
};

export const splitCompareDefaults: SplitCompareProps = {
  bgField: 'sage',
  durationInFrames: 130,
  rightStartFrame: 24,
  left: {bgField: 'sage', label: 'BEFORE'},
  right: {bgField: 'storm', label: 'AFTER'},
};

const Half: React.FC<{
  half: SplitHalf;
  side: 'left' | 'right';
  offsetX: number;
}> = ({half, side, offsetX}) => {
  const halfW = CANVAS.width / 2;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: side === 'left' ? 0 : halfW,
        width: halfW,
        height: CANVAS.height,
        transform: `translateX(${offsetX}px)`,
        backgroundColor: resolveField(half.bgField),
        overflow: 'hidden',
      }}
    >
      {half.imageUrl ? (
        <Img
          src={half.imageUrl}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      ) : null}
      {half.label ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: SAFE_AREA.bottom + 20,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <HandLabel fontSize={46} color="#FFFFFF">
            {half.label}
          </HandLabel>
        </div>
      ) : null}
    </div>
  );
};

export const SplitCompare: React.FC<SplitCompareProps> = ({
  bgField,
  left,
  right,
  rightStartFrame = 24,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = spring({
    frame: frame - rightStartFrame,
    fps,
    config: SPRING.softPop,
  });
  const rightOffset = interpolate(progress, [0, 1], [CANVAS.width / 2, 0]);

  return (
    <SceneBackground bgField={bgField} grain={false}>
      <AbsoluteFill>
        <Half half={left} side="left" offsetX={0} />
        <Half half={right} side="right" offsetX={rightOffset} />
        <WavyDivider orientation="vertical" />
      </AbsoluteFill>
    </SceneBackground>
  );
};
