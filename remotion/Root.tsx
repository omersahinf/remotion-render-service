import {Composition} from 'remotion';
import {Scene1, scene1Defaults} from './scenes/Scene1';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Scene1"
      component={Scene1}
      durationInFrames={135}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={scene1Defaults}
    />
  );
};
