import React from 'react';
import classnames from 'classnames';
import EditMode from '~/enums/editMode';
import toolbarStore from '~/stores/toolbarStore';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { RadioButton } from '../../controls';
import * as s from './toolbarModeButtons.scss';

export default class ToolbarModeButtons extends React.Component {
    private selectLineMode() {
        toolbarStore.setEditMode(EditMode.LINE);
        const homeViewLink = routeBuilder
            .to(subSites.home)
            .clear()
            .toLink();
        navigator.goTo(homeViewLink);
    }

    private selectNetworkMode() {
        toolbarStore.setEditMode(EditMode.NETWORK);
        const networkViewLink = routeBuilder
            .to(subSites.network)
            .clear()
            .toLink();
        navigator.goTo(networkViewLink);
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
                        onClick={this.selectLineMode}
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
                        onClick={this.selectNetworkMode}
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
