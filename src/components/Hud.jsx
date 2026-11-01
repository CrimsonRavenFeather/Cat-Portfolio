import { useEffect, useState } from 'react';
import { audio } from '../audio/audio.js';
import { catMoods, profile } from '../content/portfolio.js';
import { useAudioSettings } from '../hooks/useAudioSettings.js';
import PixelIcon from './PixelIcon.jsx';

/** Small floating labels over the room: whose room it is, the cat's mood, sound + full-screen toggles. */
export default function Hud({ mood }) {
  return (
    <div className="hud">
      <div className="hud-title">
        <h1>{profile.name}&apos;s Room</h1>
        <p className="sub">{profile.title}</p>
      </div>
      <p className="rotate-tip">Tip: turn your phone sideways for a bigger room</p>
      <div className="hud-right">
        <div className="pet-pill" aria-live="polite">
          <span className="pet-name">{profile.petName}</span>
          <span className="pet-mood">{catMoods[mood] ?? mood}</span>
        </div>
        <AudioToggles />
        <FullscreenButton />
      </div>
    </div>
  );
}

/** Background music on/off, and sound effects on/off. Both are remembered. */
function AudioToggles() {
  const { music, sfx } = useAudioSettings();
  return (
    <div className="hud-audio" role="group" aria-label="Sound">
      <button
        className={`btn btn-small hud-toggle${music ? '' : ' is-off'}`}
        onClick={() => audio.toggleMusic()}
        aria-pressed={music}
        title={music ? 'Turn music off' : 'Turn music on'}
      >
        <PixelIcon name="note" size={2} />
        <span className="toggle-label">Music {music ? 'on' : 'off'}</span>
        <span className="sr-only">Background music</span>
      </button>
      <button
        className={`btn btn-small hud-toggle${sfx ? '' : ' is-off'}`}
        onClick={() => audio.toggleSfx()}
        aria-pressed={sfx}
        title={sfx ? 'Turn sound effects off' : 'Turn sound effects on'}
      >
        <PixelIcon name="speaker" size={2} />
        <span className="toggle-label">SFX {sfx ? 'on' : 'off'}</span>
        <span className="sr-only">Sound effects</span>
      </button>
    </div>
  );
}

function FullscreenButton() {
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled;
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  if (!supported) return null;

  const toggle = () => {
    const op = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
    op?.catch(() => {});
  };

  return (
    <button className="btn btn-small hud-fs" onClick={toggle} aria-pressed={on}>
      {on ? 'Exit full screen' : 'Full screen'}
    </button>
  );
}
