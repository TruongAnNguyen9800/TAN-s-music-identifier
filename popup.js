
document.addEventListener("DOMContentLoaded", function () {
  const sendBtn = document.getElementById("sendBtn");
  const getTabBtn = document.getElementById("getTabBtn");

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
});
