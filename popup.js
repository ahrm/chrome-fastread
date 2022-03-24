let applyButton = document.getElementById("applyButton");
let restoreButton = document.getElementById("restore-button");
let highlightSheetInput = document.getElementById('highlight-input');
let restSheetInput = document.getElementById('rest-input');

chrome.storage.sync.get(['highlightSheet', 'restSheet'], (data) => {
    highlightSheetInput.value = data.highlightSheet;
    restSheetInput.value = data.restSheet;
});


highlightSheetInput.addEventListener("input", async (text) => {
    onHighlightInputChange();
});

restSheetInput.addEventListener("input", async (text) => {
    onRestInputChange();
});

restoreButton.addEventListener("click", async () => {
    let defaultHighlightSheet = "font-weight: 600;"
    let defaultRestSheet = "opacity: 0.7;"
    chrome.storage.sync.set({'highlightSheet' : defaultHighlightSheet, "restSheet": defaultRestSheet});
    highlightSheetInput.value = defaultHighlightSheet;
    restSheetInput.value = defaultRestSheet;
});
    
applyButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: bionifyPage,
    });
});


function onHighlightInputChange(){
    chrome.storage.sync.set({'highlightSheet': highlightSheetInput.value});
}

function onRestInputChange(){
    chrome.storage.sync.set({'restSheet': restSheetInput.value});
}


function bionifyPage() {
    console.log("bionfying page");

    function createStylesheet() {
        chrome.storage.sync.get(['highlightSheet', 'restSheet'], function(data) {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.id = "bionic-style-id";
            style.innerHTML = '.bionic-highlight {' + data.highlightSheet + ' } .bionic-rest {' + data.restSheet + '}';
            document.getElementsByTagName('head')[0].appendChild(style);
        });
    }

    function deleteStyleSheet() {
        var sheet = document.getElementById('bionic-style-id');
        sheet.remove();
    }

    function hasStyleSheet() {
        return document.getElementById('bionic-style-id') != null;
    }
    function bionifyWord(word) {
        var numBold = 1;
        if (word.length == 1) {
            return word;
        }
        if (word.length == 4) {
            numBold = 2;
        }
        else if (word.length > 4) {
            numBold = Math.floor(word.length * 0.4);
        }

        return "<span class=\"bionic-highlight\">" + word.slice(0, numBold) + "</span>" + "<span class=\"bionic-rest\">" + word.slice(numBold) + "</span>";
    }

    function bionifyText(text) {
        var res = "";
        if (text.length < 10) {
            return text;
        }
        for (var word of text.split(" ")) {
            res += bionifyWord(word) + " ";
        }
        return res;
    }

    function bionifyNode(node) {
        if (node.tagName == 'SCRIPT') return;
        if ((node.childNodes == undefined) || (node.childNodes.length == 0)) {
            if ((node.textContent != undefined) && (node.tagName == undefined)) {
                var newNode = document.createElement('span');
                var bionifiedText = bionifyText(node.textContent)
                newNode.innerHTML = bionifiedText;
                if (node.textContent.length > 20) {
                    node.replaceWith(newNode);
                }
            }
        }
        else {
            for (var child of node.childNodes) {
                bionifyNode(child);
            }
        }
    }

    if (hasStyleSheet()){
        deleteStyleSheet();
    }
    else{
        createStylesheet();
        bionifyNode(document.body);
    }
}