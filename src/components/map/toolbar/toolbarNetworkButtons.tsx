import React from 'react';
import { FiEdit, FiPlusSquare, FiShare2 } from 'react-icons/fi';
import { observer } from 'mobx-react';
import toolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';

@observer
export default class ToolbarNetworkButtons extends React.Component {
    private toggleTool = (tool: ToolbarTool) => () => {
        toolbarStore.toggleTool(tool); // TODO: fix importing toolbarStore
    }

    render() {
        return (
            <div className={s.toolbarToolButtonsView}>
                {/* First toolbar row */}
                <div className={s.toolbarButtonRow}>
                    <MapControlButton
                        onClick={this.toggleTool(ToolbarTool.Edit)}
                        isActive={toolbarStore.isActive(ToolbarTool.Edit)}
                        isDisabled={toolbarStore.isDisabled(ToolbarTool.Edit)}
                        label='Muokkaa verkon geometriaa'
                    >
                        <FiEdit />
                    </MapControlButton>
                    <MapControlButton
                        onClick={this.toggleTool(ToolbarTool.DivideLink)}
                        isActive={toolbarStore.isActive(ToolbarTool.DivideLink)}
                        isDisabled={toolbarStore.isDisabled(ToolbarTool.DivideLink)}
                        label='Jaa linkki'
                    >
                        <FiShare2/>
                    </MapControlButton>
                </div>
                {/* Second toolbar row */}
                <div className={s.toolbarButtonRow}>
                    <MapControlButton
                        onClick={this.toggleTool(ToolbarTool.AddNode)}
                        isActive={toolbarStore.isActive(ToolbarTool.AddNode)}
                        isDisabled={toolbarStore.isDisabled(ToolbarTool.AddNode)}
                        label='Lisää solmu'
                    >
                        <FiPlusSquare />
                    </MapControlButton>
                </div>
            </div>
        );
    }
}
