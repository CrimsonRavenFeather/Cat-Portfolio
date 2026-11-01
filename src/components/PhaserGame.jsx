import { useEffect, useRef } from 'react';
import { createGame, destroyGame } from '../game/index.js';

/**
 * Mounts the Phaser canvas, full-window. This is the only React file that
 * touches the game directly - everything else talks to it through the EventBus.
 */
export default function PhaserGame() {
  const hostRef = useRef(null);

  useEffect(() => {
    const game = createGame(hostRef.current);
    return () => destroyGame(game);
  }, []);

  return (
    <div
      ref={hostRef}
      className="game-host"
      role="img"
      aria-label="A cozy pixel-art bedroom with an orange cat. Click an item and the cat will fetch it for you."
    />
  );
}
