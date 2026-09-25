import React, { useEffect, useRef } from 'react';
import { useRive } from '@rive-app/react-canvas';

// From the cat_follow_cursor_demo.riv reference implementation - update
// these three if you swap in a different Data-Binding-based character file.
const ARTBOARD_NAME = 'Artboard 2';
const STATE_MACHINE_NAME = 'State Machine 1';

/**
 * This character file uses Rive's Data Binding / ViewModel system rather
 * than classic State Machine Number inputs - that's why nothing showed up
 * in the editor's "Data" panel earlier. With autoBind: true, Rive exposes
 * a ViewModelInstance on the loaded rive object, and we read/write its
 * named number properties directly (xPos / yPos, expected in a 0-100
 * range) instead of using useStateMachineInput or synthetic DOM events.
 */
export default function RiveCharacter({ state, gazeX, gazeY }) {
  const xPropRef = useRef(null);
  const yPropRef = useRef(null);

  const { rive, RiveComponent } = useRive({
    src: '/character.riv',
    artboard: ARTBOARD_NAME,
    stateMachines: STATE_MACHINE_NAME,
    autoBind: true,
    autoplay: true
  });

  // Once the file is loaded and bound, grab the xPos/yPos properties and
  // center the character so it's looking forward before any tracking data
  // arrives.
  useEffect(() => {
    if (!rive) return;
    const vmi = rive.viewModelInstance;
    if (!vmi) return;

    xPropRef.current = vmi.number('xPos');
    yPropRef.current = vmi.number('yPos');

    if (xPropRef.current) xPropRef.current.value = 50;
    if (yPropRef.current) yPropRef.current.value = 50;
  }, [rive]);

  // Push tracking data in on every change. gazeX/gazeY come in as -1..1
  // (0,0 = center) from useSmoothedPosition - this file expects 0..100.
  useEffect(() => {
    if (!xPropRef.current || !yPropRef.current) return;
    const xValue = ((gazeX + 1) / 2) * 100;
    const yValue = ((gazeY + 1) / 2) * 100;
    xPropRef.current.value = xValue;
    yPropRef.current.value = yValue;
  }, [gazeX, gazeY]);

  return (
    <div className="character-stage">
      <RiveComponent style={{ width: 420, height: 560 }} />
      {state === 'greet' && (
        <div className="speech-bubble">いらっしゃいませ！</div>
      )}
    </div>
  );
}
