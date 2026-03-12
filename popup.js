// Day 6: Modify popup.js so that it send the audio blob to background.js

let currentCaptureStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let currentAudioBlob = null; // The audio blob is stored here

document.addEventListener("DOMContentLoaded", function () {
  const captureBtn = document.getElementById("captureBtn");
  const recordBtn = document.getElementById("recordBtn");
  const stopBtn = document.getElementById("stopBtn");

  // Enable record button when stream is ready
  const enableRecordingUI = () => {
    recordBtn.disabled = !currentCaptureStream;
    stopBtn.disabled = !mediaRecorder;
  };

  // Capture tab audio
  captureBtn.addEventListener("click", async () => {
    console.log("Capture button clicked");

    if (!chrome.tabCapture) {
      console.error("chrome.tabCapture is not available");
      return;
    }

    // Stop previous capture if running
    if (currentCaptureStream) {
      console.log("Stopping previous capture stream");
      currentCaptureStream.getTracks().forEach((track) => track.stop());
      currentCaptureStream = null;
      enableRecordingUI();
      return;
    }

    chrome.tabCapture.capture(
      {
        audio: true,
        video: false,
      },
      (stream) => {
        if (chrome.runtime.lastError || !stream) {
          console.error("Error capturing tab audio:", chrome.runtime.lastError);
          currentCaptureStream = null;
          enableRecordingUI();
          return;
        }

        console.log("Audio stream captured in popup:", stream);
        console.log("Stream ID:", stream.id);
        console.log("Audio tracks:", stream.getAudioTracks());

        // Keep audio playing
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        source.connect(context.destination);

        // Store the stream
        currentCaptureStream = stream;
        enableRecordingUI();
      }
    );
  });

  // Start recording
  recordBtn.addEventListener("click", () => {
    console.log("Record button clicked");

    if (!currentCaptureStream) {
      console.warn("No stream to record");
      return;
    }

    // Reset chunks
    recordedChunks = [];

    // Create MediaRecorder
    mediaRecorder = new MediaRecorder(currentCaptureStream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
        console.log("Received data chunk:", e.data.size, "bytes");
      }
    };

mediaRecorder.onstop = async () => {
  const blob = new Blob(recordedChunks, { type: "audio/webm;codecs=opus" });
  console.log("Recording stopped, final blob size:", blob.size, "bytes");

  // Convert audio Blob to ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();
  console.log("Audio as ArrayBuffer, size:", arrayBuffer.byteLength, "bytes");

  // Send the ArrayBuffer to background
  chrome.runtime.sendMessage(
    {
      type: "AUDIO_DATA",
      buffer: new Uint8Array(arrayBuffer),
      mimeType: blob.type,
      size: arrayBuffer.byteLength,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending audio data:", chrome.runtime.lastError.message);
      } else {
        console.log("Background acknowledged audio data:", response);
      }
    }
  );

  console.log("Recorded audio blob ready to send to API:", blob);
};

    mediaRecorder.start();

    // Stop automatically after 5 seconds
    stopBtn.disabled = false;
    recordBtn.disabled = true;

    setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        console.log("Stopping recording after 5 seconds");
        mediaRecorder.stop();
      }
      enableRecordingUI();
    }, 5000);
  });

  // Manually stop recording
  stopBtn.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      console.log("Stopping recording manually");
      mediaRecorder.stop();
    }
    enableRecordingUI();
  });

  // Initial UI state
  enableRecordingUI();
});

