import { useEffect, useRef } from 'react';
import { EventBus } from '../game/EventBus.js';

/** Subscribe to an EventBus event for the lifetime of the component. */
export function useGameEvent(event, handler) {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    const fn = (...args) => ref.current(...args);
    EventBus.on(event, fn);
    return () => EventBus.off(event, fn);
  }, [event]);
}
