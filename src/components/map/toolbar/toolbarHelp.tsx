import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ToolbarTool from '~/enums/toolbarTool';
import ToolbarStore from '~/stores/toolbarStore';
import * as s from './toolbarHelp.scss';

@observer
export default class ToolbarHelp extends Component {
    private renderToolbarHelpContent() {
        const selectedTool = ToolbarStore!.selectedTool;
        if (!selectedTool) return null;

        switch (selectedTool.toolType) {
        case ToolbarTool.AddNewRoutePath:
            return (
                <div>
                    Muodostaaksesi reitin suunnan, valitse kartalta aloitus-solmu.
                    Tämän jälkeen jatka reitin suunnan muodostamista valitsemalla seuraavia solmuja.
                </div>
            );
        case ToolbarTool.EditNetworkNode:
            return (
                <div>
                    Muokataksesi verkon solmua tai siihen
                    liittyviä linkkejä, valitse solmu kartalta.
                </div>
            );
        default:
            return null;
        }
    }

    render() {
        // TODO: this could need refactoring. Tools should know their own toolHelp texts
        const toolbarHelpContent = this.renderToolbarHelpContent();
        if (!toolbarHelpContent) return null;

        return (
            <div className={s.toolbarHelp}>
                {
                    toolbarHelpContent
                }
            </div>
        );
    }
}
