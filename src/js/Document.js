"use strict";

// Singleton Document,
// exists exactly once in each window renderer process.

var { ipcRenderer, remote }  = require('electron')
  , fs              = require('fs')
  , promisify          = require('util').promisify
  , getTypeRelativeFileName = require('../Panwriter/Settings').getTypeRelativeFileName
  ;

var md       = ""
  , yaml     = ""
  , bodyMd   = ""
  , meta     = {}
  , html     = ""
  , filePath = remote.getCurrentWindow().filePathToLoad
  ;

if (filePath) {
  addToRecentFiles(filePath);
}

/*
 * Setters
 */

module.exports.setDoc = function(mdStr, yamlStr, bodyMdStr, metaObj) {
  md     = mdStr;
  yaml   = yamlStr;
  bodyMd = bodyMdStr;
  meta   = metaObj;
  ipcRenderer.send('documentUpdated', filePath, meta);
}

module.exports.setHtml = function(htmlStr) {
  html = htmlStr;
}

module.exports.setPath = function(path) {
  filePath = path;
  addToRecentFiles(filePath);
}


/*
 * Getters
 */

module.exports.getDoc = function() {
  return {
    md:     md
  , yaml:   yaml
  , bodyMd: bodyMd
  , meta:   meta
  , html:   html
  };
}

module.exports.getMd = function() {
  return md;
}

module.exports.getMeta = function() {
  return meta;
}

module.exports.getFilePath = function() {
  return filePath;
}

module.exports.getHtml = function() {
  return html;
}

module.exports.getBodyMd = function() {
  return bodyMd;
}

module.exports.getNrOfYamlLines = function() {
  if (yaml.length === 0) {
    return 0;
  } else {
    var nrOfLines = 2;
    for(var i=0; i<yaml.length; ++i) {
      if (yaml[i] === '\n'){
        nrOfLines++;
      }
    }
    return nrOfLines;
  }
}

var defaultStaticCssLink = remote.app.getAppPath() + '/static/default.css'
  , link
  , docType = null
  ;

// Listen to the `preferencesUpdated` event to be notified when preferences are changed.
ipcRenderer.on('preferencesUpdated', (e, preferences, oldPreferences) => {
  //clear css cache
  if(oldPreferences['userDataDir'] != preferences['userDataDir']) {
    docType = null
  }
});

module.exports.getCss = async function() {
  var linkIsChanged = false;
  if (meta.type !== docType) {
    // cache css
    docType = meta.type;
    const fileName = getTypeRelativeFileName(filePath, docType, '.css')
    try {
        await promisify(fs.access)(fileName)
        link = fileName;
    } catch (err) {
      link = defaultStaticCssLink;
    }
    linkIsChanged = true;
  }
  return [ typeof meta.style === "string" ? meta.style : ''
         , link
         , linkIsChanged
         ]
}

module.exports.getPath = function() {
  return filePath;
}

/*
 * Private
 */

function addToRecentFiles(filePath) {
  var recents = JSON.parse( localStorage.getItem('recentFiles') )
  if (recents instanceof Array) {
    recents = recents.filter(f => f !== filePath)
  } else {
    recents = [];
  }
  recents.unshift(filePath);
  recents = recents.slice(0, 15);
  localStorage.setItem('recentFiles', JSON.stringify(recents));
}
