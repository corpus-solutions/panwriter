"use strict";

const electron = require('electron')
    , ipcRenderer      = electron.ipcRenderer
    , path        = require('path');

function defaultDataDir(app) {
    if(!app) {
        app = electron.app || electron.remote.app;
    }
    const dataDir = [app.getPath('appData'), 'PanWriterUserData', '']
                      .join(path.sep)
    return dataDir
}

function getDataDir(prefs) {
    if(!prefs) {
        prefs = ipcRenderer.sendSync('getPreferences');
    }
    return prefs['main']['userDataDir'] || defaultDataDir();
}

function getDataDirFileName(type, suffix) {
    if (typeof type !== 'string') {
      type = 'default'
    }
    const dataDir = getDataDir()
    return dataDir + type + suffix;
}

function getPreferences() {
    return ipcRenderer.sendSync('getPreferences');
}

function setPreference(key, value) {
    return ipcRenderer.sendSync('setPreference', key, value)
}

module.exports.defaultDataDir = defaultDataDir;
module.exports.getDataDir = getDataDir;
module.exports.getDataDirFileName = getDataDirFileName;
