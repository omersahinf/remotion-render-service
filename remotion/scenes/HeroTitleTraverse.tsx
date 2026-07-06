import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneBackground } from '../components/SceneBackground';
import { FaintResolveText } from '../components/FaintResolveText';
import { CANVAS } from '../theme/tokens';
import { SEMANTIC } from '../theme/palette';
import type { SceneBaseProps } from '../theme/types';

export type TitleWord = { text: string; emphasis?: boolean };

export type HeroTitleTraverseProps = SceneBaseProps & {
  bgImageUrl?: string;
  poseUrls: string[];
  direction?: 'ltr' | 'rtl';
  subjectSize?: number;
  baseY?: number;
  bobAmplitude?: number;
  bobHz?: number;
  parallax?: boolean;
  titleWords: TitleWord[];
  titleStartFrame: number;
  lineStaggerFrames?: number;
  fontSize?: number;
};

export const heroTitleTraverseDefaults: HeroTitleTraverseProps = {
  bgField: 'powder',
  durationInFrames: 132,
  bgImageUrl: staticFile('assets/skyline_bg.png'),
  poseUrls: [
    staticFile('assets/bird_pose_1.png'),
  ],
  direction: 'ltr',
  subjectSize: 210,
  baseY: 520,
  bobAmplitude: 22,
  bobHz: 4.2,
  parallax: true,
  titleWords: [
    { text: '1 Billion Birds' },
    { text: 'DIE', emphasis: true },
  ],
  titleStartFrame: 30,
  lineStaggerFrames: 26,
  fontSize: 130,
};

export const HeroTitleTraverse: React.FC<HeroTitleTraverseProps> = ({
  bgField,
  bgImageUrl,
  poseUrls,
  direction = 'ltr',
  subjectSize = 210,
  baseY = 520,
  bobAmplitude = 22,
  bobHz = 4.2,
  parallax = true,
  titleWords,
  titleStartFrame,
  lineStaggerFrames = 26,
  fontSize = 130,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const birdUrl = poseUrls[0] ?? '';

  const t = frame / Math.max(1, durationInFrames);
  const fromX = direction === 'ltr' ? -subjectSize : CANVAS.width;
  const toX = direction === 'ltr' ? CANVAS.width : -subjectSize;
  const x = interpolate(t, [0, 1], [fromX, toX]);
  const y = baseY + bobAmplitude * Math.sin((frame / fps) * bobHz);
  const tilt = 3 * Math.sin((frame / fps) * bobHz * 0.5);

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

      {/* Başlık: 2 satır, soluk-çözülür; DIE kırmızı altında ortalı; burst/tick YOK */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          top: CANVAS.height * 0.16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          zIndex: 10,
        }}
      >
        {titleWords.map((word, i) => (
          <FaintResolveText
            key={i}
            startFrame={titleStartFrame + i * lineStaggerFrames}
            settleFrames={22}
            fontSize={word.emphasis ? Math.round(fontSize * 1.08) : fontSize}
            fill={word.emphasis ? SEMANTIC.danger : '#FFFFFF'}
          >
            {word.text}
          </FaintResolveText>
        ))}
      </div>

      {birdUrl ? (
        <Img
          src={birdUrl}
          style={{
            position: 'absolute',
            width: subjectSize,
            left: x,
            top: y,
            transform: `${direction === 'rtl' ? 'scaleX(-1) ' : ''}rotate(${tilt}deg)`,
            transformOrigin: 'center',
            zIndex: 20,
          }}
        />
      ) : null}
    </SceneBackground>
  );
};
