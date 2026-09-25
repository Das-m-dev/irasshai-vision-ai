import React, { useEffect, useRef, useState } from 'react';
import { useFaceTracking } from './hooks/useFaceTracking.js';
import { useSmoothedPosition } from './hooks/useSmootherdPosition.js';
import Character from './components/Character.jsx';

// How long nobody has to be absent before we drop back to idle.
// Prevents flicker if someone briefly turns their head / steps just out of frame.
const FAREWELL_COOLDOWN_MS = 2500;
// How long the greet animation plays before switching to continuous tracking.
const GREET_DURATION_MS = 1800;

export default function App() {
  const { ready, error, detected, position } = useFaceTracking();
  const smoothed = useSmoothedPosition(position);

  const [state, setState] = useState('idle'); // idle | greet | tracking | farewell
  const wasDetectedRef = useRef(false);
  const farewellTimerRef = useRef(null);
  const greetTimerRef = useRef(null);

  useEffect(() => {
    if (detected && !wasDetectedRef.current) {
      // Rising edge: nobody -> somebody. Play greet, then move to tracking.
      clearTimeout(farewellTimerRef.current);
      setState('greet');
      clearTimeout(greetTimerRef.current);
      greetTimerRef.current = setTimeout(() => {
        setState((s) => (s === 'greet' ? 'tracking' : s));
      }, GREET_DURATION_MS);
    } else if (!detected && wasDetectedRef.current) {
      // Falling edge: somebody -> nobody. Wait out the cooldown before idling,
      // in case it's just a momentary tracking miss.
      farewellTimerRef.current = setTimeout(() => {
        setState('idle');
      }, FAREWELL_COOLDOWN_MS);
    } else if (detected && state === 'idle') {
      setState('tracking');
    }

    wasDetectedRef.current = detected;
  }, [detected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      clearTimeout(farewellTimerRef.current);
      clearTimeout(greetTimerRef.current);
    };
  }, []);

  return (
    <div className="app-root">
      {!ready && !error && <div className="status">Starting camera…</div>}
      {error && (
        <div className="status error">
          Camera/model error: {error}. Check camera permissions.
        </div>
      )}

      <Character
        state={state}
        gazeX={state === 'idle' ? 0 : smoothed.x}
        gazeY={state === 'idle' ? 0 : smoothed.y}
      />

      {/* Small debug readout - remove once you're happy with tuning */}
      <div className="debug">
        state: {state} | detected: {String(detected)} | x:{' '}
        {smoothed.x.toFixed(2)} | y: {smoothed.y.toFixed(2)}
      </div>
    </div>
  );
}
