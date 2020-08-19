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
                    onClick={this.selectTool(ToolbarToolType.ExtendRoutePath)}
                    isActive={ToolbarStore.isSelected(ToolbarToolType.ExtendRoutePath)}
                    isDisabled={ToolbarStore.isDisabled(ToolbarToolType.ExtendRoutePath)}
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
                    onClick={this.selectTool(ToolbarToolType.CopyRoutePathSegment)}
                    isActive={ToolbarStore.isSelected(ToolbarToolType.CopyRoutePathSegment)}
                    isDisabled={ToolbarStore.isDisabled(ToolbarToolType.CopyRoutePathSegment)}
                    label='Kopioi reitinsuunnan segmentti toiselta reitinsuunnalta'
                >
                    <FiCopy />
                </MapControlButton>
            </>
        );
    }
}

export default ToolbarLineButtons;
