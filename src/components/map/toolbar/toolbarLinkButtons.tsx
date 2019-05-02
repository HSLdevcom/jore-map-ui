import React from 'react';
import { FiScissors } from 'react-icons/fi';
import { observer } from 'mobx-react';
import ToolbarStore from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import MapControlButton from '../mapControls/MapControlButton';
import * as s from './toolbarToolButtons.scss';

@observer
class ToolbarLinkButtons extends React.Component {
    private selectTool = (tool: ToolbarTool) => () => {
        ToolbarStore.selectTool(tool);
    }

    render() {
        return (
            <div className={s.toolbarToolButtonsView}>
                <div className={s.toolbarButtonRow}>
                    <MapControlButton
                        onClick={this.selectTool(ToolbarTool.SplitLink)}
                        isActive={ToolbarStore.isSelected(ToolbarTool.SplitLink)}
                        isDisabled={ToolbarStore.isDisabled(ToolbarTool.SplitLink)}
                        label='Jaa linkki solmulla'
                    >
                        <FiScissors />
                    </MapControlButton>
                </div>
            </div>
        );
    }
}

export default ToolbarLinkButtons;
