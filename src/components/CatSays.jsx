import CatAvatar from './CatAvatar.jsx';
import { profile } from '../content/portfolio.js';

/** The cat on the left, a speech bubble on the right. Used by every panel. */
export default function CatSays({ line, anim = 'idle', scale = 3, children }) {
  return (
    <div className="cat-says">
      <div className="cat-window">
        <CatAvatar anim={anim} scale={scale} label={`${profile.petName} the cat`} />
      </div>
      <div className="says-bubble" aria-live="polite">
        <span className="says-name">{profile.petName}</span>
        <p>{line}</p>
        {children}
      </div>
    </div>
  );
}
