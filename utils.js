
export let defaultHighlightSheet = "font-weight: 600;"
export let defaultRestSheet = "opacity: 0.8;"
export let defaultAlgorithm = "- 0 1 1 2 0.4";



export function fastreadifyPage() {

  function parseAlgorithm(algorithm){

    try {
      var res = {
        exclude: true,
        sizes : [],
        restRatio : 0.4
      };
      let parts = algorithm.split(' ');

      if (parts[0] == '+'){
        res.exclude = false;
      }

      res.restRatio = Number(parts[parts.length - 1]);

      for (var i = 1; i < parts.length - 1; i++){
        res.sizes.push(parts[i]);
      }
      return res;
    }

    catch {

      var defaultRes = {
        exclude: true,
        sizes : [1, 1, 2],
        restRatio : 0.4
      };
      console.log("not parsed");
      console.log(defaultRes);
      return defaultRes;
    }

  }

  chrome.storage.sync.get(['algorithm'], (data)=>{
    var algorithm = parseAlgorithm(data.algorithm);

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
    /*     function fastreadifyWord(word) {
     *         var numBold = 1;
     *         if (word.length == 1) {
     *             return word;
     *         }
     *         if (word.length == 4) {
     *             numBold = 2;
     *         }
     *         else if (word.length > 4) {
     *             numBold = Math.floor(word.length * 0.4);
     *         }
     *
     *         return "<span class=\"fastread-highlight\">" + word.slice(0, numBold) + "</span>" + "<span class=\"fastread-rest\">" + word.slice(numBold) + "</span>";
     *     } */

    let commonWords = [
      'the',
      'be',
      'to',
      'of',
      'and',
      'a',
      'an',
      'it',
      'at',
      'on',
      'he',
      'she',
      'but',
      'is',
      'my'
    ];

    function fastreadifyWord(word) {

      function isCommon(word){
          return commonWords.indexOf(word) != -1;
      }

      var index = word.length-1;

      var numBold = 1;

      if ((word.length <= 3) && algorithm.exclude) {
        if (isCommon(word)) return word;
      }

      if (index < algorithm.sizes.length){
        numBold = algorithm.sizes[index];
      }
      else{

        numBold = Math.ceil(word.length * algorithm.restRatio);
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
      console.log(node.tagName);
      if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.nodeType === 8) return;
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
  });

}

export function patternsInclude(patterns, url){

  for (var pattern of patterns){
    if (url.match(pattern)){
      return true;
    }
  }
  return false;
}
