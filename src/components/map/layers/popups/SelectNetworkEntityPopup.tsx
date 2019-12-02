import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { ILinkMapHighlight } from '~/models/ILink';
import { INodeMapHighlight } from '~/models/INode';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { ConfirmStore } from '~/stores/confirmStore';
import { HighlightEntityStore } from '~/stores/highlightEntityStore';
import { NetworkStore } from '~/stores/networkStore';
import { PopupStore } from '~/stores/popupStore';
import * as s from './selectNetworkEntityPopup.scss';

interface ISelectNetworkEntityPopupData {
    links: ILinkMapHighlight[];
    nodes: INodeMapHighlight[];
}

interface ISelectNetworkEntityPopupProps {
    popupId: number;
    data: ISelectNetworkEntityPopupData;
    networkStore?: NetworkStore;
    confirmStore?: ConfirmStore;
    popupStore?: PopupStore;
    highlightEntityStore?: HighlightEntityStore;
}

@inject('networkStore', 'confirmStore', 'popupStore', 'highlightEntityStore')
@observer
class SelectNetworkEntityPopup extends Component<ISelectNetworkEntityPopupProps> {
    private highlightNode = (node: INodeMapHighlight, isHighlighted: boolean) => {
        const nodes = isHighlighted ? [node] : [];
        this.props.highlightEntityStore!.setNodes(nodes);
    };

    private promptRedirectToNode = (nodeId: string, popupId: number) => {
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

    private highlightLink = (link: ILinkMapHighlight, isHighlighted: boolean) => {
        const links = isHighlighted ? [link] : [];
        this.props.highlightEntityStore!.setLinks(links);
    };

    private redirectToLink = (link: ILinkMapHighlight, popupId: number) => {
        this.props.popupStore!.closePopup(popupId);
        this.props.highlightEntityStore!.setLinks([]);
        const linkViewLink = routeBuilder
            .to(SubSites.link)
            .toTarget(':id', [link.startNodeId, link.endNodeId, link.transitType].join(','))
            .toLink();
        navigator.goTo(linkViewLink);
    };

    render() {
        return (
            <div className={s.selectNetworkEntityPopup}>
                {this.props.data.nodes.map((node: INodeMapHighlight, index: number) => {
                    return (
                        <div
                            key={index}
                            className={s.row}
                            onMouseOver={() => this.highlightNode(node, true)}
                            onMouseOut={() => this.highlightNode(node, false)}
                            onClick={() => this.promptRedirectToNode(node.id, this.props.popupId)}
                        >
                            Solmu {node.id}
                        </div>
                    );
                })}
                {this.props.data.links.map((link: ILinkMapHighlight, index: number) => {
                    return (
                        <div
                            key={index}
                            className={s.row}
                            onMouseOver={() => this.highlightLink(link, true)}
                            onMouseOut={() => this.highlightLink(link, false)}
                            onClick={() => this.redirectToLink(link, this.props.popupId)}
                        >
                            Linkki
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default SelectNetworkEntityPopup;

export { ISelectNetworkEntityPopupData };
