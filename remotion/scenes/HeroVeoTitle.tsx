import React, { useMemo } from 'react';
import { AbsoluteFill, OffthreadVideo, interpolate, Easing, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { OutlinedText } from '../components/OutlinedText';
import { TITLE_FONT } from '../theme/fonts';
import { SEMANTIC } from '../theme/palette';
import { CANVAS } from '../theme/tokens';
import type { SceneBaseProps } from '../theme/types';

export type HeroVeoTitleProps = SceneBaseProps & {
  plateUrl: string;
  line1: string;
  line2: string;
  birdStartX: number;
  birdEndX: number;
  triggerOffsetPx?: number;   // harf, kuş bu kadar geçince belirir (+ = biraz sonra)
  letterFadeFrames?: number;  // her harfin yerinde soluk→dolu süresi (küçük = "bir anda")
  revealSpeed?: number;       // >1 = daha hızlı reveal
  line2StartFrame: number;
  line2StaggerFrames?: number;
  line2FadeFrames?: number;
  fontSize?: number;
};

export const heroVeoTitleDefaults: HeroVeoTitleProps = {
  bgField: 'powder',
  durationInFrames: 180,      // 6sn@30
  plateUrl: staticFile('assets/plate_v2.mp4'),               // ← plate_v2.mp4
  line1: '1 Billion Birds',
  line2: 'DIE',
  birdStartX: 400,
  birdEndX: 1750,
  triggerOffsetPx: 10,
  letterFadeFrames: 4,        // ~0.13sn: soluk başlayıp bir anda dolar
  revealSpeed: 1.25,          // reveal'ı biraz hızlandır (kuştan hafif öne alabilir)
  line2StartFrame: 120,       // DIE, kuş sağa geçince
  line2StaggerFrames: 3,
  line2FadeFrames: 9,
  fontSize: 130,
};

// Her harfin merkez ekran-X'ini ölç (font metrikleriyle)
const measureCenters = (text: string, fontPx: number, fontFamily: string): number[] => {
  const fallback = [...text].map(() => fontPx * 0.55);
  let widths = fallback;
  if (typeof document !== 'undefined') {
    const ctx = document.createElement('canvas').getContext('2d');
    if (ctx) {
      ctx.font = `800 ${fontPx}px ${fontFamily}`;
      widths = [...text].map((ch) => ctx.measureText(ch === ' ' ? '\u00A0' : ch).width);
    }
  }
  const total = widths.reduce((a, b) => a + b, 0);
  let cum = (CANVAS.width - total) / 2;
  return widths.map((w) => { const cx = cum + w / 2; cum += w; return cx; });
};

export const HeroVeoTitle: React.FC<HeroVeoTitleProps> = ({
  plateUrl, line1, line2, birdStartX, birdEndX,
  triggerOffsetPx = 10, letterFadeFrames = 4, revealSpeed = 1.25,
  line2StartFrame = 120, line2StaggerFrames = 3, line2FadeFrames = 9, fontSize = 130,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const chars = useMemo(() => [...line1], [line1]);
  const centers = useMemo(() => measureCenters(line1, fontSize, TITLE_FONT), [line1, fontSize]);

  // kuş X'i (kareye göre) → her harfin tetiklendiği kare
  const span = birdEndX - birdStartX;
  const triggerFrameFor = (cx: number) => (((cx + triggerOffsetPx - birdStartX) / span) * durationInFrames) / revealSpeed;

  const fadeIn = (start: number, dur: number) =>
    interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad),
    });

  return (
    <AbsoluteFill>
      {plateUrl ? <OffthreadVideo src={plateUrl} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} /> : null}

      <div style={{ position: 'absolute', width: '100%', top: CANVAS.height * 0.30, zIndex: 10, textAlign: 'center' }}>
        {/* line1: harf harf, YERİNDE fade-in, kuşa senkron */}
        <div style={{ whiteSpace: 'pre' }}>
          {chars.map((ch, i) => (
            <span key={i} style={{ opacity: fadeIn(triggerFrameFor(centers[i]), letterFadeFrames) }}>
              <OutlinedText fontSize={fontSize} fill="#FFFFFF">{ch}</OutlinedText>
            </span>
          ))}
        </div>
        {/* DIE: kuş gittikten sonra, harf harf yerinde fade-in (yavaş) */}
        <div style={{ marginTop: 8, whiteSpace: 'pre' }}>
          {[...line2].map((ch, i) => (
            <span key={i} style={{ opacity: fadeIn(line2StartFrame + i * line2StaggerFrames, line2FadeFrames) }}>
              <OutlinedText fontSize={Math.round(fontSize * 1.08)} fill={SEMANTIC.danger}>{ch}</OutlinedText>
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
