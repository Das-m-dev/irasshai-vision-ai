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
Using the free "Cat Follow Cursor Demo" file by TeamRive (Rive's own
official runtime demo account) - rive.app/marketplace/24639-46040-cat-follow-cursor-demo.
Download it, rename to `character.riv`, and put it in `public/`.

Unlike the two files tried earlier, this one uses Rive's **Data Binding /
ViewModel** system rather than classic State Machine Number inputs - that's
why nothing showed up in the "Data" panel for those files (Data Binding
properties are a separate, newer mechanism, not listed there). With
`autoBind: true`, Rive exposes a `ViewModelInstance` on the loaded `rive`
object, and `RiveCharacter.jsx` reads/writes its `xPos`/`yPos` number
properties directly - no synthetic pointer events, no fighting
`isTrusted`. This is also the more robust long-term approach: it's Rive's
documented, sanctioned API for exactly this cursor/gaze-tracking use case.

Key details baked into `RiveCharacter.jsx`:
- Artboard name: `Artboard 2` (this file has more than one artboard -
  using the wrong one loads a blank/wrong graphic)
- State machine name: `State Machine 1`
- Property names: `xPos`, `yPos`, expected in a **0-100** range (not -1..1)
  - `gazeX`/`gazeY` from the tracking pipeline are -1..1, so they're
    remapped to 0-100 before being written

If you swap in a different Data-Binding-based character later, update
`ARTBOARD_NAME`, `STATE_MACHINE_NAME`, and the property names/range at the
top of `RiveCharacter.jsx` to match. This file also has no greet/wave
state - the bow/greeting is currently a pure CSS "pop" effect
(`.greeting` class in `styles.css`) applied to the whole character
container when `state === 'greet'`.

## Adding a real wave animation
The cat-follow-cursor demo file doesn't ship with a wave/gesture animation
- it's a minimal tracking demo. To add one (requires your own editable
copy - Remix the file in the Rive editor first, since the raw download
isn't editable in place):

1. In the Rive editor, go to the **Animate** tab and create a new short
   Timeline animation (a couple seconds) where you keyframe the cat's paw
   lifting into a wave and back down. If the rig doesn't have separate arm
   bones, you may need to add a simple bone to one paw first (Rigging
   basics: select the paw shape → Bones tool → draw a bone → bind the
   paw's vertices to it via the Weight tool).
2. Open the **State Machine** graph, add a new state that plays this
   wave animation, and connect it from your idle/tracking state via a
   transition.
3. That transition needs something to trigger it. Since this file uses
   Data Binding, add a **Trigger** property to the ViewModel (Data panel →
   Add Property → Trigger, name it e.g. `wave`) and set the state
   transition's condition to fire on that trigger.
4. In `RiveCharacter.jsx`, set `WAVE_TRIGGER_NAME = 'wave'` (matching
   whatever name you gave it) - the code already looks up and fires that
   trigger automatically on the idle→greet transition, no further changes
   needed.

This is a real rigging task (expect an hour or two the first time,
faster once you're comfortable with Rive's bone/weight tools) - YouTube
has several "Rive character rigging basics" tutorials that cover exactly
this paw/arm-bone workflow.

### Alternative: Live2D
Use the Cubism Web SDK with a free sample model (e.g. Hiyori, from
live2d.com/en/download/sample-data), map `gazeX`/`gazeY` to the model's
`ParamAngleX`/`ParamAngleY`/`ParamEyeBallX` parameters, and trigger the bow
motion on `state === 'greet'`. More anime-styled than Rive out of the box,
but a heavier SDK to integrate.

## Running fullscreen
The Electron window now launches fullscreen by default (`fullscreen: true`
in `electron/main.js`). While developing:
- **F11** toggles fullscreen on/off
- **Escape** exits fullscreen if you're stuck in it



If you have the GitHub CLI installed, you can create + push in one go:
```bash
gh repo create reception-character --private --source=. --remote=origin --push
```
