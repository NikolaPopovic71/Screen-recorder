let start = document.getElementById("start"),
  stop = document.getElementById("stop"),
  pause = document.getElementById("pause"),
  resume = document.getElementById("resume"),
  format = document.getElementById("format"),
  filenameInput = document.getElementById("filename"),
  status = document.getElementById("status"),
  mediaRecorder;

pause.disabled = true;
resume.disabled = true;

start.addEventListener("click", async function () {
  let chosenFormat = format.value;

  // Check if the chosen format is supported by MediaRecorder API
  if (chosenFormat === "mp4") {
    alert(
      "Sometimes it happens that the MP4 format is not supported for live recording. In that case, switch to the webm format."
    );
    chosenFormat = "webm"; // Fallback to webm
  }

  let stream = await recordScreenWithAudio();
  let mimeType = `video/${chosenFormat}`;
  mediaRecorder = createRecorder(stream, mimeType);
  updateStatus("Started recording");
  pause.disabled = false;
  format.disabled = true; // Disable format change after recording starts
});

pause.addEventListener("click", function () {
  mediaRecorder.pause();
  updateStatus("Paused recording");
  pause.disabled = true;
  resume.disabled = false;
});

resume.addEventListener("click", function () {
  mediaRecorder.resume();
  updateStatus("Resumed recording");
  resume.disabled = true;
  pause.disabled = false;
});

stop.addEventListener("click", function () {
  mediaRecorder.stop();
  updateStatus("Stopped recording");
  pause.disabled = true;
  resume.disabled = true;
  format.disabled = false;
});

async function recordScreenWithAudio() {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: { mediaSource: "screen" },
  });
  const audioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  const combinedStream = new MediaStream([
    ...screenStream.getTracks(),
    ...audioStream.getTracks(),
  ]);

  return combinedStream;
}

function createRecorder(stream, mimeType) {
  let recordedChunks = [];
  const mediaRecorder = new MediaRecorder(stream, { mimeType });

  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = function () {
    saveFile(recordedChunks, mimeType);
    recordedChunks = [];
  };

  mediaRecorder.start(200);
  return mediaRecorder;
}

function saveFile(recordedChunks, mimeType) {
  const blob = new Blob(recordedChunks, {
    type: mimeType,
  });
  let filename = filenameInput.value || "recording"; // Use entered filename or default to 'recording'
  let downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${filename}.${format.value}`;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  URL.revokeObjectURL(blob);
  document.body.removeChild(downloadLink);
}

function updateStatus(message) {
  let node = document.createElement("p");
  node.textContent = message;
  status.innerHTML = ""; // Clear previous status
  status.appendChild(node);
}

const shareButton = document.getElementById("share-button");
const hint = document.getElementById("click-hint");
const socialsMenu = document.querySelector(".socials-menu");
const shareButtonImage = shareButton.querySelector("img");

const toggleSocials = () => {
  socialsMenu.classList.toggle("active");
  hint.style.display = "none";

  if (socialsMenu.classList.contains("active")) {
    // Menu open: Show close button
    shareButtonImage.src = "images/close.svg";  // Make sure this path is correct
    shareButtonImage.style.filter = "brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(2500%) hue-rotate(350deg) brightness(90%) contrast(60%)";
  } else {
    // Menu closed: Show ponITech logo
    shareButtonImage.src = "images/ponitech_logo.svg"; 
    shareButtonImage.style.filter = "none";
  }
};

shareButton.addEventListener("click", toggleSocials);




