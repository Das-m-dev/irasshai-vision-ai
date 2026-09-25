import React, { useEffect } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

// Rename to match the State Machine name inside your .riv file - open the
// file in the Rive web editor (or ask whoever exported it) to confirm.
const STATE_MACHINE_NAME = 'State Machine 1';

/**
 * Same contract as the old SVG Character: state / gazeX / gazeY in, nothing
 * else. Swap the .riv file and STATE_MACHINE_NAME below when you upgrade
 * from a free community character to a custom-commissioned one - this
 * component and App.jsx don't need to change.
 *
 * Expected inputs on the State Machine (rename below to match your file):
 *   - lookX, lookY   : Number inputs, roughly -1..1, drive head/eye direction
 *   - greet          : Trigger, fired once when a visitor is first detected
 */
export default function RiveCharacter({ state, gazeX, gazeY }) {
  const { rive, RiveComponent } = useRive({
    src: '/character.riv', // place your downloaded/exported .riv file in /public
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true
  });

  const lookX = useStateMachineInput(rive, STATE_MACHINE_NAME, 'lookX');
  const lookY = useStateMachineInput(rive, STATE_MACHINE_NAME, 'lookY');
  const greetTrigger = useStateMachineInput(rive, STATE_MACHINE_NAME, 'greet');

  useEffect(() => {
    if (lookX) lookX.value = gazeX;
    if (lookY) lookY.value = gazeY;
  }, [gazeX, gazeY, lookX, lookY]);

  useEffect(() => {
    if (state === 'greet' && greetTrigger) {
      greetTrigger.fire();
    }
  }, [state, greetTrigger]);

  return (
    <div className="character-stage">
      <RiveComponent style={{ width: 420, height: 560 }} />
      {state === 'greet' && (
        <div className="speech-bubble">いらっしゃいませ！</div>
      )}
    </div>
  );
}
