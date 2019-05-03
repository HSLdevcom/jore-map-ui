import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ToolbarStore from '~/stores/toolbarStore';
import RoutePathCopySegmentStore, {
    setNodeType
} from '~/stores/routePathCopySegmentStore';
import ToolbarTool from '~/enums/toolbarTool';
import { Button } from '~/components/controls';
import ButtonType from '~/enums/buttonType';
import * as s from './toolbarHelp.scss';

@observer
class ToolbarHelp extends Component {
    private renderCopyRoutePathToolToolHelpContent = () => {
        const setSetNodeType = (setNodeType: setNodeType) => () => {
            RoutePathCopySegmentStore.setSetNodeType(setNodeType);
        };
        const setNodeType = RoutePathCopySegmentStore.setNodeType;

        return (
            <div className={s.copyRoutePathToolButtons}>
                <Button
                    onClick={setSetNodeType('startNode')}
                    type={ButtonType.SQUARE}
                    className={
                        setNodeType === 'startNode'
                            ? s.startButtonSelected
                            : s.startButton
                    }
                >
                    Alkusolmu
                </Button>
                <Button
                    onClick={setSetNodeType('endNode')}
                    type={ButtonType.SQUARE}
                    className={
                        setNodeType === 'endNode'
                            ? s.endButtonSelected
                            : s.endButton
                    }
                >
                    Loppusolmu
                </Button>
            </div>
        );
    };

    render() {
        const selectedTool = ToolbarStore!.selectedTool;
        if (!selectedTool || !selectedTool.toolHelpText) return null;

        return (
            <div className={s.toolbarHelp}>
                <div className={s.toolbarHelpHeader}>
                    {selectedTool.toolHelpHeader}
                </div>
                {selectedTool.toolHelpText}
                {selectedTool.toolType ===
                    ToolbarTool.CopyRoutePathSegmentTool &&
                    this.renderCopyRoutePathToolToolHelpContent()}
            </div>
        );
    }
}

export default ToolbarHelp;
