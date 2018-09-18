import React, { Component } from 'react';
import ToolbarTools from '../../../enums/toolbarTools';
import * as s from './toolbarHelp.scss';

const submenus = {
    edit: (
        <div>
            Voit nyt raahata solmut ja pysäkit kartalla.
        </div>
    ),
};

const getToolbarHelpContent = (tool: ToolbarTools) => {
    switch (tool) {
    case ToolbarTools.Edit:
        return submenus.edit;
    default:
        return null;
    }
};

interface IToolbarHelpProps {
    tool: ToolbarTools;
}

export default class ToolbarHelp extends Component<IToolbarHelpProps> {
    render() {
        const toolbarHelpContent = getToolbarHelpContent(this.props.tool);
        if (!toolbarHelpContent) return null;

        return (
            <div className={s.toolbarHelp}>
                {
                    toolbarHelpContent
                }
            </div>
        );
    }
}
