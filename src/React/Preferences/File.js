'use strict';

const React = require('react');
const { remote } = window.require('electron');
const { dialog } = remote;

class FileField extends React.Component {

    state = {};

    render() {
        const choose = () => {
            dialog.showOpenDialog({
                properties: [
                    'openFile'
                ],
                filters: [
                    this.filter
                ]
            }).then((res) => {
                if (res.canceled) {
                    return;
                }

                if (res.filePaths && res.filePaths.length) {
                    this.onChange(res.filePaths[0]);
                }
            });
        };

        const reset = () => {
            this.onChange(this.defaultValue);
        };

        const fieldLabel = this.hideLabel  === 'true' ? '': React.createElement('div', {className: "field-label"}, this.label);
        const prefix  = this.hidePrefix === 'true' ? '' : (this.prefix  ? this.prefix + ':' : 'File: ');
        return React.createElement('div', {'className' : 'field field-file'}, fieldLabel,
            React.createElement('div', {className: 'value'}, prefix, this.value),
            React.createElement('div', {},
                React.createElement('div', {className: 'bt', onClick: choose}, 'Choose file'),
                React.createElement('div', {className: 'bt', onClick: reset}, 'Reset to default')
            ),
            this.help ? React.createElement('span', {className: 'help'}, this.help) : ''
        )
    }

    get field() {
        return this.props.field;
    }

    get value() {
        return this.props.value;
    }

    get label() {
        return this.field.label;
    }

    get type() {
        return this.field.type;
    }

    get help() {
        return this.field.help;
    }

    get onChange() {
        return this.props.onChange;
    }

    get defaultValue() {
        return this.props.defaultValue;
    }

    get prefix() {
        return this.field.prefix;
    }

    get filter() {
        return this.field.filter || {}
    }

    get hidePrefix() {
        return this.field.hidePrefix;
    }

    get hideLabel() {
        return this.field.hideLabel;
    }

}

module.exports = FileField;
