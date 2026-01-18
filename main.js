const video = document.getElementById("camera");
const statusEl = document.getElementById("status");
const canvas = document.getElementById("overlayCanvas");
const ctx = canvas.getContext("2d");

// ---------- Camera ----------
async function startCamera() {
  statusEl.textContent = "Requesting camera…";

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false,
  });

  video.srcObject = stream;

  await new Promise((res) => (video.onloadedmetadata = res));
  await video.play();

  statusEl.textContent = "Camera On";
}

function resizeCanvasToVideo() {
  // Wait until video metadata is available
  if (!video.videoWidth || !video.videoHeight) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Reset transform so drawing uses real pixel coords
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- MediaPipe Hands ----------
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6,
});

hands.onResults((results) => {
  // keep canvas synced
  resizeCanvasToVideo();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    statusEl.textContent = "Camera On (no hands)";
    return;
  }

  statusEl.textContent = `Tracking: ${results.multiHandLandmarks.length} hand(s)`;

  for (const landmarks of results.multiHandLandmarks) {
    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { lineWidth: 3 });
    drawLandmarks(ctx, landmarks, { lineWidth: 2, radius: 3 });
  }
});

// Drive MediaPipe using the video frames
function startHandLoop() {
  const cam = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 960,
    height: 540,
  });

  cam.start();
}

// ---------- Boot ----------
(async () => {
  try {
    await startCamera();
    resizeCanvasToVideo();
    startHandLoop();
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error: ${err.name || "unknown"}`;
  }
})();

window.addEventListener("resize", resizeCanvasToVideo);
