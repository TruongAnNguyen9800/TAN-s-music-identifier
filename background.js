chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "POPUP_CLICK") {
    console.log("Popup clicked!");
    console.log("Message:", request.message);

    sendResponse({ ok: true, from: "background" });
  }

  if (request.type === "GET_CURRENT_TAB") {
  
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs) => {
        if (tabs.length > 0) {
          const tab = tabs[0];
          console.log("Active tab URL:", tab.url);
          console.log("Tab title:", tab.title);

          sendResponse(tab); // to the popup
        } else {
          sendResponse({ error: "No active tab found" });
        }
      }
    );

    return true; // so that sendResponse keep open until tabs.query done.
  }
});
