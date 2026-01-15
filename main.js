//Get the video element from the HTML
const video = document.getElementById("camera");
//So I can get the status too 
const statusEl = document.getElementById("status");

async function startCamera() {
  try {
    //Lets the user know whats happening
    statusEl.textContent = "Requesting camera…";

    //Waiting for user response
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }, 
      audio: false
    });

    video.srcObject = stream;

    statusEl.textContent = "Camera On";
    //If an error happens, put camera blocked message
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Camera blocked / denied";
  }
}

startCamera();
