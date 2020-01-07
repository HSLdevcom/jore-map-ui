import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import SidebarHeader from '~/components/sidebar/SidebarHeader';
import NodeForm from '~/components/sidebar/nodeView/NodeForm';
import StopForm from '~/components/sidebar/nodeView/StopForm';
import { INode } from '~/models';
import { ConfirmStore } from '~/stores/confirmStore';
import { NetworkStore } from '~/stores/networkStore';
import { PopupStore } from '~/stores/popupStore';
import * as s from './nodePopup.scss';

interface INodePopupData {
    node: INode;
}

interface INodePopupProps {
    popupId: number;
    data: INodePopupData;
    networkStore?: NetworkStore;
    confirmStore?: ConfirmStore;
    popupStore?: PopupStore;
}

@inject('popupStore')
@observer
class NodePopup extends Component<INodePopupProps> {
    render() {
        const { data, popupId } = this.props;
        const node = data.node;
        return (
            <div className={s.nodePopup}>
                <div className={s.sidebarHeaderWrapper}>
                    <SidebarHeader
                        isEditButtonVisible={false}
                        isBackButtonVisible={true}
                        onCloseButtonClick={() => {
                            this.props.popupStore!.closePopup(popupId);
                        }}
                    >
                        Solmu {node.id}
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
                            stopInvalidPropertiesMap={{}}
                            nodeInvalidPropertiesMap={{}}
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
