import React from 'react';
import { observer } from 'mobx-react';
import { ToolbarStore } from '../../../stores/toolbarStore';
import ToolbarModeButtons from './toolbarModeButtons';
import ToolbarToolButtons from './toolbarToolButtons';
import * as s from './toolbar.scss';

interface IToolbarProps {
    toolbarStore?: ToolbarStore;
}

@observer
export default class Toolbar extends React.Component<IToolbarProps> {
    constructor(props: IToolbarProps) {
        super(props);
    }
    render() {
        return (
            <div className={s.toolbarView}>
                <ToolbarModeButtons />
                <ToolbarToolButtons />
            </div>
        );
    }
}
