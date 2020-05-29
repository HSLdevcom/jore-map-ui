import { observer } from 'mobx-react';
import React from 'react';
import { FiCopy, FiDelete } from 'react-icons/fi';
import { IoMdGitCommit } from 'react-icons/io';
import ToolbarToolType from '~/enums/toolbarToolType';
import ToolbarStore from '~/stores/toolbarStore';
import MapControlButton from '../mapControls/MapControlButton';

@observer
class ToolbarLineButtons extends React.Component {
    private selectTool = (tool: ToolbarToolType) => () => {
        ToolbarStore.selectTool(tool);
    };

    render() {
        return (
            <>
                <MapControlButton
                    onClick={this.selectTool(ToolbarToolType.AddNewRoutePathLink)}
                    isActive={ToolbarStore.isSelected(ToolbarToolType.AddNewRoutePathLink)}
                    isDisabled={ToolbarStore.isDisabled(ToolbarToolType.AddNewRoutePathLink)}
                    label='Laajenna reitinsuuntaa'
                >
                    <IoMdGitCommit />
                </MapControlButton>
                <MapControlButton
                    onClick={this.selectTool(ToolbarToolType.RemoveRoutePathLink)}
                    isActive={ToolbarStore.isSelected(ToolbarToolType.RemoveRoutePathLink)}
                    isDisabled={ToolbarStore.isDisabled(ToolbarToolType.RemoveRoutePathLink)}
                    label='Poista reitinsuunnan linkki'
                >
                    <FiDelete />
                </MapControlButton>
                <MapControlButton
                    onClick={this.selectTool(ToolbarToolType.CopyRoutePathSegmentTool)}
                    isActive={ToolbarStore.isSelected(ToolbarToolType.CopyRoutePathSegmentTool)}
                    isDisabled={ToolbarStore.isDisabled(ToolbarToolType.CopyRoutePathSegmentTool)}
                    label='Kopioi reitinsuunnan segmentti toiselta reitinsuunnalta'
                >
                    <FiCopy />
                </MapControlButton>
            </>
        );
    }
}

export default ToolbarLineButtons;
