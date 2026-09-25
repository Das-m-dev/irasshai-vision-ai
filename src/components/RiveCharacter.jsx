import React, { useEffect, useRef } from 'react';
import { useRive } from '@rive-app/react-canvas';

const ARTBOARD_NAME = 'Artboard 2';
const STATE_MACHINE_NAME = 'State Machine 1';

// If you add a wave/gesture Trigger to the file's ViewModel later, set
// this to its exact property name (see README "Adding a wave animation").
// Left null for now since the base cat-follow-cursor demo doesn't have one.
const WAVE_TRIGGER_NAME = null; // e.g. 'wave'

export default function RiveCharacter({ state, gazeX, gazeY }) {
  const xPropRef = useRef(null);
  const yPropRef = useRef(null);
  const waveTriggerRef = useRef(null);
  const prevStateRef = useRef(state);

  const { rive, RiveComponent } = useRive({
    src: '/character.riv',
    artboard: ARTBOARD_NAME,
    stateMachines: STATE_MACHINE_NAME,
    autoBind: true,
    autoplay: true
  });

  useEffect(() => {
    if (!rive) return;
    const vmi = rive.viewModelInstance;
    if (!vmi) return;

    xPropRef.current = vmi.number('xPos');
    yPropRef.current = vmi.number('yPos');

    if (xPropRef.current) xPropRef.current.value = 50;
    if (yPropRef.current) yPropRef.current.value = 50;

    if (WAVE_TRIGGER_NAME) {
      try {
        waveTriggerRef.current = vmi.trigger(WAVE_TRIGGER_NAME);
      } catch (err) {
        console.warn(`No trigger named "${WAVE_TRIGGER_NAME}" on this file's ViewModel.`, err);
      }
    }
  }, [rive]);

  useEffect(() => {
    if (!xPropRef.current || !yPropRef.current) return;
    const xValue = ((gazeX + 1) / 2) * 100;
    const yValue = ((gazeY + 1) / 2) * 100;
    xPropRef.current.value = xValue;
    yPropRef.current.value = yValue;
  }, [gazeX, gazeY]);

  // Fire the wave trigger (if configured) on the idle -> greet transition.
  useEffect(() => {
    if (state === 'greet' && prevStateRef.current !== 'greet' && waveTriggerRef.current) {
      waveTriggerRef.current.trigger();
    }
    prevStateRef.current = state;
  }, [state]);

  return (
    <div className={`character-stage ${state === 'greet' ? 'greeting' : ''}`}>
      <RiveComponent className="character-canvas" />
      {state === 'greet' && (
        <div className="speech-bubble">いらっしゃいませ！</div>
      )}
    </div>
  );
}
