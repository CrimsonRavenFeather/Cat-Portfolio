/** HTML overlays drawn on top of the canvas (positions come from the game). */

export function Tooltip({ tip }) {
  if (!tip) return null;
  return (
    <div className="tooltip pixel-box" style={{ left: tip.left, top: tip.top }}>
      <strong>{tip.label}</strong>
      <span>{tip.item}</span>
    </div>
  );
}

export function CatBubble({ bubble }) {
  if (!bubble) return null;
  // `key` restarts the pop-in animation on every click
  return (
    <div key={bubble.id} className="bubble" style={{ left: bubble.left, top: bubble.top }}>
      {bubble.text}
    </div>
  );
}
