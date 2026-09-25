# Reception Character

Camera-based, presence-triggered animated reception character. Replaces a
pre-recorded-motion robot: detects when someone enters frame, greets them
(bow + speech bubble), then tracks their position with head/eye movement
until they leave.

## Stack
- Electron (desktop shell, camera permission handling)
- React + Vite (UI)
- MediaPipe Tasks Vision `FaceDetector` (pretrained, runs in-browser via WASM)
- Plain SVG character (placeholder - see "Upgrading the character" below)

## Quick start

```bash
npm install
npm run electron:dev
```

This starts the Vite dev server and an Electron window pointed at it, with
hot reload. Grant camera access when prompted.

To build a distributable app:
```bash
npm run dist
```

## How it works
1. `useFaceTracking` opens the webcam and runs MediaPipe's `FaceDetector`
   every frame, returning whether a face is present and its normalized
   position (-1..1) in the frame.
2. `useSmoothedPosition` applies an exponential moving average so the
   character's gaze doesn't jitter frame-to-frame.
3. `App.jsx` runs a small state machine:
   - `idle` → nobody in frame
   - `greet` → face just appeared → bow animation + speech bubble, ~1.8s
   - `tracking` → continuously feeds smoothed x/y into the character's
     head/eye rotation
   - a 2.5s cooldown after the face disappears before dropping back to
     `idle`, so a brief look-away doesn't retrigger the whole greet cycle
4. `Character.jsx` renders the actual character and reacts to `state`,
   `gazeX`, `gazeY` props only - it doesn't know anything about the camera
   or detection pipeline.

## Tuning
- `FAREWELL_COOLDOWN_MS` / `GREET_DURATION_MS` in `App.jsx`
- Smoothing `alpha` in `useSmoothedPosition` (lower = smoother but laggier)
- `minDetectionConfidence` in `useFaceTracking.js`

## Character art (Rive)
Currently using the free "Cursor tracking bear" community file (by gilbishk,
CC BY) at `public/character.riv`. This file has no State Machine Number
inputs - its cursor tracking is built with a Listener bound to real pointer
position on the canvas, not values you can set from code. So
`RiveCharacter.jsx` drives it by dispatching synthetic `pointermove` events
over the canvas at the position corresponding to `gazeX`/`gazeY`, rather
than using `useStateMachineInput`. This file also has no greet/wave state
(just "Normal face") - the bow/greeting is currently handled entirely by
the CSS speech bubble, not a Rive animation.

To use a different character:
1. Get a `.riv` file (rive.app/community, free) and drop it at
   `public/character.riv`.
2. Open it in the Rive editor and check the **Data** panel for Number
   inputs (`lookX`/`lookY` or similar).
   - If it HAS Number inputs: switch `RiveCharacter.jsx` back to
     `useStateMachineInput` (cleaner, no DOM event faking needed) - see
     git history for the earlier version of this file.
   - If it does NOT (built with pointer Listeners instead, like the bear):
     keep the synthetic pointermove approach, just double check the
     `STATE_MACHINE_NAME` constant matches the file's actual state machine
     name.
3. If the file has a greet/wave state or trigger, wire it up similarly to
   how `greetTrigger` was used in the Number-input version.

### Alternative: Live2D
Use the Cubism Web SDK with a free sample model (e.g. Hiyori, from
live2d.com/en/download/sample-data), map `gazeX`/`gazeY` to the model's
`ParamAngleX`/`ParamAngleY`/`ParamEyeBallX` parameters, and trigger the bow
motion on `state === 'greet'`. More anime-styled than Rive out of the box,
but a heavier SDK to integrate.

## Privacy note
No video frames or images are ever saved to disk - detection runs entirely
in memory on each frame. If you deploy this at a real entrance, put up
signage noting a camera is in use for presence detection, per Japan's
personal information protection requirements.

## Getting this into git

```bash
git init
git add .
git commit -m "Initial scaffold: camera presence detection + animated character"

# create an empty repo on GitHub first (via the web UI or `gh repo create`),
# then:
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

If you have the GitHub CLI installed, you can create + push in one go:
```bash
gh repo create reception-character --private --source=. --remote=origin --push
```
