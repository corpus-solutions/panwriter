'use strict';

const React = require('react');

const DirectoryField = require('./Directory');
const FileField = require("./File");

const fieldMap = {
    'directory': DirectoryField,
    'file': FileField
};

class Group extends React.Component {

    state = {};

    render() {
        let label;
        if (this.label) {
            label = React.createElement('div', { className: 'group-label' }, this.label)
        }

        let fields = this.fields.map((field, idx) => {
            let Field = fieldMap[field.type];
            if (!Field) {
                return;
            }
            return React.createElement(Field, {field: field, key: idx, value: this.preferences[field.key], defaultValue: this.defaults[field.key], onChange: this.onFieldChange.bind(this, field.key)})
        })
            .filter((field) => {
                return field;
            });

        return React.createElement('div', { className: 'group' }, label, fields)
    }

    get label() {
        return this.group.label;
    }

    get fields() {
        return this.group.fields;
    }

    get group() {
        return this.props.group;
    }

    get preferences() {
        return this.props.preferences;
    }

    get defaults() {
        return this.props.defaults;
    }

    get onFieldChange() {
        return this.props.onFieldChange;
    }

}

module.exports = Group;
