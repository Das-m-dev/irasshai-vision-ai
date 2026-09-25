import React from 'react';

/**
 * Placeholder SVG character. Swap this out for a Rive <RiveComponent> or a
 * Live2D Cubism canvas later - keep the same props contract (state, gazeX,
 * gazeY) so App.jsx doesn't need to change.
 *
 * state: 'idle' | 'greet' | 'tracking' | 'farewell'
 * gazeX / gazeY: -1..1 smoothed position from useSmoothedPosition
 */
export default function Character({ state, gazeX, gazeY }) {
  const headRotate = gazeX * 12; // degrees
  const headTilt = gazeY * 6;
  const eyeShiftX = gazeX * 6;
  const eyeShiftY = gazeY * 4;
  const isBowing = state === 'greet';

  return (
    <div className="character-stage">
      <svg
        viewBox="0 0 300 400"
        width="360"
        height="480"
        className={`character ${isBowing ? 'bowing' : ''}`}
      >
        {/* Body */}
        <ellipse cx="150" cy="330" rx="90" ry="60" fill="#3b5bdb" />

        {/* Head group - rotates/tilts to track the visitor */}
        <g
          className="head-group"
          style={{
            transformOrigin: '150px 190px',
            transform: `rotate(${headTilt}deg)`
          }}
        >
          <g
            style={{
              transformOrigin: '150px 190px',
              transform: `rotate(${headRotate}deg)`,
              transition: 'transform 60ms linear'
            }}
          >
            <circle cx="150" cy="190" r="90" fill="#ffe0bd" />
            {/* Eyes */}
            <g
              style={{
                transform: `translate(${eyeShiftX}px, ${eyeShiftY}px)`,
                transition: 'transform 60ms linear'
              }}
            >
              <circle cx="120" cy="185" r="8" fill="#222" />
              <circle cx="180" cy="185" r="8" fill="#222" />
            </g>
            {/* Mouth - simple smile */}
            <path
              d="M 125 220 Q 150 240 175 220"
              stroke="#222"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>

      {state === 'greet' && (
        <div className="speech-bubble">いらっしゃいませ！</div>
      )}
    </div>
  );
}
