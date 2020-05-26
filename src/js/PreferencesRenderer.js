'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');

const { ipcRenderer } = window.require('electron');
const options = ipcRenderer.sendSync('getPreferenceOptions');
let preferences = ipcRenderer.sendSync('getPreferences');
const defaults = ipcRenderer.sendSync('getDefaults');

const Sidebar = require('../src/React/Preferences/Sidebar');
const Main = require('../src/React/Preferences/Main');

options.sections = options.sections.filter((section) => {
    return _.isBoolean(section.enabled) ? section.enabled : true;
});

options.sections.forEach((section) => {
    if (!preferences[section.id]) {
        preferences[section.id] = {};
    }
    if (!defaults[section.id]) {
        defaults[section.id] = {};
    }
});

class App extends React.Component {
    state = {
        'options': options,
        'activeSection': options.sections[0].id,
        'preferences': preferences,
        'defaults': defaults
    };

    componentDidMount() {
        ipcRenderer.on('changeProps', () => {
            this.setState({'preferences': ipcRenderer.sendSync('getPreferences')});
        });
    }

    render() {
        return React.createElement(React.Fragment, null,
            React.createElement(Sidebar, {...this.state, onSelectSection: this.onSelectSection.bind(this)}),
            React.createElement(Main, {...this.state, onFieldChange: this.onFieldChange.bind(this)})
        );
    }

    onSelectSection(sectionId) {
        this.setState({
            'activeSection': sectionId
        });
    }

    onFieldChange(key, value) {
        preferences[this.state.activeSection][key] = value;

        this.setState({
            'preferences': preferences
        });

        ipcRenderer.send('setPreferences', preferences);
    }

}

ReactDOM.render(
    React.createElement(App, null, ''),
    document.getElementById('container')
);
