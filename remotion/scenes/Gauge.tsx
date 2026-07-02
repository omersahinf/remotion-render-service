import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {SceneBackground} from '../components/SceneBackground';
import {HandLabel} from '../components/HandLabel';
import {OutlinedText} from '../components/OutlinedText';
import {INK, SEMANTIC} from '../theme/palette';
import {CANVAS, OUTLINE, SAFE_AREA} from '../theme/tokens';
import type {SceneBaseProps} from '../theme/types';

/**
 * T5a — Gauge / bar. Hand-drawn rect that fills or drains over a frame window,
 * with an optional sliding marker triangle. Deterministic — no AI art, no baked
 * video. Colour interpolates green→red as the value crosses into danger.
 */
export type GaugeProps = SceneBaseProps & {
  orientation?: 'vertical' | 'horizontal';
  label?: string;
  fromValue?: number; // 0..1 at animation start
  toValue?: number; // 0..1 at animation end
  animStartFrame?: number;
  animEndFrame?: number;
  showMarker?: boolean;
  dangerAbove?: number; // value threshold where fill reads as bad
  title?: string;
};

export const gaugeDefaults: GaugeProps = {
  bgField: 'sage',
  durationInFrames: 120,
  orientation: 'vertical',
  label: 'OXYGEN LEVEL',
  fromValue: 0.9,
  toValue: 0.25,
  animStartFrame: 20,
  animEndFrame: 90,
  showMarker: true,
  dangerAbove: 0.6,
};

export const Gauge: React.FC<GaugeProps> = ({
  bgField,
  orientation = 'vertical',
  label,
  title,
  fromValue = 0.9,
  toValue = 0.25,
  animStartFrame = 20,
  animEndFrame = 90,
  showMarker = true,
  dangerAbove = 0.6,
}) => {
  const frame = useCurrentFrame();
  const vertical = orientation === 'vertical';

  const value = interpolate(
    frame,
    [animStartFrame, animEndFrame],
    [fromValue, toValue],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Colour: below threshold reads good (green), above reads bad (red).
  const t = Math.min(1, Math.max(0, (value - dangerAbove) / (1 - dangerAbove)));
  const fillColor = value >= dangerAbove ? SEMANTIC.gaugeBad : SEMANTIC.gaugeGood;

  const trackLen = vertical ? 620 : 900;
  const trackThick = 130;
  const cx = CANVAS.width / 2;
  const cy = CANVAS.height / 2 + 10;
  const trackW = vertical ? trackThick : trackLen;
  const trackH = vertical ? trackLen : trackThick;
  const left = cx - trackW / 2;
  const top = cy - trackH / 2;

  const fillW = vertical ? trackW : trackLen * value;
  const fillH = vertical ? trackLen * value : trackH;

  const markerPos = trackLen * value;

  return (
    <SceneBackground bgField={bgField}>
      {title ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: SAFE_AREA.top}}>
          <OutlinedText fontSize={72} strokeWidth={OUTLINE.object}>
            {title}
          </OutlinedText>
        </AbsoluteFill>
      ) : null}

      {/* Track */}
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: trackW,
          height: trackH,
          border: `${OUTLINE.object}px solid ${INK.line}`,
          borderRadius: 26,
          backgroundColor: 'rgba(255,255,255,0.55)',
          overflow: 'hidden',
        }}
      >
        {/* Fill grows from the bottom (vertical) or left (horizontal). */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: fillW,
            height: fillH,
            backgroundColor: fillColor,
          }}
        />
      </div>

      {/* Sliding marker triangle. */}
      {showMarker ? (
        <div
          style={{
            position: 'absolute',
            left: vertical ? left - 46 : left + markerPos - 14,
            top: vertical ? top + trackLen - markerPos - 14 : top - 46,
            width: 0,
            height: 0,
            borderLeft: vertical ? '28px solid ' + INK.line : '16px solid transparent',
            borderRight: vertical ? 'none' : '16px solid transparent',
            borderTop: vertical ? '16px solid transparent' : '28px solid ' + INK.line,
            borderBottom: vertical ? '16px solid transparent' : 'none',
          }}
        />
      ) : null}

      {label ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: top + trackH + 30,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <HandLabel fontSize={40}>{label}</HandLabel>
        </div>
      ) : null}
    </SceneBackground>
  );
};
