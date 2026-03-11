document.addEventListener("DOMContentLoaded", function () {
  const sendBtn = document.getElementById("sendBtn");
  const getTabBtn = document.getElementById("getTabBtn");
  const captureBtn = document.getElementById("captureBtn");

  sendBtn.addEventListener("click", async () => {
    const response = await chrome.runtime.sendMessage({
      type: "POPUP_CLICK",
      message: "Hello from popup!",
    });
    console.log("Background responded:", response);
  });

  getTabBtn.addEventListener("click", async () => {
    const response = await chrome.runtime.sendMessage({
      type: "GET_CURRENT_TAB",
    });
    console.log("Current tab:", response);
  });

  captureBtn.addEventListener("click", async () => {
    console.log("Capture button clicked");

    if (!chrome.tabCapture) {
      console.error("chrome.tabCapture is not available");
      return;
    }

    chrome.tabCapture.capture( // this capture the audio in the current tabs
      {
        audio: true,
        video: false,
      },
      (stream) => {
        if (chrome.runtime.lastError || !stream) {
          console.error("Error capturing tab audio:", chrome.runtime.lastError);
          return;
        }

        console.log("Audio stream captured in popup:", stream);
        console.log("Stream ID:", stream.id);
        console.log("Audio tracks:", stream.getAudioTracks());

        // this keeps audio playing(or else the audio just not there though it still plays)
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        source.connect(context.destination);
      }
    );
  });
});
