"use strict";

const electron = require('electron');
const { BrowserWindow, ipcMain, webContents, Menu } = electron;
const path = require('path');
const url = require('url');
const fs = require('fs-extra');
const { EventEmitter2 } = require('eventemitter2');
const _ = require('lodash');

class PanWriterPreferences extends EventEmitter2 {

    constructor(options = {}) {
        super();

        _.defaultsDeep(options, {
            'sections': []
        });

        options.sections.forEach((section, sectionIdx) => {
            _.defaultsDeep(section, {
                'form': {
                    'groups': []
                }
            });
            section.form.groups = section.form.groups.map((group, groupIdx) => {
                group.id = 'group' + sectionIdx + groupIdx;
                return group;
            });
        });

        this.options = options;

        if (!this.configFilePath) {
            throw new Error(`The 'configFilePath' option is required.`);
        }

        fs.ensureFileSync(this.configFilePath);

        this.preferences = fs.readJsonSync(this.configFilePath, {
            'throws': false
        });

        if (!this.preferences) {
            this.preferences = this.defaults;
        } else {
            _.keys(this.defaults).forEach(prefDefault => {
                if (!(prefDefault in this.preferences)) {
                    this.preferences[prefDefault] = this.defaults[prefDefault]
                }
            })
        }

        if (_.isFunction(options.onLoad)) {
            this.preferences = options.onLoad(this.preferences);
        }

        this.save();

        ipcMain.on('showPreferences', (event) => {
            this.show();
        });

        ipcMain.on('getPreferenceOptions', (event) => {
            event.returnValue = this.options;
        });

        ipcMain.on('restoreDefaults', (event, value) => {
            const oldValue = Object.freeze(_.cloneDeep(this.preferences));
            this.preferences = this.defaults;
            this.save();
            this.broadcast(oldValue);
        });

        ipcMain.on('getDefaults', (event, value) => {
            event.returnValue = this.defaults;
        });

        ipcMain.on('getPreferences', (event, value) => {
            event.returnValue = this.preferences;
        });

        ipcMain.on('setPreferences', (event, value) => {
            const oldValue = Object.freeze(_.cloneDeep(this.preferences));
            this.preferences = value;
            this.save();
            this.broadcast(oldValue);
            this.emit('save', Object.freeze(_.cloneDeep(this.preferences)));
            event.returnValue = null;
        });

        ipcMain.on('readPreferences', () => {
            this.preferences = fs.readJsonSync(this.configFilePath, {
                'throws': false
            });

            webContents.getAllWebContents().forEach(webContent => webContent.send('changeProps'))
        });

        if (_.isFunction(options.afterLoad)) {
            options.afterLoad(this);
        }

    }

    get configFilePath() {
        return this.options.configFilePath;

    }

    get defaults() {
        return this.options.defaults || {};
    }

    get preferences() {
        return this._preferences;
    }

    set preferences(value) {
        this._preferences = value;
    }

    save() {
        fs.writeJsonSync(this.configFilePath, this.preferences, {
            'spaces': 4
        });
    }

    value(key, value) {
        if (!_.isUndefined(key) && !_.isUndefined(value)) {
            const oldValue = Object.freeze(_.cloneDeep(this.preferences));
            _.set(this.preferences, key, value);
            this.save();
            this.broadcast(oldValue);
        } else if (!_.isUndefined(key)) {
            return _.cloneDeep(_.get(this.preferences, key));
        } else {
            return _.cloneDeep(this.preferences);
        }
    }

    broadcast(oldValue) {
        webContents.getAllWebContents()
            .forEach((wc) => {
                wc.send('preferencesUpdated', this.preferences, oldValue || {});
            });
    }

    show() {
        if (this.prefsWindow) {
            this.prefsWindow.focus();
            return;
        }

        let browserWindowOpts = {
            'title': 'Preferences',
            'width': 800,
            'maxWidth': 800,
            'height': 400,
            'maxHeight': 400,
            'resizable': false,
            'acceptFirstMouse': true,
            'maximizable': false,
            'backgroundColor': '#f7f7f7',
            'show': true,
            'webPreferences': {
                nodeIntegration: true,
                devTools: true
            }
        };

        this.prefsWindow = new BrowserWindow(browserWindowOpts);
        this.prefsWindow.setMenu(Menu.buildFromTemplate([{
            label: 'View',
            submenu: [
                {role: 'toggledevtools'}
            ]
            }]));

        this.prefsWindow.loadURL(url.format({
            'pathname': path.join(__dirname, '../../static/preferences.html'),
            'protocol': 'file:',
            'slashes': true
        }));

        this.prefsWindow.on('closed', () => {
            this.prefsWindow = null;
        });
    }

}

module.exports = PanWriterPreferences;