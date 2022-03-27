import {fastreadifyPage, patternsInclude, defaultHighlightSheet, defaultRestSheet } from './utils.js';

let applyButton = document.getElementById("applyButton");
let autoButton = document.getElementById("autoButton");
let excludePatternInput = document.getElementById("excludePattern");
let excludePageButton = document.getElementById("excludePageButton");
let restoreButton = document.getElementById("restore-button");
let highlightSheetInput = document.getElementById('highlight-input');
let restSheetInput = document.getElementById('rest-input');

var buttonEnabledClass = 'button-enabled';
var buttonDisabledClass = 'button-disabled';

function setClass(element, cls){
  element.className = cls;
}

async function updatePatternText(){
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

  excludePatternInput.value = tab.url;
  updateExcludeButtonText();
}

function updateExcludeButtonText(){
  var currentPattern = excludePatternInput.value;
  chrome.storage.sync.get(['excludedPatterns'], (data)=>{
    if (data.excludedPatterns.indexOf(currentPattern) != -1){
      excludePageButton.innerText = "Remove pattern from exclude list";
      setClass(excludePageButton, buttonEnabledClass);
    }
    else{
      excludePageButton.innerText = "Add pattern to exclude list";
      setClass(excludePageButton, buttonDisabledClass);
    }
  });
}

updatePatternText();

function toggleExcludedPattern(pattern){

  chrome.storage.sync.get(['excludedPatterns'], (data)=>{
    var patterns = data.excludedPatterns;

    var index = -1;
    for (var i = 0; i < data.excludedPatterns.length; i++){
      if (patterns[i] === pattern){
        index = i;
        break;
      }
    }
    if (index === -1){
      patterns.push(pattern);
    }
    else{
      patterns.splice(index, 1);
    }
    chrome.storage.sync.set({'excludedPatterns': patterns});
    updateExcludeButtonText();
  });
}

excludePageButton.addEventListener("click", async () => {
  toggleExcludedPattern(excludePatternInput.value);
});


function updateAutoApplyText(isAuto){
  if (isAuto){
    autoButton.innerText = 'Disable Auto Apply'
    setClass(autoButton, buttonDisabledClass);
  }
  else{
    autoButton.innerText = 'Enable Auto Apply'
    setClass(autoButton, buttonEnabledClass);
  }
}

chrome.storage.sync.get(['highlightSheet', 'restSheet', 'autoApply'], (data) => {
    highlightSheetInput.value = data.highlightSheet;
    restSheetInput.value = data.restSheet;
    updateAutoApplyText(data.autoApply);
});


highlightSheetInput.addEventListener("input", async (text) => {
    onHighlightInputChange();
});

restSheetInput.addEventListener("input", async (text) => {
    onRestInputChange();
});


excludePatternInput.addEventListener("input", async (text) => {
  updateExcludeButtonText();
});

restoreButton.addEventListener("click", async () => {
    chrome.storage.sync.set({'highlightSheet' : defaultHighlightSheet, "restSheet": defaultRestSheet});
    highlightSheetInput.value = defaultHighlightSheet;
    restSheetInput.value = defaultRestSheet;
});
    

applyButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: fastreadifyPage,
    });
});

autoButton.addEventListener("click", async () => {

  chrome.storage.sync.get(['autoApply'], (data)=>{
    updateAutoApplyText(!data.autoApply);
    chrome.storage.sync.set({'autoApply': !data.autoApply});
  });

});

function onHighlightInputChange(){
    chrome.storage.sync.set({'highlightSheet': highlightSheetInput.value});
}

function onRestInputChange(){
    chrome.storage.sync.set({'restSheet': restSheetInput.value});
}


