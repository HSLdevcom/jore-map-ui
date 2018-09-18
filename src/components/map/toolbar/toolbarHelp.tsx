import React, { Component } from 'react';
import ToolbarTool from '../../../enums/toolbarTool';
import * as s from './toolbarHelp.scss';

const textContainers = {
    edit: (
        <div>
            Voit siirtää pysäkkejä tai risteyksiä raahaamalla niitä kartalla.
        </div>
    ),
};

const getToolbarHelpContent = (tool: ToolbarTool) => {
    switch (tool) {
    case ToolbarTool.Edit:
        return textContainers.edit;
    default:
        return null;
    }
};

interface IToolbarHelpProps {
    tool: ToolbarTool;
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
