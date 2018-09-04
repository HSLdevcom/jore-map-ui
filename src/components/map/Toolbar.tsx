import React, { Component } from 'react';
import { FiEdit, FiCopy, FiPlusSquare, FiPrinter } from 'react-icons/fi';
import { observer } from 'mobx-react';
import { ToolbarStore } from '../../stores/toolbarStore';
import ToolbarButton from './ToolbarButton';
import ToolbarTools from '../../enums/toolbarTools';
import * as s from './toolbar.scss';

interface ToolbarProps {
    toolbarStore?: ToolbarStore;
}

@observer
export default class Toolbar extends Component<ToolbarProps> {
    constructor (props: ToolbarProps) {
        super(props);
    }

    private toggleTool = (tool: ToolbarTools) => {
        this.props.toolbarStore!.toggleTool(tool);
    }

    private print = () => {
    }

    render() {
        return (
            <div className={s.toolbar}>
                <ToolbarButton
                    onClick={this.toggleTool.bind(this, ToolbarTools.Edit)}
                    isActive={this.props.toolbarStore!.isActive(ToolbarTools.Edit)}
                    isDisabled={this.props.toolbarStore!.isDisabled(ToolbarTools.Edit)}
                    label='Muokkaa solmuja'
                >
                    <FiEdit />
                </ToolbarButton>
                <ToolbarButton
                    onClick={this.toggleTool.bind(this, ToolbarTools.Copy)}
                    isActive={this.props.toolbarStore!.isActive(ToolbarTools.Copy)}
                    isDisabled={this.props.toolbarStore!.isDisabled(ToolbarTools.Copy)}
                    label='Kopio reitti'
                >
                    <FiCopy />
                </ToolbarButton>
                <ToolbarButton
                    onClick={this.toggleTool.bind(this, ToolbarTools.AddNode)}
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
