import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { resolveField } from '../theme/palette';
import { CANVAS } from '../theme/tokens';
import type { SceneBaseProps } from '../theme/types';

/**
 * SceneComposite — the deterministic compositor for the Past Tense "held scene +
 * timed overlays" method (see niche scene cards: held-subject-label-reveal,
 * scene-text-reveal, suspense-blur-connector, still).
 *
 * Style lives in the gpt-image-2 PIXELS (bg + every overlay incl. text is an image).
 * This composition ONLY places / times / effects — it draws no illustration and uses
 * no font. Overlays HARD-APPEAR (no entrance animation) at their startFrame, matching
 * the reference channel. Optional full-frame gaussian blur (suspense beats) and a
 * mandatory-by-default vibrance pass (raw gpt-image-2 reads a bit washed-out).
 */

export type CompositeOverlay = {
  /** PNG/cutout or color-keyed text image URL (MinIO). */
  url: string;
  /** Center X as a fraction of canvas width (0..1). */
  xFrac: number;
  /** Center Y as a fraction of canvas height (0..1). */
  yFrac: number;
  /** Width as a fraction of canvas width (0..1); height keeps aspect. */
  wFrac: number;
  /** Frame it appears on (hard cut). 0 = present from the start ("baked"/hold). */
  startFrame?: number;
};

export type SceneCompositeProps = SceneBaseProps & {
  /** Full-frame background illustration (gpt-image-2). If absent, the flat field fills. */
  bgUrl?: string;
  /** Timed overlay images (icons via rembg, text via magenta color-key). */
  overlays?: CompositeOverlay[];
  /** Full-frame gaussian blur on the BACKGROUND only (overlays stay sharp). */
  blur?: { radius: number; startFrame?: number };
  /** Final full-frame vibrance pass. Defaults applied so output isn't washed-out. */
  vibrance?: { saturate?: number; contrast?: number };
  grain?: boolean;
};

export const sceneCompositeDefaults: SceneCompositeProps = {
  bgField: 'butter',
  durationInFrames: 120,
  bgUrl: undefined,
  overlays: [],
  blur: undefined,
  vibrance: { saturate: 1.32, contrast: 1.1 },
  grain: true,
};

const GRAIN_OVERLAY =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")";

export const SceneComposite: React.FC<SceneCompositeProps> = ({
  bgField,
  bgUrl,
  overlays = [],
  blur,
  vibrance,
  grain = true,
}) => {
  const frame = useCurrentFrame();
  const sat = vibrance?.saturate ?? 1.32;
  const con = vibrance?.contrast ?? 1.1;
  const blurOn = blur && frame >= (blur.startFrame ?? 0);
  const bgFilter = blurOn ? `blur(${blur!.radius}px)` : undefined;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: resolveField(bgField),
        overflow: 'hidden',
        filter: `saturate(${sat}) contrast(${con})`,
      }}
    >
      {/* Background illustration (blurrable) */}
      {bgUrl ? (
        <Img
          src={bgUrl}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: bgFilter,
          }}
        />
      ) : null}

      {/* Timed overlay images — hard appear at startFrame, centered by fraction */}
      {overlays.map((o, i) => {
        if (frame < (o.startFrame ?? 0)) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: o.xFrac * CANVAS.width,
              top: o.yFrac * CANVAS.height,
              width: o.wFrac * CANVAS.width,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Img src={o.url} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        );
      })}

      {/* Paper grain (subtle) */}
      {grain ? (
        <AbsoluteFill
          style={{
            backgroundImage: GRAIN_OVERLAY,
            backgroundRepeat: 'repeat',
            opacity: 0.05,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
