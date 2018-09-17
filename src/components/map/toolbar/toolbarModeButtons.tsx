import React from 'react';
import classnames from 'classnames';
import { RadioButton } from '../../controls';
import * as s from './toolbarModeButtons.scss';
import EditMode from '../../../enums/editModes';
import toolbarStore from '../../../stores/toolbarStore';

export default class ToolbarModeButtons extends React.Component {
    private toggleSelectedMode = (option: EditMode) => () => {
        toolbarStore.setEditMode(option);
    }

    render() {
        const currentMode = toolbarStore.editMode;

        return (
            <div className={s.toolbarModeButtonsView}>
                <div
                    className={classnames(
                        s.modeRadioButtonContainer,
                        currentMode !== EditMode.LINE ? s.selected : '',
                    )}
                >
                    <RadioButton
                        onClick={this.toggleSelectedMode(EditMode.LINE)}
                        checked={currentMode === EditMode.LINE}
                        text={EditMode.LINE}
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
                        currentMode !== EditMode.NETWORK ? s.selected : '',
                    )}
                >
                    <RadioButton
                        onClick={this.toggleSelectedMode(EditMode.NETWORK)}
                        checked={currentMode === EditMode.NETWORK}
                        text={EditMode.NETWORK}
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
