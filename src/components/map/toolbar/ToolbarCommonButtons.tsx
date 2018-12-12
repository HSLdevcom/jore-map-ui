import React from 'react';
import { FiPrinter, FiExternalLink } from 'react-icons/fi';
import { IoMdUndo } from 'react-icons/io';
import { observer } from 'mobx-react';
import toolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import Navigator from '~/routing/navigator';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';
import UndoTool from '../tools/UndoTool';

@observer
export default class ToolbarCommonButtons extends React.Component {
    private print = () => {
    }

    private openInNewTab = () => {
        const path = Navigator.getPathName() + Navigator.getSearch();
        window.open(path, '_blank');
    }

    render() {
        return (
            <div className={s.toolbarToolButtonsView}>
                <div className={s.toolbarButtonRow}>
                    <MapControlButton
                        onClick={this.print}
                        isActive={false}
                        isDisabled={toolbarStore.isDisabled(ToolbarTool.Print)}
                        label='Tulosta kartta'
                    >
                        <FiPrinter />
                    </MapControlButton>
                    <MapControlButton
                        onClick={this.openInNewTab}
                        isActive={false}
                        isDisabled={false}
                        label='Avaa uusi ikkuna'
                    >
                        <FiExternalLink />
                    </MapControlButton>
                </div>
                <div className={s.toolbarButtonRow}>
                    <MapControlButton
                        onClick={UndoTool.undo}
                        isActive={false}
                        isDisabled={false}
                        label='Undo'
                    >
                        <IoMdUndo />
                    </MapControlButton>
                </div>
            </div>
        );
    }
}
