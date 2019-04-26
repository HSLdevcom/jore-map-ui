import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ToolbarStore from '~/stores/toolbarStore';
import RoutePathCopySeqmentStore, { setNodeType } from '~/stores/routePathCopySeqmentStore';
import ToolbarTool from '~/enums/toolbarTool';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import * as s from './toolbarHelp.scss';

@observer
class ToolbarHelp extends Component {

    private renderCopyRoutePathToolToolHelpContent = () => {
        const setSetNodeType = (setNodeType: setNodeType) => () => {
            RoutePathCopySeqmentStore.setSetNodeType(setNodeType);
        };
        const setNodeType = RoutePathCopySeqmentStore.setNodeType;
        return (
            <div className={s.copyRoutePathToolButtons}>
                <Button
                    onClick={setSetNodeType('startNode')}
                    type={setNodeType === 'startNode' ?
                        ButtonType.SQUARE : ButtonType.SQUARE_SECONDARY}
                >
                    Alkusolmu
                </Button>
                <Button
                    onClick={setSetNodeType('endNode')}
                    type={setNodeType === 'endNode' ?
                        ButtonType.SQUARE : ButtonType.SQUARE_SECONDARY}
                >
                    Loppusolmu
                </Button>
            </div>
        );
    }

    render() {
        const selectedTool = ToolbarStore!.selectedTool;
        if (!selectedTool || !selectedTool.toolHelpText) return null;

        return (
            <div className={s.toolbarHelp}>
                <div className={s.toolbarHelpHeader}>
                    {selectedTool.toolHelpHeader}
                </div>
                {selectedTool.toolHelpText}
                { selectedTool.toolType === ToolbarTool.CopyRoutePathSeqmentTool &&
                    this.renderCopyRoutePathToolToolHelpContent()
                }
            </div>
        );
    }
}

export default ToolbarHelp;
