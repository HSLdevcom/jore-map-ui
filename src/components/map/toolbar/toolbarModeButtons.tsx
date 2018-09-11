import React from 'react';
import classnames from 'classnames';
import { RadioButton } from '../../controls';
import * as s from './toolbar.scss';

interface IToolbarModeButtonsProps {
}

interface IToolbarState {
    selectedMode: option;
}

enum option {
    LINE = 'Linja',
    NETWORK = 'Verkko',
}

export default class ToolbarModeButtons extends React.Component
<IToolbarModeButtonsProps, IToolbarState> {
    constructor (props: any) {
        super(props);
        this.state = {
            selectedMode: option.LINE,
        };
    }

    private toggleSelectedMode = (option: option) => {
        this.setState({
            selectedMode: option,
        });
    }

    render() {
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
}
