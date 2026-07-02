import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { OutlinedText, OutlinedTextProps } from './OutlinedText';

export type FaintResolveTextProps = OutlinedTextProps & {
  startFrame?: number;
  settleFrames?: number;
};

export const FaintResolveText: React.FC<FaintResolveTextProps> = ({
  startFrame = 0,
  settleFrames = 18,
  style,
  ...props
}) => {
  const frame = useCurrentFrame();
  
  const progress = interpolate(
    frame,
    [startFrame, startFrame + settleFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const blurVal = interpolate(progress, [0, 1], [18, 0]);
  const opacityVal = interpolate(progress, [0, 1], [0, 1]);
  const scaleVal = interpolate(progress, [0, 1], [1.06, 1]);

  return (
    <div
      style={{
        opacity: opacityVal,
        filter: `blur(${blurVal}px)`,
        transform: `scale(${scaleVal})`,
        display: 'inline-block',
        ...style,
      }}
    >
      <OutlinedText {...props} />
    </div>
  );
};
