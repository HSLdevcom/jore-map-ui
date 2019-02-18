import React from 'react';
import { FiPrinter, FiExternalLink } from 'react-icons/fi';
import { IoMdUndo, IoMdRedo } from 'react-icons/io';
import { observer } from 'mobx-react';
import toolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import Navigator from '~/routing/navigator';
// TODO: Remove this:
// import GeometryEventStore from '~/stores/geometryEventStore';
import EventManager from '~/util/EventManager';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';

@observer
class ToolbarCommonButtons extends React.Component {
    private print = () => {
    }

    private openInNewTab = () => {
        const path = Navigator.getPathName() + Navigator.getSearch();
        window.open(path, '_blank');
    }

    private undo = () => {
        EventManager.trigger('undo');
    }

    private redo = () => {
        EventManager.trigger('redo');
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
                    <MapControlButton
                        onClick={this.undo}
                        isActive={false}
                        isDisabled={false}
                        label='Kumoa'
                    >
                        <IoMdUndo />
                    </MapControlButton>
                    <MapControlButton
                        onClick={this.redo}
                        isActive={false}
                        isDisabled={false}
                        label='Tee uudestaan'
                    >
                        <IoMdRedo />
                    </MapControlButton>
                </div>
            </div>
        );
    }
}
export default ToolbarCommonButtons;
