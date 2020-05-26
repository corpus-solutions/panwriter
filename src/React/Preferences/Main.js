'use strict';

const React = require('react');
const Group = require('./Group');
const _ = require('lodash');

class Main extends React.Component {

    render() {
        const groups = this.form.groups.map((group, idx) => {
            return React.createElement(Group, {key: idx, group: group, preferences: this.preferences[this.section.id], defaults: this.defaults[this.section.id], onFieldChange: this.onFieldChange.bind(this)});
        });

        return React.createElement('div', { className: 'main' }, groups)
    }

    get options() {
        return this.props.options;
    }

    get form() {
        return this.section.form;
    }

    get preferences() {
        return this.props.preferences;
    }

    get defaults() {
        return this.props.defaults;
    }

    get sections() {
        return this.options.sections;
    }

    get activeSection() {
        return this.props.activeSection;
    }

    get section() {
        return _.find(this.sections, {
            'id': this.activeSection
        });
    }

    get onFieldChange() {
        return this.props.onFieldChange;
    }

}

module.exports = Main;
