import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ToolbarStore from '~/stores/toolbarStore';
import * as s from './toolbarHelp.scss';

@observer
class ToolbarHelp extends Component {
    render() {
        const selectedTool = ToolbarStore!.selectedTool;
        if (!selectedTool || !selectedTool.toolHelpText) return null;

        return (
            <div className={s.toolbarHelp}>
                <div className={s.toolbarHelpHeader}>
                    {selectedTool.toolHelpHeader}
                </div>
                {selectedTool.toolHelpText}
            </div>
        );
    }
}

export default ToolbarHelp;
