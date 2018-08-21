import * as s from './toolbar.scss';
import React, { Component } from 'react';
import { FiEdit, FiCopy, FiPlusSquare } from 'react-icons/fi';
import ToolbarIcon from './ToolbarIcon';

interface ToolbarState {
    editModeIsActive: boolean;
}

interface ToolbarProps {

}

export default class Toolbar extends Component<ToolbarProps, ToolbarState> {
    constructor (props: ToolbarProps) {
        super(props);
        this.state = {
            editModeIsActive: false,
        };
    }

    render() {
        const editRoutes = () => {
            console.log('Toggling editmode');
            this.setState({
                editModeIsActive: !this.state.editModeIsActive,
            });
        };

        const copyRoute = () => {
            console.log('Copying');
        };

        const addNode = () => {
            console.log('Copying');
        };

        return (
            <div className={s.toolbar}>
                <ToolbarIcon
                    onClick={editRoutes}
                    isActive={this.state.editModeIsActive}
                    isDisabled={false}
                    label='Muokkaa solmuja'
                >
                    <FiEdit />
                </ToolbarIcon>
                <ToolbarIcon
                    onClick={copyRoute}
                    isActive={false}
                    isDisabled={false}
                    label='Kopio reitti'
                >
                    <FiCopy />
                </ToolbarIcon>
                <ToolbarIcon
                    onClick={addNode}
                    isActive={false}
                    isDisabled={true}
                    label='Lisää solmu'
                >
                    <FiPlusSquare />
                </ToolbarIcon>
            </div>
        );
    }
}
