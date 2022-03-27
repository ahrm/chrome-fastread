
export function fastreadifyPage() {

    function createStylesheet() {
        chrome.storage.sync.get(['highlightSheet', 'restSheet'], function(data) {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.id = "fastread-style-id";
            style.innerHTML = '.fastread-highlight {' + data.highlightSheet + ' } .fastread-rest {' + data.restSheet + '}';
            document.getElementsByTagName('head')[0].appendChild(style);
        });
    }

    function deleteStyleSheet() {
        var sheet = document.getElementById('fastread-style-id');
        sheet.remove();
    }

    function hasStyleSheet() {
        return document.getElementById('fastread-style-id') != null;
    }
    function fastreadifyWord(word) {
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

        return "<span class=\"fastread-highlight\">" + word.slice(0, numBold) + "</span>" + "<span class=\"fastread-rest\">" + word.slice(numBold) + "</span>";
    }

    function fastreadifyText(text) {
        var res = "";
        if (text.length < 10) {
            return text;
        }
        for (var word of text.split(" ")) {
            res += fastreadifyWord(word) + " ";
        }
        return res;
    }

    function fastreadifyNode(node) {
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
        if ((node.childNodes == undefined) || (node.childNodes.length == 0)) {
            if ((node.textContent != undefined) && (node.tagName == undefined)) {
                var newNode = document.createElement('span');
                newNode.innerHTML = fastreadifyText(node.textContent);
                if (node.textContent.length > 20) {
                    node.replaceWith(newNode);
                }
            }
        }
        else {
            for (var child of node.childNodes) {
                fastreadifyNode(child);
            }
        }
    }

    if (hasStyleSheet()){
        deleteStyleSheet();
    }
    else{
        createStylesheet();
        fastreadifyNode(document.body);
    }
}

export function patternsInclude(patterns, url){

  for (var pattern of patterns){
    if (url.match(pattern)){
      return true;
    }
  }
  return false;
}

export let defaultHighlightSheet = "font-weight: 600;"
export let defaultRestSheet = "opacity: 0.8;"
