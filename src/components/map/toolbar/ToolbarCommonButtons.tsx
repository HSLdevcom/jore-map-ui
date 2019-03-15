import React from 'react';
import { FiPrinter, FiExternalLink, FiPlus } from 'react-icons/fi';
import { IoMdUndo, IoMdRedo } from 'react-icons/io';
import { observer } from 'mobx-react';
import ToolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import Navigator from '~/routing/navigator';
import EventManager from '~/util/EventManager';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';

interface IToolbarCommonButtonsProps {
    hasWriteAccess: boolean;
}

@observer
class ToolbarCommonButtons extends React.Component<IToolbarCommonButtonsProps> {
    private print = () => {
    }

    private openInNewTab = () => {
        const path = Navigator.getPathName() + Navigator.getSearch();
        window.open(path, '_blank');
    }

    private selectTool = (tool: ToolbarTool) => () => {
        ToolbarStore.selectTool(tool);
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
                        isDisabled={ToolbarStore.isDisabled(ToolbarTool.Print)}
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
                    { this.props.hasWriteAccess &&
                        <>
                            <MapControlButton
                                onClick={this.selectTool(ToolbarTool.AddNetworkNode)}
                                isActive={ToolbarStore.isSelected(ToolbarTool.AddNetworkNode)}
                                isDisabled={false}
                                label='Lisää solmu'
                            >
                                <FiPlus />
                            </MapControlButton>
                            <MapControlButton
                                onClick={this.undo}
                                isActive={false}
                                isDisabled={false}
                                label='Kumoa (ctrl+z)'
                            >
                                <IoMdUndo />
                            </MapControlButton>
                            <MapControlButton
                                onClick={this.redo}
                                isActive={false}
                                isDisabled={false}
                                label='Tee uudestaan (ctrl+y)'
                            >
                                <IoMdRedo />
                            </MapControlButton>
                        </>
                    }
                </div>
            </div>
        );
    }
}
export default ToolbarCommonButtons;
