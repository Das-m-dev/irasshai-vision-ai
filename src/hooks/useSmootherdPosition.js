import { useEffect, useRef, useState } from 'react';

/**
 * Exponential moving average smoothing so the character's gaze doesn't
 * jitter with every detection frame. alpha closer to 1 = snappier/less smooth,
 * closer to 0 = smoother/more lag. 0.15-0.25 feels natural for head tracking.
 */
export function useSmoothedPosition(rawPosition, alpha = 0.18) {
  const [smoothed, setSmoothed] = useState(rawPosition);
  const prevRef = useRef(rawPosition);

  useEffect(() => {
    const prev = prevRef.current;
    const next = {
      x: prev.x + alpha * (rawPosition.x - prev.x),
      y: prev.y + alpha * (rawPosition.y - prev.y)
    };
    prevRef.current = next;
    setSmoothed(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPosition.x, rawPosition.y]);

  return smoothed;
}
