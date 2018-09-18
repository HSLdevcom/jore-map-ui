import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import ToolbarModeButtons from './toolbarModeButtons';
import toolbarStore from '../../../stores/toolbarStore';
import EditMode from '../../../enums/editMode';
import ToolbarLineButtons from './toolbarLineButtons';
import ToolbarNetworkButtons from './toolbarNetworkButtons';
import ToolbarCommonButtons from './ToolbarCommonButtons';
import ToolbarHelp from './toolbarHelp';
import * as s from './toolbar.scss';

@observer
export default class Toolbar extends React.Component {
    render() {
        return (
            <div className={s.toolbarContainer}>
                <div className={s.toolbarRow}>
                    <div className={classnames(s.toolbar, s.modeSpecificToolbar)}>
                        <ToolbarModeButtons />
                        { toolbarStore.editMode === EditMode.LINE &&
                            <ToolbarLineButtons />
                        }
                        { toolbarStore.editMode === EditMode.NETWORK &&
                            <ToolbarNetworkButtons />
                        }
                    </div>
                    <div className={s.toolbar}>
                        <ToolbarCommonButtons />
                    </div>
                </div>
                <ToolbarHelp tool={toolbarStore.activeTool} />
            </div>
        );
    }
}
