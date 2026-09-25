import React, { useEffect, useRef } from 'react';
import { useRive } from '@rive-app/react-canvas';

const STATE_MACHINE_NAME = 'State Machine 1';

/**
 * This particular character file (Rive community "Cursor tracking bear")
 * has no State Machine Number inputs - its tracking is built with a
 * Listener bound directly to real pointer position on the canvas, not
 * inputs you can set from code. So instead of useStateMachineInput, we
 * synthesize pointermove events over the canvas at the position we want
 * the bear to look, using the same gazeX/gazeY (-1..1) values as before.
 *
 * If you later swap to a character file that DOES expose lookX/lookY
 * Number inputs, switch back to useStateMachineInput - that approach is
 * cleaner and doesn't depend on DOM event simulation.
 */
export default function RiveCharacter({ state, gazeX, gazeY }) {
  const containerRef = useRef(null);

  const { rive, RiveComponent } = useRive({
    src: '/character.riv',
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true
  });

  useEffect(() => {
    if (!rive) return;
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // gazeX/gazeY are -1..1 (0,0 = center). Map to real screen pixel
    // coordinates over the canvas, since the file's Listener reacts to
    // actual cursor position, not artboard-space values.
    const clientX = rect.left + ((gazeX + 1) / 2) * rect.width;
    const clientY = rect.top + ((gazeY + 1) / 2) * rect.height;

    const evt = new PointerEvent('pointermove', {
      clientX,
      clientY,
      bubbles: true,
      cancelable: true
    });
    canvas.dispatchEvent(evt);
  }, [rive, gazeX, gazeY]);

  return (
    <div className="character-stage" ref={containerRef}>
      <RiveComponent style={{ width: 420, height: 560 }} />
      {state === 'greet' && (
        <div className="speech-bubble">いらっしゃいませ！</div>
      )}
    </div>
  );
}
