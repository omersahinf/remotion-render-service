import React from 'react';
import { Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneBackground } from '../components/SceneBackground';
import { CANVAS } from '../theme/tokens';
import type { SceneBaseProps } from '../theme/types';
import { FaintResolveText } from '../components/FaintResolveText';

export type TitleWord = {
  text: string;
  emphasis?: boolean;
};

export type HeroTitleTraverseProps = SceneBaseProps & {
  bgImageUrl?: string;
  poseUrls: string[];
  direction?: 'ltr' | 'rtl';
  subjectSize?: number;
  baseY?: number;
  bobAmplitude?: number;
  bobHz?: number;
  cycleFps?: number;
  parallax?: boolean;
  titleWords: TitleWord[];
  titleStartFrame: number;
  fontSize?: number;
};

export const heroTitleTraverseDefaults: HeroTitleTraverseProps = {
  bgField: 'powder',
  durationInFrames: 132,
  direction: 'ltr',
  subjectSize: 300,
  baseY: 360,
  bobAmplitude: 22,
  bobHz: 4.2,
  cycleFps: 8,
  parallax: true,
  poseUrls: [],
  titleWords: [
    { text: '1 Billion Birds' },
    { text: 'DIE', emphasis: true }
  ],
  titleStartFrame: 40,
  fontSize: 120,
};

export const HeroTitleTraverse: React.FC<HeroTitleTraverseProps> = ({
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
  titleWords,
  titleStartFrame,
  fontSize = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

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

  // Clip path for trail effect
  const birdXRight = x + subjectSize;
  const birdXLeft = x;
  const clipWidth = direction === 'ltr' ? Math.max(0, birdXLeft) : CANVAS.width - birdXRight;
  
  const textClipPath = direction === 'ltr' 
    ? `inset(0 ${CANVAS.width - clipWidth}px 0 0)`
    : `inset(0 0 0 ${CANVAS.width - clipWidth}px)`;

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

      <div
        style={{
          position: 'absolute',
          width: '100%',
          top: CANVAS.height * 0.25,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10,
          clipPath: textClipPath,
        }}
      >
        {titleWords.map((word, i) => (
          <FaintResolveText
            key={i}
            startFrame={titleStartFrame}
            fontSize={fontSize}
            fill={word.emphasis ? '#FF3333' : '#FFFFFF'}
          >
            {word.text}
          </FaintResolveText>
        ))}
      </div>

      {poses[poseIndex] ? (
        <Img
          src={poses[poseIndex]}
          style={{
            position: 'absolute',
            width: subjectSize,
            left: x,
            top: y,
            transform: direction === 'rtl' ? 'scaleX(-1)' : undefined,
            zIndex: 20,
          }}
        />
      ) : null}
    </SceneBackground>
  );
};
