import { useEffect, useId, useRef } from 'react';
import CatSays from './CatSays.jsx';

/**
 * Generic pixel-styled dialog: dark backdrop, ESC / backdrop click to close,
 * focus moves in on open and returns to the opener on close.
 * Centered card on desktop, bottom sheet on phones (see styles).
 *
 * `catLine`: if given, the cat hands you the item with a line of dialogue.
 * Closing the panel makes the cat put the item back (handled by the game).
 */
export default function Panel({ title, icon, catLine, onClose, children }) {
  const titleId = useId();
  const closeRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [onClose]);

  return (
    <div
      className="panel-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="panel pixel-box" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="panel-header">
          {icon && <img className="pixelated panel-icon" src={icon} alt="" />}
          <h2 id={titleId}>{title}</h2>
          <button ref={closeRef} className="btn btn-icon" onClick={onClose} aria-label="Close">
            X
          </button>
        </header>
        <div className="panel-body">
          {catLine && <CatSays line={catLine} anim="react" scale={2} />}
          {children}
        </div>
      </section>
    </div>
  );
}
