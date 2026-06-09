import { useRef, useSyncExternalStore } from 'react';

export function createTickStore(initial = -1) {
  let current = initial;
  const listeners = new Set();

  return {
    getCurrent: () => current,
    setCurrent: (value) => {
      if (value === current) {
        return;
      }

      current = value;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    }
  };
}

export function useCurrentTick(tickStore, active = true) {
  const frozenRef = useRef(tickStore.getCurrent());

  const tick = useSyncExternalStore(
    tickStore.subscribe,
    active ? tickStore.getCurrent : () => frozenRef.current
  );

  if (active) {
    frozenRef.current = tick;
  }

  return tick;
}
