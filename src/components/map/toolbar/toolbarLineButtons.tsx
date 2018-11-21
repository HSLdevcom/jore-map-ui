import React from 'react';
import { FiCopy, FiPlusSquare, FiShare2 } from 'react-icons/fi';
import { observer } from 'mobx-react';
import toolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';

@observer
export default class ToolbarLineButtons extends React.Component {
    private toggleTool = (tool: ToolbarTool) => () => {
        toolbarStore.toggleTool(tool); // TODO: fix importing toolbarStore
    }

    render() {
        return (
            <div className={s.toolbarToolButtonsView}>
                {/* First toolbar row */}
                <div className={s.toolbarButtonRow}>
                    <MapControlButton
                        onClick={this.toggleTool(ToolbarTool.Copy)}
                        isActive={toolbarStore.isActive(ToolbarTool.Copy)}
                        isDisabled={toolbarStore.isDisabled(ToolbarTool.Copy)}
                        label='Kopioi reitti toiseen suuntaan'
                    >
                        <FiCopy />
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
