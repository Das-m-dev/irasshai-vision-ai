import { useEffect, useRef, useState } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// Loaded from the CDN at runtime so you don't have to vendor the wasm/model
// files yourself. Swap these for local paths if you need a fully offline build.
const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

/**
 * Runs MediaPipe FaceDetector against the webcam feed and returns the
 * normalized position (-1..1 on both axes, 0,0 = center of frame) of the
 * closest/largest detected face, plus whether anyone is present.
 */
export function useFaceTracking() {
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [detected, setDetected] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // -1..1

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.6
        });
        if (cancelled) return;
        detectorRef.current = detector;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: false
        });
        if (cancelled) return;

        const video = document.createElement('video');
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play();
        videoRef.current = video;

        setReady(true);
        loop();
      } catch (err) {
        console.error('Face tracking setup failed:', err);
        setError(err.message || String(err));
      }
    }

    function loop() {
      const video = videoRef.current;
      const detector = detectorRef.current;
      if (!video || !detector) return;

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const result = detector.detectForVideo(video, performance.now());

        if (result.detections.length > 0) {
          // Pick the largest bounding box = closest / most prominent person
          const largest = result.detections.reduce((a, b) =>
            a.boundingBox.width * a.boundingBox.height >
            b.boundingBox.width * b.boundingBox.height
              ? a
              : b
          );
          const box = largest.boundingBox;
          const cx = box.originX + box.width / 2;
          const cy = box.originY + box.height / 2;

          // Normalize to -1..1, mirrored on X so it feels like a mirror
          const nx = -(cx / video.videoWidth - 0.5) * 2;
          const ny = (cy / video.videoHeight - 0.5) * 2;

          setDetected(true);
          setPosition({ x: nx, y: ny });
        } else {
          setDetected(false);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    setup();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      detectorRef.current?.close();
    };
  }, []);

  return { ready, error, detected, position };
}
