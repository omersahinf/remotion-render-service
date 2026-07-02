import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {SceneBackground} from '../components/SceneBackground';
import {HandLabel} from '../components/HandLabel';
import {INK, SEMANTIC} from '../theme/palette';
import {CANVAS, OUTLINE, SAFE_AREA} from '../theme/tokens';
import type {SceneBaseProps} from '../theme/types';

/**
 * T5b — Chart. Hand-drawn axes with a red curve that draws in left-to-right via
 * stroke-dashoffset. Curve shape is data-driven ('exponential' | 'linear' | an
 * explicit points array). Deterministic; the exponential curve = threat/growth.
 */
export type ChartProps = SceneBaseProps & {
  shape?: 'exponential' | 'linear';
  points?: number[]; // optional explicit y-values 0..1, evenly spaced on x
  curveColor?: string;
  xLabel?: string;
  yLabel?: string;
  drawStartFrame?: number;
  drawEndFrame?: number;
};

export const chartDefaults: ChartProps = {
  bgField: 'butter',
  durationInFrames: 120,
  shape: 'exponential',
  curveColor: SEMANTIC.danger,
  xLabel: 'TIME',
  yLabel: 'POPULATION',
  drawStartFrame: 15,
  drawEndFrame: 95,
};

const buildPoints = (shape: 'exponential' | 'linear', explicit?: number[]) => {
  if (explicit && explicit.length > 1) return explicit;
  const n = 40;
  return Array.from({length: n}).map((_, i) => {
    const x = i / (n - 1);
    return shape === 'exponential' ? Math.pow(x, 2.4) : x;
  });
};

export const Chart: React.FC<ChartProps> = ({
  bgField,
  shape = 'exponential',
  points,
  curveColor = SEMANTIC.danger,
  xLabel,
  yLabel,
  drawStartFrame = 15,
  drawEndFrame = 95,
}) => {
  const frame = useCurrentFrame();

  const plotL = SAFE_AREA.side + 140;
  const plotR = CANVAS.width - SAFE_AREA.side - 60;
  const plotT = SAFE_AREA.top + 60;
  const plotB = CANVAS.height - SAFE_AREA.bottom - 90;
  const plotW = plotR - plotL;
  const plotH = plotB - plotT;

  const ys = buildPoints(shape, points);
  const path = ys
    .map((y, i) => {
      const px = plotL + (i / (ys.length - 1)) * plotW;
      const py = plotB - y * plotH;
      return `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(' ');

  const reveal = interpolate(frame, [drawStartFrame, drawEndFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dashTotal = 4000;

  return (
    <SceneBackground bgField={bgField}>
      <svg
        width={CANVAS.width}
        height={CANVAS.height}
        viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
        style={{position: 'absolute', left: 0, top: 0}}
      >
        {/* Axes — hand-drawn L. */}
        <polyline
          points={`${plotL},${plotT - 20} ${plotL},${plotB} ${plotR + 20},${plotB}`}
          fill="none"
          stroke={INK.line}
          strokeWidth={OUTLINE.object}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Curve draws in. */}
        <path
          d={path}
          fill="none"
          stroke={curveColor}
          strokeWidth={OUTLINE.subject}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dashTotal}
          strokeDashoffset={dashTotal * (1 - reveal)}
        />
      </svg>

      {yLabel ? (
        <div
          style={{
            position: 'absolute',
            left: plotL - 130,
            top: plotT + plotH / 2,
            transform: 'rotate(-90deg)',
            transformOrigin: 'left center',
          }}
        >
          <HandLabel fontSize={34}>{yLabel}</HandLabel>
        </div>
      ) : null}
      {xLabel ? (
        <div
          style={{
            position: 'absolute',
            left: plotL + plotW / 2 - 60,
            top: plotB + 26,
          }}
        >
          <HandLabel fontSize={34}>{xLabel}</HandLabel>
        </div>
      ) : null}
    </SceneBackground>
  );
};
