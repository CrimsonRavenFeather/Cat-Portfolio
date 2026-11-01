import { useCallback, useEffect, useRef, useState } from 'react';
import Hud from './components/Hud.jsx';
import Panel from './components/Panel.jsx';
import { CatBubble, Tooltip } from './components/Overlays.jsx';
import PhaserGame from './components/PhaserGame.jsx';
import { PANELS } from './components/panels/index.js';
import { audio } from './audio/audio.js';
import { catLines } from './content/portfolio.js';
import { EventBus, GameEvents } from './game/EventBus.js';
import { useGameEvent } from './hooks/useGameEvent.js';

/** Keep an overlay inside the window horizontally. */
const clampX = (x) => Math.min(Math.max(x, 90), window.innerWidth - 90);

export default function App() {
  const bubbleTimer = useRef(null);
  const bubbleId = useRef(0);

  const [active, setActive] = useState(null); // open panel id
  const [tip, setTip] = useState(null);
  const [bubble, setBubble] = useState(null);
  const [mood, setMood] = useState('idle');
  const [showHint, setShowHint] = useState(true);

  const showBubble = useCallback((text, sx, sy) => {
    bubbleId.current += 1;
    setBubble({ id: bubbleId.current, text, left: clampX(sx), top: sy });
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 1500);
  }, []);

  // The cat has fetched the item and is holding it up: show its panel.
  const openPanel = useCallback((id) => {
    if (!PANELS[id]) return;
    setActive(id);
    setTip(null);
    setBubble(null);
    setShowHint(false);
    audio.play('panelOpen');
    EventBus.emit(GameEvents.UI_PANEL, { open: true });
  }, []);

  // Closing tells the cat to put the item back.
  const closePanel = useCallback(() => {
    setActive(null);
    audio.play('panelClose');
    EventBus.emit(GameEvents.UI_PANEL, { open: false });
  }, []);

  // game -> UI
  useGameEvent(GameEvents.OBJECT_OPEN, ({ id }) => openPanel(id));

  useGameEvent(GameEvents.OBJECT_HOVER, ({ label, item, sx, sy }) => {
    setTip({ label, item, left: clampX(sx), top: sy });
    setShowHint(false);
  });

  useGameEvent(GameEvents.OBJECT_OUT, () => setTip(null));
  useGameEvent(GameEvents.CAT_STATE, ({ state }) => setMood(state));

  useGameEvent(GameEvents.CAT_CLICK, ({ sx, sy }) => {
    setShowHint(false);
    showBubble(catLines[Math.floor(Math.random() * catLines.length)], sx, sy);
  });

  useGameEvent(GameEvents.CAT_SAY, ({ text, sx, sy }) => {
    setShowHint(false);
    showBubble(text, sx, sy);
  });

  // Browsers only allow sound after a user gesture: start audio on the first one,
  // and give every button / link a small click sound.
  useEffect(() => {
    const unlock = () => audio.unlock();
    const click = (e) => {
      const el = e.target instanceof Element ? e.target.closest('button, a') : null;
      if (!el || el.closest('.ttt-cell, .ms-cell') || el.getAttribute('aria-label') === 'Close') return;
      audio.play('click');
    };
    window.addEventListener('pointerdown', unlock, { capture: true, once: true });
    window.addEventListener('keydown', unlock, { capture: true, once: true });
    document.addEventListener('click', click, true);
    return () => {
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      document.removeEventListener('click', click, true);
    };
  }, []);

  // Hide the first-visit hint after a while
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 9000);
    return () => {
      clearTimeout(t);
      clearTimeout(bubbleTimer.current);
    };
  }, []);

  const panel = active ? PANELS[active] : null;

  return (
    <div className="app">
      <PhaserGame />

      <div className="overlay">
        <Hud mood={mood} />
        <Tooltip tip={tip} />
        <CatBubble bubble={bubble} />
        {showHint && <p className="hint">Click something in the room and Mochi will fetch it!</p>}
      </div>

      {/* Same sections for keyboard / screen-reader users. The cat still fetches them. */}
      <nav className="sr-only" aria-label="Portfolio sections">
        {Object.entries(PANELS).map(([id, p]) => (
          <button
            key={id}
            onClick={() => EventBus.emit(GameEvents.UI_OPEN, id)}
            onFocus={() => EventBus.emit(GameEvents.UI_HIGHLIGHT, id)}
            onBlur={() => EventBus.emit(GameEvents.UI_HIGHLIGHT, null)}
          >
            {p.title}
          </button>
        ))}
      </nav>

      {panel && (
        <Panel title={panel.title} icon={panel.icon} catLine={panel.catLine} onClose={closePanel}>
          <panel.Component />
        </Panel>
      )}
    </div>
  );
}
