import React from 'react';
import { FiDelete } from 'react-icons/fi';
import { IoMdGitCommit } from 'react-icons/io';
import { observer } from 'mobx-react';
import ToolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';

@observer
class ToolbarLineButtons extends React.Component {
    private selectTool = (tool: ToolbarTool) => () => {
        ToolbarStore.selectTool(tool);
    }

    render() {
        return (
            <div className={s.toolbarToolButtonsView}>
                {/* First toolbar row */}
                <div className={s.toolbarButtonRow}>
                {/*
                    <MapControlButton
                        onClick={this.selectTool(ToolbarTool.Copy)}
                        isActive={ToolbarStore.isSelected(ToolbarTool.Copy)}
                        isDisabled={ToolbarStore.isDisabled(ToolbarTool.Copy)}
                        label='Kopioi reitti toiseen suuntaan'
                    >
                        <FiCopy />
                    </MapControlButton>
                    */}
                    <MapControlButton
                        onClick={this.selectTool(ToolbarTool.AddNewRoutePathLink)}
                        isActive={ToolbarStore.isSelected(ToolbarTool.AddNewRoutePathLink)}
                        isDisabled={ToolbarStore.isDisabled(ToolbarTool.AddNewRoutePathLink)}
                        label='Laajenna reitinsuuntaa'
                    >
                        <IoMdGitCommit />
                    </MapControlButton>
                    <MapControlButton
                        onClick={this.selectTool(ToolbarTool.RemoveRoutePathLink)}
                        isActive={ToolbarStore.isSelected(ToolbarTool.RemoveRoutePathLink)}
                        isDisabled={ToolbarStore.isDisabled(ToolbarTool.RemoveRoutePathLink)}
                        label='Poista linkki'
                    >
                        <FiDelete/>
                    </MapControlButton>
                </div>
            </div>
        );
    }
}

export default ToolbarLineButtons;
