import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneBackground} from '../components/SceneBackground';
import {OutlinedText} from '../components/OutlinedText';
import {RadiatingTicks} from '../components/RadiatingTicks';
import {PopIn} from '../components/PopIn';
import {INK, SEMANTIC, isDarkField} from '../theme/palette';
import {SAFE_AREA} from '../theme/tokens';
import type {SceneBaseProps} from '../theme/types';

/**
 * T1 — Title card. Optional skyline/scene background, then title words land
 * sequentially (word-by-word pop) with radiating ticks; emphasis words swap to
 * a red fill. Each word carries its own startFrame from the Groq word map.
 */
export type TitleWord = {
  text: string;
  startFrame: number;
  emphasis?: boolean; // red fill = danger/emphasis
};

export type TitleCardProps = SceneBaseProps & {
  words: TitleWord[];
  bgImageUrl?: string;
  fontSize?: number;
};

export const titleCardDefaults: TitleCardProps = {
  bgField: 'powder',
  durationInFrames: 120,
  fontSize: 132,
  words: [
    {text: '1', startFrame: 10},
    {text: 'Billion', startFrame: 22},
    {text: 'Birds', startFrame: 36},
    {text: 'DIE', startFrame: 54, emphasis: true},
  ],
};

export const TitleCard: React.FC<TitleCardProps> = ({
  bgField,
  words,
  bgImageUrl,
  fontSize = 132,
}) => {
  const frame = useCurrentFrame();
  const dark = isDarkField(bgField);
  const baseFill = dark ? '#FFFFFF' : '#FFFFFF';
  const baseStroke = dark ? '#000000' : INK.line;

  return (
    <SceneBackground bgField={bgField} imageUrl={bgImageUrl}>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: SAFE_AREA.side,
          paddingRight: SAFE_AREA.side,
          paddingBottom: SAFE_AREA.bottom,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: `${fontSize * 0.12}px ${fontSize * 0.24}px`,
            maxWidth: 1920 - SAFE_AREA.side * 2,
          }}
        >
          {words.map((word, i) => (
            <div key={i} style={{position: 'relative'}}>
              <PopIn startFrame={word.startFrame} from={0.5}>
                <OutlinedText
                  fontSize={fontSize}
                  fill={word.emphasis ? SEMANTIC.danger : baseFill}
                  stroke={word.emphasis ? '#7d1610' : baseStroke}
                >
                  {word.text}
                </OutlinedText>
              </PopIn>
              {frame >= word.startFrame ? (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '40%',
                  }}
                >
                  <RadiatingTicks
                    startFrame={word.startFrame}
                    color={word.emphasis ? SEMANTIC.danger : baseStroke}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </SceneBackground>
  );
};
