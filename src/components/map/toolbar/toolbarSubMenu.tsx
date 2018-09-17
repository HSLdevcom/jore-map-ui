import React, { Component } from 'react';
import { observer } from 'mobx-react';
import toolbarStore from '../../../stores/toolbarStore';
import * as s from './toolbarSubMenu.scss';
import ToolbarTools from '../../../enums/toolbarTools';
import NodeType from '../../../enums/nodeType';
import { RadioButton } from '../../controls';

interface IToolbarSubMenuState {
    addNodeType: NodeType;
}

interface IToolbarSubMenuProps {
}

@observer
export default class ToolbarSubMenu extends Component<IToolbarSubMenuProps, IToolbarSubMenuState> {
    constructor(props: IToolbarSubMenuProps) {
        super(props);
        this.state = {
            addNodeType: NodeType.STOP,
        };
    }

    toggleAddNodeType = (nodeType: NodeType) => {
        this.setState({ addNodeType: nodeType });
    }

    render () {
        if (toolbarStore.activeTool === ToolbarTools.AddNode) {
            return (
                <div className={s.toolbarSubMenu}>
                    <div className={s.leftColumn}>
                        <RadioButton
                            onClick={this.toggleAddNodeType.bind(this, NodeType.STOP)}
                            checked={this.state.addNodeType === NodeType.STOP}
                            text='Pysäkki'
                        />
                        <RadioButton
                            onClick={this.toggleAddNodeType.bind(this, NodeType.CROSSROAD)}
                            checked={this.state.addNodeType === NodeType.CROSSROAD}
                            text='Risteys'
                        />
                    </div>
                    <div className={s.rightColumn}>
                        {
                            `Click location on map where to add
                            ${
                                this.state.addNodeType === NodeType.STOP
                                ? 'stop'
                                : 'crossroad'
                            }`
                        }
                    </div>
                </div>
            );
        }
        return null;
    }
}
