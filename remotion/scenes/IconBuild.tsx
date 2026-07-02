import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {SceneBackground} from '../components/SceneBackground';
import {IconBadge} from '../components/IconBadge';
import {HandLabel} from '../components/HandLabel';
import {PopIn} from '../components/PopIn';
import {CANVAS, SAFE_AREA} from '../theme/tokens';
import type {SceneBaseProps} from '../theme/types';

/**
 * T3 — Icon build. Circular evidence badges pop in one per narration beat. They
 * arrange either in a ring around an optional centre subject (e.g. a focal
 * animal cutout) or on a centred grid. Each badge lands as its animal is named.
 */
export type BadgeSpec = {
  imageUrl: string;
  label?: string;
  startFrame: number;
  circleColor?: string;
};

export type IconBuildProps = SceneBaseProps & {
  badges: BadgeSpec[];
  centerImageUrl?: string;
  layout?: 'ring' | 'grid';
  badgeSize?: number;
};

export const iconBuildDefaults: IconBuildProps = {
  bgField: 'butter',
  durationInFrames: 150,
  layout: 'ring',
  badgeSize: 210,
  badges: [
    {imageUrl: '', label: 'MAGPIE', startFrame: 12},
    {imageUrl: '', label: 'RAT', startFrame: 30},
    {imageUrl: '', label: 'CROW', startFrame: 48},
    {imageUrl: '', label: 'FOX', startFrame: 66},
  ],
};

const positionFor = (
  index: number,
  total: number,
  layout: 'ring' | 'grid',
  badgeSize: number,
): {left: number; top: number} => {
  const cx = CANVAS.width / 2;
  const cy = CANVAS.height / 2 - 20;

  if (layout === 'ring') {
    const radius = Math.min(360, 220 + total * 14);
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    return {
      left: cx + radius * Math.cos(angle) - badgeSize / 2,
      top: cy + radius * Math.sin(angle) - badgeSize / 2,
    };
  }

  const cols = Math.min(4, total);
  const rows = Math.ceil(total / cols);
  const gap = badgeSize * 0.5;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const gridW = cols * badgeSize + (cols - 1) * gap;
  const gridH = rows * badgeSize + (rows - 1) * gap;
  return {
    left: cx - gridW / 2 + col * (badgeSize + gap),
    top: cy - gridH / 2 + row * (badgeSize + gap),
  };
};

export const IconBuild: React.FC<IconBuildProps> = ({
  bgField,
  badges,
  centerImageUrl,
  layout = 'ring',
  badgeSize = 210,
}) => {
  return (
    <SceneBackground bgField={bgField}>
      {centerImageUrl ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <Img
            src={centerImageUrl}
            style={{width: 300, height: 300, objectFit: 'contain'}}
          />
        </AbsoluteFill>
      ) : null}

      {badges.map((badge, i) => {
        const {left, top} = positionFor(i, badges.length, layout, badgeSize);
        const clampedTop = Math.min(
          top,
          CANVAS.height - SAFE_AREA.bottom - badgeSize,
        );
        return (
          <div key={i} style={{position: 'absolute', left, top: clampedTop}}>
            <PopIn startFrame={badge.startFrame}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <IconBadge
                  imageUrl={badge.imageUrl}
                  size={badgeSize}
                  circleColor={badge.circleColor}
                />
                {badge.label ? <HandLabel>{badge.label}</HandLabel> : null}
              </div>
            </PopIn>
          </div>
        );
      })}
    </SceneBackground>
  );
};
