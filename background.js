chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.type === "POPUP_CLICK") {
    console.log("Popup clicked!");
    console.log("Message:", request.message);
    sendResponse({ ok: true, from: "background" });
  }

  if (request.type === "GET_CURRENT_TAB") { // this gets the current tab ofc
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tab = tabs[0];
        console.log("Active tab URL:", tab.url);
        console.log("Tab title:", tab.title);
        sendResponse(tab);
      } else {
        sendResponse({ error: "No active tab found" });
      }
    });

    return true;
  }

  if (request.type === "CAPTURE_TAB_AUDIO") { // for whatever reason chrome.tabCapture.capture does not work here(background.js) anymore so it is at popup.js now.
  return true;
}
});
