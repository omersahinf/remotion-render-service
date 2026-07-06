import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';

const {fontFamily} = loadFont('normal', {weights: ['600']});

export type Scene1Props = {
  bgUrl: string;
  birdPoseUrls: [string, string, string];
  title?: string;
  subtitle?: string;
  emphasisColor?: string;
  titleInFrame?: number;
  subtitleInFrame?: number;
};

export const scene1Defaults: Scene1Props = {
  bgUrl: 'https://dummyimage.com/1920x1080/fff/aaa',
  birdPoseUrls: [
    'https://minio-api.n8n-omersahin.cfd/vector-style/remotion-smoke/scene1/bird_wingsup_alpha.png',
    'https://minio-api.n8n-omersahin.cfd/vector-style/remotion-smoke/scene1/bird_level_alpha.png',
    'https://minio-api.n8n-omersahin.cfd/vector-style/remotion-smoke/scene1/bird_wingsdown_alpha.png',
  ],
  title: '1 Billion Birds',
  subtitle: 'DIE',
  emphasisColor: '#d62828',
  titleInFrame: 45,
  subtitleInFrame: 90,
};

const titleStyle: React.CSSProperties = {
  fontFamily,
  fontSize: 132,
  fontWeight: 600,
  color: 'white',
  WebkitTextStroke: '11px black',
  paintOrder: 'stroke',
  lineHeight: 1.05,
  textAlign: 'center',
  whiteSpace: 'nowrap',
};

export const Scene1: React.FC<Scene1Props> = ({
  bgUrl,
  birdPoseUrls,
  title = '1 Billion Birds',
  subtitle = 'DIE',
  emphasisColor = '#d62828',
  titleInFrame = 45,
  subtitleInFrame = 90,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const bgW = width * 1.2;
  const bgH = height * 1.2;
  const panX = interpolate(frame, [0, 135], [0, -(bgW - width)]);

  const poseIndex = Math.floor((frame * 8) / fps) % 3;
  const birdX = interpolate(frame, [0, 135], [-260, width - 200]);
  const birdY = 360 + 22 * Math.sin((frame / fps) * 4.2);

  const titlePop = spring({
    frame: frame - titleInFrame,
    fps,
    config: {damping: 12, mass: 0.6},
  });
  const subtitlePop = spring({
    frame: frame - subtitleInFrame,
    fps,
    config: {damping: 12, mass: 0.6},
  });
  const showTitleOnly = frame >= titleInFrame && frame < subtitleInFrame;
  const showFullTitle = frame >= subtitleInFrame;
  const titleFirstWord = title.split(/\s+/)[0] || title;

  return (
    <AbsoluteFill style={{backgroundColor: '#bfe3f7', overflow: 'hidden'}}>
      <Img
        src={bgUrl}
        style={{
          position: 'absolute',
          width: bgW,
          height: bgH,
          left: panX,
          top: -(bgH - height) / 2,
          objectFit: 'cover',
        }}
      />

      {showTitleOnly && (
        <AbsoluteFill
          style={{justifyContent: 'center', alignItems: 'center', top: 60}}
        >
          <div style={{...titleStyle, transform: `scale(${titlePop})`}}>
            {titleFirstWord}
          </div>
        </AbsoluteFill>
      )}

      {showFullTitle && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 10,
            transform: `scale(${subtitlePop})`,
          }}
        >
          <div style={titleStyle}>{title}</div>
          {subtitle ? (
            <div style={{...titleStyle, color: emphasisColor}}>{subtitle}</div>
          ) : null}
        </AbsoluteFill>
      )}

      <Img
        src={birdPoseUrls[poseIndex]}
        style={{
          position: 'absolute',
          width: 300,
          left: birdX,
          top: birdY,
        }}
      />
    </AbsoluteFill>
  );
};
