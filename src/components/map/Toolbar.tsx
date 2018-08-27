import * as s from './toolbar.scss';
import React, { Component } from 'react';
import { FiEdit, FiCopy, FiPlusSquare, FiPrinter } from 'react-icons/fi';
import ToolbarButton from './ToolbarButton';

interface ToolbarState {
    activeTool: Tools;
    disabledTools: Tools[];
}

interface ToolbarProps {

}

enum Tools {
    Edit,
    Copy,
    AddNode,
    Print,
    None,
}

export default class Toolbar extends Component<ToolbarProps, ToolbarState> {
    constructor (props: ToolbarProps) {
        super(props);
        this.state = {
            activeTool: Tools.None,
            disabledTools: [Tools.Print],
        };

        this.toggleActiveTool = this.toggleActiveTool.bind(this);
        this.isDisabled = this.isDisabled.bind(this);
    }

    toggleActiveTool = (tool : Tools) => {
        if (this.state.disabledTools.indexOf(tool) > -1) {
            return;
        } if (this.state.activeTool === tool) {
            this.setState({
                activeTool: Tools.None,
            });
        } else {
            this.setState({
                activeTool: tool,
            });
        }
    }

    isDisabled = (tool: Tools) => {
        return this.state.disabledTools.indexOf(tool) > -1;
    }

    render() {
        const editRoutes = () => {
            this.toggleActiveTool(Tools.Edit);
        };

        const copyRoute = () => {
            this.toggleActiveTool(Tools.Copy);
        };

        const addNode = () => {
            this.toggleActiveTool(Tools.AddNode);
        };

        const print = () => {
        };

        return (
            <div className={s.toolbar}>
                <ToolbarButton
                    onClick={editRoutes}
                    isActive={this.state.activeTool === Tools.Edit}
                    isDisabled={this.isDisabled(Tools.Edit)}
                    label='Muokkaa solmuja'
                >
                    <FiEdit />
                </ToolbarButton>
                <ToolbarButton
                    onClick={copyRoute}
                    isActive={this.state.activeTool === Tools.Copy}
                    isDisabled={this.isDisabled(Tools.Copy)}
                    label='Kopio reitti'
                >
                    <FiCopy />
                </ToolbarButton>
                <ToolbarButton
                    onClick={addNode}
                    isActive={this.state.activeTool === Tools.AddNode}
                    isDisabled={this.isDisabled(Tools.AddNode)}
                    label='Lisää solmu'
                >
                    <FiPlusSquare />
                </ToolbarButton>
                <ToolbarButton
                    onClick={print}
                    isActive={false}
                    isDisabled={this.isDisabled(Tools.Print)}
                    label='tulostaa kartan'
                >
                    <FiPrinter />
                </ToolbarButton>
            </div>
        );
    }
}
