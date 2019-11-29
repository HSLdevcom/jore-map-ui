import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { INodeMapHighlight } from '~/models/INode';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { ConfirmStore } from '~/stores/confirmStore';
import { HighlightEntityStore } from '~/stores/highlightEntityStore';
import { NetworkStore } from '~/stores/networkStore';
import { PopupStore } from '~/stores/popupStore';
import * as s from './selectNetworkEntityPopup.scss';

interface ISelectNetworkEntityPopupProps {
    popupId: number;
    nodes: INodeMapHighlight[];
    networkStore?: NetworkStore;
    confirmStore?: ConfirmStore;
    popupStore?: PopupStore;
    highlightEntityStore?: HighlightEntityStore;
    // TODO: linkIds: ...
}

@inject('networkStore', 'confirmStore', 'popupStore', 'highlightEntityStore')
@observer
export default class SelectNetworkEntityPopup extends Component<ISelectNetworkEntityPopupProps> {
    private highlightNode = (node: INodeMapHighlight, isHighlighted: boolean) => {
        const nodes = isHighlighted ? [node] : [];
        this.props.highlightEntityStore!.setNodes(nodes);
    };

    private onClickNode = (nodeId: string, popupId: number) => {
        const redirectToNode = () => {
            this.props.popupStore!.closePopup(popupId);
            this.props.highlightEntityStore!.setNodes([]);
            const nodeViewLink = routeBuilder
                .to(SubSites.node)
                .toTarget(':id', nodeId)
                .toLink();
            navigator.goTo(nodeViewLink);
        };
        if (this.props.networkStore!.shouldShowNodeOpenConfirm) {
            this.props.confirmStore!.openConfirm(
                <div className={s.nodeOpenConfirmContainer}>
                    Sinulla on tallentamattomia muutoksia. Haluatko varmasti avata solmun {nodeId}?
                    Tallentamattomat muutokset kumotaan.
                </div>,
                redirectToNode
            );
        } else {
            redirectToNode();
        }
    };

    render() {
        return (
            <div className={s.selectNetworkEntityPopup}>
                {this.props.nodes.map((node: INodeMapHighlight, index: number) => {
                    return (
                        <div
                            key={index}
                            className={s.row}
                            onMouseOver={() => this.highlightNode(node, true)}
                            onMouseOut={() => this.highlightNode(node, false)}
                            onClick={() => this.onClickNode(node.id, this.props.popupId)}
                        >
                            Solmu {node.id}
                        </div>
                    );
                })}
            </div>
        );
    }
}
