import { observer } from 'mobx-react';
import React from 'react';
import { FiScissors } from 'react-icons/fi';
import ToolbarTool from '~/enums/toolbarTool';
import ToolbarStore from '~/stores/toolbarStore';
import MapControlButton from '../mapControls/MapControlButton';

@observer
class ToolbarLinkButtons extends React.Component {
    private selectTool = (tool: ToolbarTool) => () => {
        ToolbarStore.selectTool(tool);
    };

    render() {
        // TODO: when splitLink tool works, make isDisabled as:
        // isDisabled = { ToolbarStore.isDisabled(ToolbarTool.SplitLink) }
        return (
            <>
                <MapControlButton
                    onClick={this.selectTool(ToolbarTool.SplitLink)}
                    isActive={ToolbarStore.isSelected(ToolbarTool.SplitLink)}
                    isDisabled={true}
                    label='Jaa linkki solmulla'
                >
                    <FiScissors />
                </MapControlButton>
            </>
        );
    }
}

export default ToolbarLinkButtons;
