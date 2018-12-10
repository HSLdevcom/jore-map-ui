import React from 'react';
import { FiCopy, FiPlusSquare, FiShare2 } from 'react-icons/fi';
import { observer } from 'mobx-react';
import ToolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';

@observer
export default class ToolbarLineButtons extends React.Component {
    private selectTool = (tool: ToolbarTool) => () => {
        ToolbarStore.selectTool(tool);
    }

    render() {
        return (
            <div className={s.toolbarToolButtonsView}>
                {/* First toolbar row */}
                <div className={s.toolbarButtonRow}>
                    <MapControlButton
                        onClick={this.selectTool(ToolbarTool.Copy)}
                        isActive={ToolbarStore.isSelected(ToolbarTool.Copy)}
                        isDisabled={ToolbarStore.isDisabled(ToolbarTool.Copy)}
                        label='Kopioi reitti toiseen suuntaan'
                    >
                        <FiCopy />
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
                        onClick={this.selectTool(ToolbarTool.AddNode)}
                        isActive={ToolbarStore.isSelected(ToolbarTool.AddNode)}
                        isDisabled={ToolbarStore.isDisabled(ToolbarTool.AddNode)}
                        label='Lisää solmu'
                    >
                        <FiPlusSquare />
                    </MapControlButton>
                </div>
            </div>
        );
    }
}
