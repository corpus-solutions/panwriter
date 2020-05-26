'use strict';

const React = require('react');

class Sidebar extends React.Component {

    render() {
        const sections = this.options.sections.map((section) => {
            let className = 'sidebar-section';
            if (this.activeSection === section.id) {
                className += ' active';
            }
            return React.createElement('div', {key: 'sidebar-section-'+section.id, className: className, onClick: this.selectSection.bind(this, section.id)},
                React.createElement('span', {className: 'section-label'}, section.label)
            );
        });

        return React.createElement('div', { className: 'sidebar' }, sections)
    }

    get options() {
        return this.props.options;
    }

    get activeSection() {
        return this.props.activeSection;

    }

    get onSelectSection() {
        return this.props.onSelectSection;
    }

    selectSection(sectionId) {
        this.setState({
            'activeSection': sectionId
        });

        this.onSelectSection(sectionId);
    }
}

module.exports = Sidebar;
