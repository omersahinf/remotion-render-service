import {Composition} from 'remotion';
import {CANVAS} from './theme/tokens';
import {DEFAULT_DURATION} from './theme/types';

import {Scene1, scene1Defaults} from './scenes/Scene1';
import {TitleCard, titleCardDefaults} from './scenes/TitleCard';
import {IconBuild, iconBuildDefaults} from './scenes/IconBuild';
import {CardStack, cardStackDefaults} from './scenes/CardStack';
import {Gauge, gaugeDefaults} from './scenes/Gauge';
import {Chart, chartDefaults} from './scenes/Chart';
import {Traverse, traverseDefaults} from './scenes/Traverse';
import {BgSwap, bgSwapDefaults} from './scenes/BgSwap';
import {SplitCompare, splitCompareDefaults} from './scenes/SplitCompare';
import {Markup, markupDefaults} from './scenes/Markup';

import {HeroTitleTraverse, heroTitleTraverseDefaults} from './scenes/HeroTitleTraverse';
import {EnumerationPanels, enumerationPanelsDefaults} from './scenes/EnumerationPanels';
import {ImpactNumber, impactNumberDefaults} from './scenes/ImpactNumber';
import {PastTenseOpening, pastTenseOpeningDefaults} from './scenes/PastTenseOpening';

// Every scene reads its length from inputProps.durationInFrames (the Groq beat
// length), so the n8n side controls duration without re-registering.
const durationFromProps = ({
  props,
}: {
  props: {durationInFrames?: number};
}) => ({
  durationInFrames: Math.max(1, Math.round(props.durationInFrames ?? DEFAULT_DURATION)),
});

export const RemotionRoot: React.FC = () => {
  const common = {
    fps: CANVAS.fps,
    width: CANVAS.width,
    height: CANVAS.height,
    durationInFrames: DEFAULT_DURATION,
  } as const;

  return (
    <>
      {/* Legacy hard-coded doodle bird scene — kept for back-compat. */}
      <Composition
        id="Scene1"
        component={Scene1}
        fps={CANVAS.fps}
        width={CANVAS.width}
        height={CANVAS.height}
        durationInFrames={135}
        defaultProps={scene1Defaults}
      />

      <Composition
        id="TitleCard"
        component={TitleCard}
        defaultProps={titleCardDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="IconBuild"
        component={IconBuild}
        defaultProps={iconBuildDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="CardStack"
        component={CardStack}
        defaultProps={cardStackDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="Gauge"
        component={Gauge}
        defaultProps={gaugeDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="Chart"
        component={Chart}
        defaultProps={chartDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="Traverse"
        component={Traverse}
        defaultProps={traverseDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="BgSwap"
        component={BgSwap}
        defaultProps={bgSwapDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="SplitCompare"
        component={SplitCompare}
        defaultProps={splitCompareDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="Markup"
        component={Markup}
        defaultProps={markupDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />

      <Composition
        id="HeroTitleTraverse"
        component={HeroTitleTraverse}
        defaultProps={heroTitleTraverseDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="EnumerationPanels"
        component={EnumerationPanels}
        defaultProps={enumerationPanelsDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="ImpactNumber"
        component={ImpactNumber}
        defaultProps={impactNumberDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
      <Composition
        id="PastTenseOpening"
        component={PastTenseOpening}
        defaultProps={pastTenseOpeningDefaults}
        calculateMetadata={durationFromProps}
        {...common}
      />
    </>
  );
};
