import React from 'react';
import {Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {SceneBackground} from '../components/SceneBackground';
import {CANVAS} from '../theme/tokens';
import type {SceneBaseProps} from '../theme/types';

/**
 * T6 — Character traverse. A cutout subject translates across a static
 * background on a path, cycling through 2–3 poses (wing flap / leg cycle) and
 * bobbing on a sine. Generalised from the proven doodle-bird spike.
 */
export type TraverseProps = SceneBaseProps & {
  bgImageUrl?: string;
  poseUrls: string[];
  direction?: 'ltr' | 'rtl';
  subjectSize?: number;
  baseY?: number; // vertical centre of travel
  bobAmplitude?: number;
  bobHz?: number;
  cycleFps?: number; // pose swaps per second
  parallax?: boolean; // slow background pan opposite to motion
};

export const traverseDefaults: TraverseProps = {
  bgField: 'powder',
  durationInFrames: 120,
  direction: 'ltr',
  subjectSize: 300,
  baseY: 360,
  bobAmplitude: 22,
  bobHz: 4.2,
  cycleFps: 8,
  parallax: true,
  poseUrls: [],
};

export const Traverse: React.FC<TraverseProps> = ({
  bgField,
  bgImageUrl,
  poseUrls,
  direction = 'ltr',
  subjectSize = 300,
  baseY = 360,
  bobAmplitude = 22,
  bobHz = 4.2,
  cycleFps = 8,
  parallax = true,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const poses = poseUrls.length > 0 ? poseUrls : [''];
  const poseIndex = Math.floor((frame * cycleFps) / fps) % poses.length;

  const t = frame / Math.max(1, durationInFrames);
  const fromX = direction === 'ltr' ? -subjectSize : CANVAS.width;
  const toX = direction === 'ltr' ? CANVAS.width : -subjectSize;
  const x = interpolate(t, [0, 1], [fromX, toX]);
  const y = baseY + bobAmplitude * Math.sin((frame / fps) * bobHz);

  const bgW = CANVAS.width * 1.18;
  const panRange = bgW - CANVAS.width;
  const panX = parallax
    ? interpolate(t, [0, 1], direction === 'ltr' ? [0, -panRange] : [-panRange, 0])
    : -(panRange / 2);

  return (
    <SceneBackground bgField={bgField}>
      {bgImageUrl ? (
        <Img
          src={bgImageUrl}
          style={{
            position: 'absolute',
            width: bgW,
            height: CANVAS.height * 1.1,
            left: panX,
            top: -(CANVAS.height * 0.1) / 2,
            objectFit: 'cover',
          }}
        />
      ) : null}

      <Img
        src={poses[poseIndex]}
        style={{
          position: 'absolute',
          width: subjectSize,
          left: x,
          top: y,
          transform: direction === 'rtl' ? 'scaleX(-1)' : undefined,
        }}
      />
    </SceneBackground>
  );
};
