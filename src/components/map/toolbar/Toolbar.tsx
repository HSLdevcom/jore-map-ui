import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import ToolbarLineButtons from './toolbarLineButtons';
import ToolbarCommonButtons from './ToolbarCommonButtons';
import ToolbarHelp from './toolbarHelp';
import * as s from './toolbar.scss';

@observer
class Toolbar extends React.Component {
    render() {
        return (
            <div className={s.toolbarContainer}>
                <div className={s.toolbarRow}>
                    <div className={classnames(s.toolbar, s.modeSpecificToolbar)}>
                        <ToolbarLineButtons />
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
