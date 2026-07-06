import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { SceneBackground } from '../components/SceneBackground';
import { CANVAS, SPRING } from '../theme/tokens';
import type { SceneBaseProps } from '../theme/types';

export type PanelData = {
  illustrationUrl: string;
  startFrame: number;
};

export type EnumerationPanelsProps = SceneBaseProps & {
  panels: PanelData[];
  panelW?: number;
  gap?: number;
};

export const enumerationPanelsDefaults: EnumerationPanelsProps = {
  bgField: 'cream',
  durationInFrames: 160,
  panels: [
    { illustrationUrl: staticFile('assets/panel1_buildings_1783025228371.jpg'), startFrame: 15 },
    { illustrationUrl: staticFile('assets/panel2_tower_1783025234491.jpg'), startFrame: 45 },
    { illustrationUrl: staticFile('assets/panel3_turbine_1783025240590.jpg'), startFrame: 75 },
    { illustrationUrl: staticFile('assets/panel4_pylon_1783025246504.jpg'), startFrame: 105 },
  ],
  panelW: 440,
  gap: 28,
};

export const EnumerationPanels: React.FC<EnumerationPanelsProps> = ({
  bgField,
  panels,
  panelW = 440,
  gap = 28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalW = panels.length * panelW + (panels.length - 1) * gap;
  const startX = (CANVAS.width - totalW) / 2;
  const panelH = 880;
  const panelY = (CANVAS.height - panelH) / 2;

  return (
    <SceneBackground bgField={bgField}>
      {panels.map((p, i) => {
        const progress = spring({
          frame: frame - p.startFrame,
          fps,
          config: SPRING.softPop,
        });

        // Alternating drop: Even = fromTop, Odd = fromBottom
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
              borderRadius: '40px',
              border: '4px solid #211E1A',
              overflow: 'hidden',
              boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
            }}
          >
            {p.illustrationUrl ? (
              <Img
                src={p.illustrationUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : null}
          </div>
        );
      })}
    </SceneBackground>
  );
};
