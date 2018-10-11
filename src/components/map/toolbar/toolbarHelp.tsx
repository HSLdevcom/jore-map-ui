import React, { Component } from 'react';
import ToolbarTool from '~/enums/toolbarTool';
import * as s from './toolbarHelp.scss';

interface IToolbarHelpProps {
    tool: ToolbarTool;
}

export default class ToolbarHelp extends Component<IToolbarHelpProps> {

    private getToolbarHelpContent(tool: ToolbarTool) {
        const textContainers = {
            edit: (
                <div>
                    Voit siirtää pysäkkejä tai risteyksiä raahaamalla niitä kartalla.
                </div>
            ),
        };
        switch (tool) {
        case ToolbarTool.Edit:
            return textContainers.edit;
        default:
            return null;
        }
    }

    render() {
        const toolbarHelpContent = this.getToolbarHelpContent(this.props.tool);
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
