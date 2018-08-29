import * as s from './toolbar.scss';
import React, { Component } from 'react';
import { FiEdit, FiCopy, FiPlusSquare, FiPrinter } from 'react-icons/fi';
import ToolbarButton from './ToolbarButton';
import { ToolbarStore } from '../../stores/toolbarStore';
import { observer } from 'mobx-react';
import ToolbarTools from '../../enums/toolbarTools';

interface ToolbarProps {
    toolbarStore?: ToolbarStore;
}

@observer
export default class Toolbar extends Component<ToolbarProps> {
    constructor (props: ToolbarProps) {
        super(props);
    }

    private editRoutes = () => {
        this.props.toolbarStore!.toggleTool(ToolbarTools.Edit);
    }

    private copyRoute = () => {
        this.props.toolbarStore!.toggleTool(ToolbarTools.Copy);
    }

    private addNode = () => {
        this.props.toolbarStore!.toggleTool(ToolbarTools.AddNode);
    }

    private print = () => {
    }

    render() {
        return (
            <div className={s.toolbar}>
                <ToolbarButton
                    onClick={this.editRoutes}
                    isActive={this.props.toolbarStore!.isActive(ToolbarTools.Edit)}
                    isDisabled={this.props.toolbarStore!.isDisabled(ToolbarTools.Edit)}
                    label='Muokkaa solmuja'
                >
                    <FiEdit />
                </ToolbarButton>
                <ToolbarButton
                    onClick={this.copyRoute}
                    isActive={this.props.toolbarStore!.isActive(ToolbarTools.Copy)}
                    isDisabled={this.props.toolbarStore!.isDisabled(ToolbarTools.Copy)}
                    label='Kopio reitti'
                >
                    <FiCopy />
                </ToolbarButton>
                <ToolbarButton
                    onClick={this.addNode}
                    isActive={this.props.toolbarStore!.isActive(ToolbarTools.AddNode)}
                    isDisabled={this.props.toolbarStore!.isDisabled(ToolbarTools.AddNode)}
                    label='Lisää solmu'
                >
                    <FiPlusSquare />
                </ToolbarButton>
                <ToolbarButton
                    onClick={this.print}
                    isActive={false}
                    isDisabled={this.props.toolbarStore!.isDisabled(ToolbarTools.Print)}
                    label='tulostaa kartan'
                >
                    <FiPrinter />
                </ToolbarButton>
            </div>
        );
    }
}
