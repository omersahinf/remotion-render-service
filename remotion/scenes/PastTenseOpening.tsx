import React from 'react';
import { Sequence, useVideoConfig, staticFile } from 'remotion';
import { HeroTitleTraverse, HeroTitleTraverseProps, heroTitleTraverseDefaults } from './HeroTitleTraverse';
import { EnumerationPanels, EnumerationPanelsProps, enumerationPanelsDefaults } from './EnumerationPanels';
import { ImpactNumber, ImpactNumberProps, impactNumberDefaults } from './ImpactNumber';
import type { SceneBaseProps } from '../theme/types';

export type PastTenseOpeningProps = SceneBaseProps & {
  heroProps: HeroTitleTraverseProps;
  panelsProps: EnumerationPanelsProps;
  impactProps: ImpactNumberProps;
  cutFrame: number;
};

export const pastTenseOpeningDefaults: PastTenseOpeningProps = {
  bgField: 'cream',
  durationInFrames: 366, // 12.2s @ 30fps
  heroProps: {
    ...heroTitleTraverseDefaults,
    bgImageUrl: staticFile('assets/skyline_bg.png'),
    poseUrls: [staticFile('assets/bird_pose_1.png'), staticFile('assets/bird_pose_2.png'), staticFile('assets/bird_pose_3.png')],
  },
  panelsProps: {
    ...enumerationPanelsDefaults,
    panels: [
      { illustrationUrl: staticFile('assets/panel_buildings.png'), bgField: 'powder', startFrame: 10 },
      { illustrationUrl: staticFile('assets/panel_tower.png'), bgField: 'lavender', startFrame: 40 },
      { illustrationUrl: staticFile('assets/panel_windmill.png'), bgField: 'mint', startFrame: 70 },
      { illustrationUrl: staticFile('assets/panel_pylon.png'), bgField: 'sun', startFrame: 100 },
    ],
  },
  impactProps: {
    ...impactNumberDefaults,
    fallingSprites: [
      { url: staticFile('assets/dead_bird.png'), xFrac: 0.3, startFrame: 0, spinDeg: 45 },
      { url: staticFile('assets/dead_bird.png'), xFrac: 0.7, startFrame: 10, spinDeg: -30 },
      { url: staticFile('assets/dead_bird.png'), xFrac: 0.5, startFrame: 20, spinDeg: 120 },
    ],
    fallDurationFrames: 25,
    numberData: { text: 'Millions', startFrame: 30, emphasis: true },
  },
  cutFrame: 132,
};

export const PastTenseOpening: React.FC<PastTenseOpeningProps> = ({
  heroProps,
  panelsProps,
  impactProps,
  cutFrame = 132,
}) => {
  const { durationInFrames } = useVideoConfig();
  const remainder = durationInFrames - cutFrame;

  return (
    <>
      <Sequence from={0} durationInFrames={cutFrame}>
        <HeroTitleTraverse {...heroProps} />
      </Sequence>
      <Sequence from={cutFrame} durationInFrames={remainder}>
        <EnumerationPanels {...panelsProps} />
        <ImpactNumber {...impactProps} />
      </Sequence>
    </>
  );
};
