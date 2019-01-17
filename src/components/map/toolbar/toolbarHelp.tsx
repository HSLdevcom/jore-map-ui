import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ToolbarTool from '~/enums/toolbarTool';
import ToolbarStore from '~/stores/toolbarStore';
import * as s from './toolbarHelp.scss';

@observer
class ToolbarHelp extends Component {
    render() {
        const selectedTool = ToolbarStore!.selectedTool;
        if (!selectedTool) return null;

        // TODO: this could need refactoring. Tools should know their own toolHelp texts
        switch (selectedTool.toolType) {
        case ToolbarTool.AddNewRoutePathLink:
            return (
                <div className={s.toolbarHelp}>
                    Muodostaaksesi reitin suunnan, valitse kartalta aloitus-solmu.
                    Tämän jälkeen jatka reitin suunnan muodostamista valitsemalla seuraavia solmuja.
                </div>
            );
        case ToolbarTool.EditNetworkNode:
            return (
                <div className={s.toolbarHelp}>
                    Muokataksesi verkon solmua tai siihen
                    liittyviä linkkejä, valitse solmu kartalta.
                </div>
            );
        case ToolbarTool.RemoveRoutePathLink:
            return (
                <div className={s.toolbarHelp}>
                    Valitse kartalta ne reitinlinkit joka haluat poistaa.
                </div>
            );
        default:
            return null;
        }
    }
}

export default ToolbarHelp;
