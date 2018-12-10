import React from 'react';
import classnames from 'classnames';
import EditMode from '~/enums/editMode';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import ToolbarStore from '~/stores/toolbarStore';
import { RadioButton } from '../../controls';
import * as s from './toolbarModeButtons.scss';

interface IToolbarModeButtonsProps {
    editMode: EditMode;
}

export default class ToolbarModeButtons extends React.Component<IToolbarModeButtonsProps> {
    private selectLineMode() {
        ToolbarStore.selectTool(null);
        const homeViewLink = routeBuilder
            .to(subSites.home)
            .clear()
            .toLink();
        navigator.goTo(homeViewLink);
    }

    private selectNetworkMode() {
        ToolbarStore.selectTool(null);
        const networkViewLink = routeBuilder
            .to(subSites.network)
            .clear()
            .toLink();
        navigator.goTo(networkViewLink);
    }

    render() {
        const currentMode = this.props.editMode;

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
