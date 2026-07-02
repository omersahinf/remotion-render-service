import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneBackground } from '../components/SceneBackground';
import { OutlinedText } from '../components/OutlinedText';
import { PopIn } from '../components/PopIn';
import { RadiatingTicks } from '../components/RadiatingTicks';
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
  cycleFps?: number;
  parallax?: boolean;
  titleWords: TitleWord[];
  titleStartFrame: number;
  wordStaggerFrames?: number;
  fontSize?: number;
};

export const heroTitleTraverseDefaults: HeroTitleTraverseProps = {
  bgField: 'powder',
  durationInFrames: 132,
  bgImageUrl: staticFile('assets/skyline_bg.png'),
  poseUrls: [
    staticFile('assets/bird_pose_1.png'),
    staticFile('assets/bird_pose_2.png'),
    staticFile('assets/bird_pose_3.png'),
  ],
  direction: 'ltr',
  subjectSize: 300,
  baseY: 520,
  bobAmplitude: 22,
  bobHz: 4.2,
  cycleFps: 8,
  parallax: true,
  titleWords: [
    { text: '1 Billion Birds' },
    { text: 'DIE', emphasis: true },
  ],
  titleStartFrame: 30,
  wordStaggerFrames: 12,
  fontSize: 130,
};

export const HeroTitleTraverse: React.FC<HeroTitleTraverseProps> = ({
  bgField,
  bgImageUrl,
  poseUrls,
  direction = 'ltr',
  subjectSize = 300,
  baseY = 520,
  bobAmplitude = 22,
  bobHz = 4.2,
  cycleFps = 8,
  parallax = true,
  titleWords,
  titleStartFrame,
  wordStaggerFrames = 12,
  fontSize = 130,
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

      {/* Başlık: kelime-kelime additive pop-in; kırmızı vurgu kelimesi en son + ticks */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          top: CANVAS.height * 0.22,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 28,
          zIndex: 10,
        }}
      >
        {titleWords.map((word, i) => {
          const startFrame = titleStartFrame + i * wordStaggerFrames;
          return (
            <div key={i} style={{ position: 'relative' }}>
              <PopIn startFrame={startFrame} from={0.7}>
                <OutlinedText
                  fontSize={fontSize}
                  fill={word.emphasis ? SEMANTIC.danger : '#FFFFFF'}
                >
                  {word.text}
                </OutlinedText>
              </PopIn>
              {word.emphasis ? (
                <div style={{ position: 'absolute', left: '50%', top: '50%' }}>
                  <RadiatingTicks startFrame={startFrame} radius={110} />
                </div>
              ) : null}
            </div>
          );
        })}
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
