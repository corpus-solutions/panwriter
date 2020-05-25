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

function getTypeRelativeFileName(currentFile, type, suffix) {
    if (typeof type !== 'string') {
        type = 'default'
    }
    if(type.startsWith('.')) { //relative paths are resolved against current file path
        const dirname = path.dirname(currentFile)
        return dirname + "/" + type + suffix;
    } else {
        return getDataDirFileName(type, suffix);
    }
}

function getPreferences() {
    return ipcRenderer.sendSync('getPreferences');
}

function setPreference(key, value) {
    return ipcRenderer.sendSync('setPreference', key, value)
}

function setPreferenceExp(key) {
    return function(value) {
        return function() {
            setPreference(key, value);
        };
    }
};

module.exports.defaultDataDir = defaultDataDir;
module.exports.getDataDir = getDataDir;
module.exports.getDataDirFileName = getDataDirFileName;
module.exports.getTypeRelativeFileName = getTypeRelativeFileName;

exports.getPreferences = getPreferences;
exports.setPreferenceString = setPreferenceExp
exports.setPreferenceBoolean = setPreferenceExp
