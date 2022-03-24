let color = '#3aa757';
let defaultHighlightSheet = "font-weight: 600;"
let defaultRestSheet = "opacity: 0.8;"

chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.set({'highlightSheet' : defaultHighlightSheet, "restSheet": defaultRestSheet});
});