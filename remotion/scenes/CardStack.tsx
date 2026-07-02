import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SceneBackground} from '../components/SceneBackground';
import {OutlinedText} from '../components/OutlinedText';
import {HandLabel} from '../components/HandLabel';
import {INK, resolveField, isDarkField} from '../theme/palette';
import {CANVAS, OUTLINE, SAFE_AREA, SPRING} from '../theme/tokens';
import type {SceneBaseProps} from '../theme/types';

/**
 * T4 — Card stack. Vertical rounded-rect panels slide in left-to-right, one per
 * beat, each with its own pastel background (e.g. LOUD | BRIGHT | TOXIC).
 */
export type CardSpec = {
  title: string;
  label?: string;
  imageUrl?: string;
  bgField: string;
  startFrame: number;
  emphasis?: boolean;
};

export type CardStackProps = SceneBaseProps & {
  cards: CardSpec[];
};

export const cardStackDefaults: CardStackProps = {
  bgField: 'lavender',
  durationInFrames: 150,
  cards: [
    {title: 'LOUD', bgField: 'pink', startFrame: 12},
    {title: 'BRIGHT', bgField: 'butter', startFrame: 30},
    {title: 'TOXIC', bgField: 'sage', startFrame: 48, emphasis: true},
  ],
};

const Card: React.FC<{spec: CardSpec; index: number; total: number}> = ({
  spec,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const gap = 48;
  const usableW = CANVAS.width - SAFE_AREA.side * 2;
  const cardW = Math.min(420, (usableW - gap * (total - 1)) / total);
  const cardH = CANVAS.height - SAFE_AREA.top - SAFE_AREA.bottom - 80;
  const totalW = total * cardW + (total - 1) * gap;
  const startX = (CANVAS.width - totalW) / 2;
  const targetX = startX + index * (cardW + gap);

  const progress = spring({
    frame: frame - spec.startFrame,
    fps,
    config: SPRING.softPop,
  });
  const x = interpolate(progress, [0, 1], [targetX + 120, targetX]);
  const opacity = Math.min(1, progress * 1.6);
  const dark = isDarkField(spec.bgField);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: SAFE_AREA.top + 40,
        width: cardW,
        height: cardH,
        opacity,
        backgroundColor: resolveField(spec.bgField),
        border: `${OUTLINE.object}px solid ${INK.line}`,
        borderRadius: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: spec.imageUrl ? 'space-between' : 'center',
        padding: 36,
        gap: 20,
        boxShadow: '0 18px 0 rgba(33,30,26,0.10)',
      }}
    >
      {spec.imageUrl ? (
        <Img
          src={spec.imageUrl}
          style={{width: '78%', height: '55%', objectFit: 'contain'}}
        />
      ) : null}
      <OutlinedText
        fontSize={64}
        fill={spec.emphasis ? '#DA382F' : '#FFFFFF'}
        stroke={spec.emphasis ? '#7d1610' : dark ? '#000000' : INK.line}
        strokeWidth={OUTLINE.object}
      >
        {spec.title}
      </OutlinedText>
      {spec.label ? <HandLabel>{spec.label}</HandLabel> : null}
    </div>
  );
};

export const CardStack: React.FC<CardStackProps> = ({bgField, cards}) => {
  return (
    <SceneBackground bgField={bgField}>
      <AbsoluteFill>
        {cards.map((spec, i) => (
          <Card key={i} spec={spec} index={i} total={cards.length} />
        ))}
      </AbsoluteFill>
    </SceneBackground>
  );
};
