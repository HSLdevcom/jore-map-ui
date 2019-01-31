import React from 'react';
import { FiPrinter, FiExternalLink } from 'react-icons/fi';
import { IoMdUndo } from 'react-icons/io';
import { observer } from 'mobx-react';
import toolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import Navigator from '~/routing/navigator';
import GeometryEventStore from '~/stores/geometryEventStore';
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
        GeometryEventStore.undo();
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
                        isDisabled={!GeometryEventStore.hasEvents}
                        label='Undo'
                    >
                        <IoMdUndo />
                    </MapControlButton>
                </div>
            </div>
        );
    }
}
export default ToolbarCommonButtons;
