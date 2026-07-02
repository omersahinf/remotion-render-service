import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {SceneBackground} from '../components/SceneBackground';
import {HandLabel} from '../components/HandLabel';
import {PopIn} from '../components/PopIn';
import {INK, SEMANTIC} from '../theme/palette';
import {CANVAS, OUTLINE} from '../theme/tokens';
import type {SceneBaseProps} from '../theme/types';

/**
 * T9 — Diagram markup. A base illustration with red hand-drawn markup popping in
 * on beats: X crosses, prohibition circles, emphasis arrows, thought bubbles.
 * Reads as "the narrator drawing on the frame" (style_analysis §5 device #8).
 */
export type MarkupElement =
  | {kind: 'x'; x: number; y: number; size?: number; startFrame: number; color?: string}
  | {kind: 'ban'; x: number; y: number; size?: number; startFrame: number; color?: string}
  | {
      kind: 'arrow';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      startFrame: number;
      color?: string;
    }
  | {kind: 'bubble'; x: number; y: number; text: string; startFrame: number};

export type MarkupProps = SceneBaseProps & {
  baseImageUrl?: string;
  elements: MarkupElement[];
};

export const markupDefaults: MarkupProps = {
  bgField: 'sage',
  durationInFrames: 130,
  elements: [
    {kind: 'x', x: 700, y: 480, size: 180, startFrame: 20},
    {kind: 'arrow', x1: 1150, y1: 300, x2: 1000, y2: 520, startFrame: 44},
    {kind: 'bubble', x: 1250, y: 260, text: '= ENEMY', startFrame: 70},
  ],
};

const Cross: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <line x1={size * 0.15} y1={size * 0.15} x2={size * 0.85} y2={size * 0.85} stroke={color} strokeWidth={OUTLINE.subject} strokeLinecap="round" />
    <line x1={size * 0.85} y1={size * 0.15} x2={size * 0.15} y2={size * 0.85} stroke={color} strokeWidth={OUTLINE.subject} strokeLinecap="round" />
  </svg>
);

const Ban: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <circle cx={size / 2} cy={size / 2} r={size * 0.4} fill="none" stroke={color} strokeWidth={OUTLINE.subject} />
    <line x1={size * 0.22} y1={size * 0.22} x2={size * 0.78} y2={size * 0.78} stroke={color} strokeWidth={OUTLINE.subject} strokeLinecap="round" />
  </svg>
);

const Arrow: React.FC<{el: Extract<MarkupElement, {kind: 'arrow'}>; reveal: number}> = ({el, reveal}) => {
  const color = el.color ?? SEMANTIC.danger;
  const x2 = el.x1 + (el.x2 - el.x1) * reveal;
  const y2 = el.y1 + (el.y2 - el.y1) * reveal;
  const angle = Math.atan2(y2 - el.y1, x2 - el.x1);
  const head = 26;
  return (
    <svg width={CANVAS.width} height={CANVAS.height} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={el.x1} y1={el.y1} x2={x2} y2={y2} stroke={color} strokeWidth={OUTLINE.object} strokeLinecap="round" />
      {reveal > 0.6 ? (
        <>
          <line x1={x2} y1={y2} x2={x2 - head * Math.cos(angle - 0.5)} y2={y2 - head * Math.sin(angle - 0.5)} stroke={color} strokeWidth={OUTLINE.object} strokeLinecap="round" />
          <line x1={x2} y1={y2} x2={x2 - head * Math.cos(angle + 0.5)} y2={y2 - head * Math.sin(angle + 0.5)} stroke={color} strokeWidth={OUTLINE.object} strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
};

export const Markup: React.FC<MarkupProps> = ({bgField, baseImageUrl, elements}) => {
  const frame = useCurrentFrame();

  return (
    <SceneBackground bgField={bgField} imageUrl={baseImageUrl} grain={!baseImageUrl}>
      {elements.map((el, i) => {
        if (el.kind === 'arrow') {
          const reveal = interpolate(frame, [el.startFrame, el.startFrame + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          if (frame < el.startFrame) return null;
          return <Arrow key={i} el={el} reveal={reveal} />;
        }

        if (el.kind === 'bubble') {
          return (
            <div key={i} style={{position: 'absolute', left: el.x, top: el.y}}>
              <PopIn startFrame={el.startFrame}>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: `${OUTLINE.object}px solid ${INK.line}`,
                    borderRadius: 40,
                    padding: '18px 30px',
                  }}
                >
                  <HandLabel fontSize={40}>{el.text}</HandLabel>
                </div>
              </PopIn>
            </div>
          );
        }

        const size = el.size ?? 180;
        const color = el.color ?? SEMANTIC.danger;
        return (
          <div key={i} style={{position: 'absolute', left: el.x - size / 2, top: el.y - size / 2}}>
            <PopIn startFrame={el.startFrame} from={0.4}>
              {el.kind === 'x' ? <Cross size={size} color={color} /> : <Ban size={size} color={color} />}
            </PopIn>
          </div>
        );
      })}
    </SceneBackground>
  );
};
