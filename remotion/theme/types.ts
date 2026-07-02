import type {BackgroundFieldKey} from './palette';

/**
 * Base contract every scene composition shares. The n8n Scene Composer emits
 * these; `durationInFrames` is read by Root.tsx `calculateMetadata` so each
 * beat's length comes straight from the Groq word-timing map.
 */
export type SceneBaseProps = {
  /** Palette field key (rotates per section) or a raw hex fallback. */
  bgField: BackgroundFieldKey | string;
  /** Total scene length; derived from the section's beat duration. */
  durationInFrames: number;
};

export const DEFAULT_DURATION = 120;
