import React from 'react';
import { FiEdit, FiPlusSquare, FiShare2 } from 'react-icons/fi';
import { observer } from 'mobx-react';
import ToolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';

@observer
class ToolbarNetworkButtons extends React.Component {
    private selectTool = (tool: ToolbarTool) => () => {
        ToolbarStore.selectTool(tool);
    }

    render() {
        return (
            <div className={s.toolbarToolButtonsView}>
                {/* First toolbar row */}
                <div className={s.toolbarButtonRow}>
                    <MapControlButton
                        onClick={this.selectTool(ToolbarTool.EditNetworkNode)}
                        isActive={ToolbarStore.isSelected(ToolbarTool.EditNetworkNode)}
                        isDisabled={ToolbarStore.isDisabled(ToolbarTool.EditNetworkNode)}
                        label='Muokkaa verkon geometriaa'
                    >
                        <FiEdit />
                    </MapControlButton>
                    <MapControlButton
                        onClick={this.selectTool(ToolbarTool.DivideLink)}
                        isActive={ToolbarStore.isSelected(ToolbarTool.DivideLink)}
                        isDisabled={ToolbarStore.isDisabled(ToolbarTool.DivideLink)}
                        label='Jaa linkki'
                    >
                        <FiShare2/>
                    </MapControlButton>
                </div>
                {/* Second toolbar row */}
                <div className={s.toolbarButtonRow}>
                    <MapControlButton
                        onClick={this.selectTool(ToolbarTool.AddNetworkNode)}
                        isActive={ToolbarStore.isSelected(ToolbarTool.AddNetworkNode)}
                        isDisabled={ToolbarStore.isDisabled(ToolbarTool.AddNetworkNode)}
                        label='Lisää solmu'
                    >
                        <FiPlusSquare />
                    </MapControlButton>
                </div>
            </div>
        );
    }
}

export default ToolbarNetworkButtons;
