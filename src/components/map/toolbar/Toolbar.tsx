import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import EditMode from '~/enums/editMode';
import navigator from '~/routing/navigator';
import subSites from '~/routing/subSites';
import ToolbarModeButtons from './toolbarModeButtons';
import ToolbarLineButtons from './toolbarLineButtons';
import ToolbarNetworkButtons from './toolbarNetworkButtons';
import ToolbarCommonButtons from './ToolbarCommonButtons';
import ToolbarHelp from './toolbarHelp';
import * as s from './toolbar.scss';

@observer
class Toolbar extends React.Component {
    private getEditMode = () => {
        // TODO: Find a proper solution to this. Divide subSites into two spaces:
        // networkSubsites & lineSubsites?
        return navigator.getPathName() === subSites.network
            || navigator.getPathName() === subSites.networkNode
        ? EditMode.NETWORK : EditMode.LINE;
    }
    render() {
        return (
            <div className={s.toolbarContainer}>
                <div className={s.toolbarRow}>
                    <div className={classnames(s.toolbar, s.modeSpecificToolbar)}>
                        <ToolbarModeButtons editMode={this.getEditMode()} />
                        { this.getEditMode() === EditMode.LINE &&
                            <ToolbarLineButtons />
                        }
                        { this.getEditMode() === EditMode.NETWORK &&
                            <ToolbarNetworkButtons />
                        }
                    </div>
                    <div className={s.toolbar}>
                        <ToolbarCommonButtons />
                    </div>
                </div>
                <ToolbarHelp />
            </div>
        );
    }
}

export default Toolbar;
