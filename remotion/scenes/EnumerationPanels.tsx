import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneBackground } from '../components/SceneBackground';
import { CANVAS, OUTLINE } from '../theme/tokens';
import { INK } from '../theme/palette';
import type { SceneBaseProps } from '../theme/types';

export type PanelData = {
  illustrationUrl: string;
  bgField: string;
  startFrame: number;
  label?: string;
};

export type EnumerationPanelsProps = SceneBaseProps & {
  panels: PanelData[];
  panelW?: number;
  gap?: number;
  dropFromTop?: boolean;
};

export const enumerationPanelsDefaults: EnumerationPanelsProps = {
  bgField: 'cream',
  durationInFrames: 160,
  panels: [
    { illustrationUrl: '', bgField: 'powder', startFrame: 10 },
    { illustrationUrl: '', bgField: 'lavender', startFrame: 40 },
    { illustrationUrl: '', bgField: 'mint', startFrame: 70 },
    { illustrationUrl: '', bgField: 'sun', startFrame: 100 },
  ],
  panelW: 340,
  gap: 60,
  dropFromTop: true,
};

export const EnumerationPanels: React.FC<EnumerationPanelsProps> = ({
  bgField,
  panels,
  panelW = 340,
  gap = 60,
  dropFromTop = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalW = panels.length * panelW + (panels.length - 1) * gap;
  const startX = (CANVAS.width - totalW) / 2;
  const panelH = panelW * 1.4;
  const panelY = (CANVAS.height - panelH) / 2;

  return (
    <SceneBackground bgField={bgField}>
      {panels.map((p, i) => {
        const progress = spring({
          frame: frame - p.startFrame,
          fps,
          config: { damping: 14, mass: 0.8, stiffness: 120 },
        });

        const fromTop = i % 2 === 0;
        const yOffset = interpolate(progress, [0, 1], [fromTop ? -CANVAS.height : CANVAS.height, 0]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: startX + i * (panelW + gap),
              top: panelY + yOffset,
              width: panelW,
              height: panelH,
              backgroundColor: `var(--${p.bgField})`,
              border: `${OUTLINE.subject}px solid ${INK.line}`,
              borderRadius: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 1,
            }}
          >
            {p.illustrationUrl ? (
              <Img
                src={p.illustrationUrl}
                style={{
                  width: panelW * 0.8,
                  height: panelW * 0.8,
                  objectFit: 'contain',
                }}
              />
            ) : null}
            {p.label && (
              <div style={{ position: 'absolute', bottom: -60, fontSize: 40, fontFamily: 'Baloo 2', color: INK.line }}>
                {p.label}
              </div>
            )}
          </div>
        );
      })}
    </SceneBackground>
  );
};
