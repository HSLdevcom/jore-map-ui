import { observer } from 'mobx-react';
import React from 'react';
import { FiCopy, FiDelete } from 'react-icons/fi';
import { IoMdGitCommit } from 'react-icons/io';
import ToolbarTool from '~/enums/toolbarTool';
import ToolbarStore from '~/stores/toolbarStore';
import MapControlButton from '../mapControls/MapControlButton';

@observer
class ToolbarLineButtons extends React.Component {
    private selectTool = (tool: ToolbarTool) => () => {
        ToolbarStore.selectTool(tool);
    };

    render() {
        return (
            <>
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
                    label='Poista reitinsuunnan linkki'
                >
                    <FiDelete />
                </MapControlButton>
                <MapControlButton
                    onClick={this.selectTool(ToolbarTool.CopyRoutePathSegmentTool)}
                    isActive={ToolbarStore.isSelected(ToolbarTool.CopyRoutePathSegmentTool)}
                    isDisabled={ToolbarStore.isDisabled(ToolbarTool.CopyRoutePathSegmentTool)}
                    label='Kopioi reitinsuunnan segmentti toiselta reitinsuunnalta'
                >
                    <FiCopy />
                </MapControlButton>
            </>
        );
    }
}

export default ToolbarLineButtons;
