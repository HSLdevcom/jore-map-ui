import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import SidebarHeader from '~/components/sidebar/SidebarHeader';
import NodeForm from '~/components/sidebar/nodeView/NodeForm';
import StopForm from '~/components/sidebar/nodeView/StopForm';
import { INode } from '~/models';
import { PopupStore } from '~/stores/popupStore';
import NodeUtils from '~/utils/NodeUtils';
import * as s from './nodePopup.scss';

interface INodePopupData {
    node: INode;
}

interface INodePopupProps {
    popupId: number;
    data: INodePopupData;
    popupStore?: PopupStore;
}

@inject('popupStore')
@observer
class NodePopup extends Component<INodePopupProps> {
    render() {
        const { data, popupId } = this.props;
        const node = data.node;
        return (
            <div className={s.nodePopup} data-cy='nodePopup'>
                <div className={s.sidebarHeaderWrapper}>
                    <SidebarHeader
                        isCloseButtonVisible={true}
                        onCloseButtonClick={() => {
                            this.props.popupStore!.closePopup(popupId);
                        }}
                    >
                        {`${NodeUtils.getNodeTypeName(node.type)} ${node.id}`}
                        {node.shortIdString && (
                            <div className={s.headerShortId}>
                                {node.shortIdLetter}
                                {node.shortIdString}
                            </div>
                        )}
                    </SidebarHeader>
                </div>
                <div className={s.nodeFormWrapper}>
                    <NodeForm
                        node={node}
                        isNewNode={false}
                        isEditingDisabled={true}
                        invalidPropertiesMap={{}}
                    />
                    {node.stop && (
                        <StopForm
                            node={node}
                            isNewStop={false}
                            isEditingDisabled={true}
                            stopAreas={[]}
                            stopSections={[]}
                            hastusAreas={[]}
                            stopInvalidPropertiesMap={{}}
                            updateStopProperty={() => () => void 0}
                            isReadOnly={true}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default NodePopup;

export { INodePopupData };
