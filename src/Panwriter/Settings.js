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

function defaultPandocExecutable() {
    return 'pandoc';
}

function getPandocExecutable(currentFile, docMeta, metaFile, extMeta) {
    if(!docMeta) {
        docMeta = {};
    }

    const prefs = ipcRenderer.sendSync('getPreferences');
    if(docMeta['pandoc']) {
        const pandocPath = docMeta['pandoc'];
        if(pandocPath.startsWith('.')) { //relative paths are resolved against current file path
            const dirname = path.dirname(currentFile)
            return dirname + "/" + pandocPath;
        } else {
            return pandocPath;
        }
    } else if(extMeta['pandoc']) {
        const pandocPath = extMeta['pandoc'];
        if(pandocPath.startsWith('.')) { //relative paths are resolved against current file path
            const dirname = path.dirname(metaFile)
            return dirname + "/" + pandocPath;
        } else {
            return pandocPath;
        }
    } else {
        return prefs['main']['pandocPath'] || defaultPandocExecutable();
    }
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
module.exports.defaultPandocExecutable = defaultPandocExecutable;
module.exports.getPandocExecutable = getPandocExecutable;
module.exports.getDataDir = getDataDir;
module.exports.getDataDirFileName = getDataDirFileName;
module.exports.getTypeRelativeFileName = getTypeRelativeFileName;

exports.getPreferences = getPreferences;
exports.setPreferenceString = setPreferenceExp
exports.setPreferenceBoolean = setPreferenceExp
