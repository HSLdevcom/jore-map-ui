import React from 'react';
import { observer } from 'mobx-react';
import ToolbarModeButtons from './toolbarModeButtons';
import ToolbarToolButtons from './toolbarToolButtons';
import * as s from './toolbar.scss';

@observer
export default class Toolbar extends React.Component {
    render() {
        return (
            <div className={s.toolbarView}>
                <ToolbarModeButtons />
                <ToolbarToolButtons />
            </div>
        );
    }
}
