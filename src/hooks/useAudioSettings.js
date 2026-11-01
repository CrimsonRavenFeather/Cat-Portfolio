import { useSyncExternalStore } from 'react';
import { audio } from '../audio/audio.js';

/** { music: boolean, sfx: boolean } - re-renders when the toggles change. */
export function useAudioSettings() {
  return useSyncExternalStore(audio.subscribe, audio.getState);
}
