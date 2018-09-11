import * as s from './toolbar.scss';
import React, { Component } from 'react';
import { FiEdit, FiCopy, FiPlusSquare, FiPrinter, FiShare2 } from 'react-icons/fi';
import ToolbarButton from './ToolbarButton';
import { ToolbarStore } from '../../stores/toolbarStore';
import { observer } from 'mobx-react';
import { RadioButton } from '../controls';
import ToolbarTools from '../../enums/toolbarTools';
import classnames from 'classnames';

interface ToolbarProps {
    toolbarStore?: ToolbarStore;
}

interface IToolbarState {
    selectedMode: option;
}

enum option {
    LINE = 'Linja',
    NETWORK = 'Verkko',
}

@observer
export default class Toolbar extends Component
<ToolbarProps, IToolbarState> {
    constructor (props: ToolbarProps) {
        super(props);
        this.state = {
            selectedMode: option.LINE,
        };
    }

    private toggleTool = (tool: ToolbarTools) => {
        this.props.toolbarStore!.toggleTool(tool);
    }

    private print = () => {
    }

    private toggleSelectedMode = (option: option) => {
        this.setState({
            selectedMode: option,
        });
    }

    private renderToolbarModeButtons() {
        return (
            <div className={s.modeRadioButtonWrapper}>
                <div
                    className={classnames(
                        s.modeRadioButtonContainer,
                        this.state.selectedMode !== option.LINE ? s.selected : '',
                    )}
                >
                    <RadioButton
                        onClick={this.toggleSelectedMode.bind(this, option.LINE)}
                        checked={this.state.selectedMode === option.LINE}
                        text={option.LINE}
                    />
                    <div
                        className={classnames(
                            s.triangle,
                            s.topTriangle,
                        )}
                    />
                </div>
                <div
                    className={classnames(
                        s.modeRadioButtonContainer,
                        this.state.selectedMode !== option.NETWORK ? s.selected : '',
                    )}
                >
                    <RadioButton
                        onClick={this.toggleSelectedMode.bind(this, option.NETWORK)}
                        checked={this.state.selectedMode === option.NETWORK}
                        text={option.NETWORK}
                    />
                    <div
                        className={classnames(
                            s.triangle,
                            s.bottomTriangle,
                        )}
                    />
                </div>
            </div>
        );
    }

    private renderToolbarToolButtons() {
        return (
            <div className={s.toolbarButtonContainer}>
                {/* First toolbar row */}
                <div className={s.toolbarButtonRow}>
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
                        label='Kopioi reitti toiseen suuntaan'
                    >
                        <FiCopy />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={this.toggleTool.bind(this, ToolbarTools.DivideLink)}
                        isActive={this.props.toolbarStore!.isActive(ToolbarTools.DivideLink)}
                        isDisabled={this.props.toolbarStore!.isDisabled(ToolbarTools.DivideLink)}
                        label='Jaa linkki'
                    >
                        <FiShare2/>
                    </ToolbarButton>
                </div>
                {/* Second toolbar row */}
                <div className={s.toolbarButtonRow}>
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
                        label='Tulosta kartta'
                    >
                        <FiPrinter />
                    </ToolbarButton>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className={s.toolbarView}>
                {this.renderToolbarModeButtons()}
                {this.renderToolbarToolButtons()}
            </div>
        );
    }
}
