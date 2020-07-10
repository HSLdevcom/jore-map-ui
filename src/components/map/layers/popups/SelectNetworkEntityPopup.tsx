import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import TransitIcon from '~/components/shared/TransitIcon';
import TransitTypeNodeIcon from '~/components/shared/TransitTypeNodeIcon';
import { ILinkMapHighlight } from '~/models/ILink';
import { INodeMapHighlight } from '~/models/INode';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { ConfirmStore } from '~/stores/confirmStore';
import { HighlightEntityStore } from '~/stores/highlightEntityStore';
import { PopupStore } from '~/stores/popupStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import * as s from './selectNetworkEntityPopup.scss';

interface ISelectNetworkEntityPopupData {
    links: ILinkMapHighlight[];
    nodes: INodeMapHighlight[];
}

interface ISelectNetworkEntityPopupProps {
    popupId: number;
    data: ISelectNetworkEntityPopupData;
    toolbarStore?: ToolbarStore;
    confirmStore?: ConfirmStore;
    popupStore?: PopupStore;
    highlightEntityStore?: HighlightEntityStore;
}

@inject('toolbarStore', 'confirmStore', 'popupStore', 'highlightEntityStore')
@observer
class SelectNetworkEntityPopup extends Component<ISelectNetworkEntityPopupProps> {
    private highlightNode = (node: INodeMapHighlight, isHighlighted: boolean) => {
        const nodes = isHighlighted ? [node] : [];
        this.props.highlightEntityStore!.setNodes(nodes);
    };

    private redirectToNode = (nodeId: string, popupId: number) => {
        this.props.popupStore!.closePopup(popupId);
        this.props.highlightEntityStore!.setNodes([]);
        const nodeViewLink = routeBuilder.to(SubSites.node).toTarget(':id', nodeId).toLink();
        navigator.goTo({
            link: nodeViewLink,
            unsavedChangesPromptMessage: `Sinulla on tallentamattomia muutoksia. Haluatko varmasti avata solmun ${nodeId}? Tallentamattomat muutokset kumotaan.`,
        });
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
        navigator.goTo({
            link: linkViewLink,
            unsavedChangesPromptMessage: `Sinulla on tallentamattomia muutoksia. Haluatko varmasti avata linkin? Tallentamattomat muutokset kumotaan.`,
        });
    };

    render() {
        return (
            <div className={s.selectNetworkEntityPopup} data-cy='selectNetworkEntityPopup'>
                {this.props.data.nodes.map((node: INodeMapHighlight, index: number) => {
                    return (
                        <div
                            key={index}
                            className={s.row}
                            onMouseOver={() => this.highlightNode(node, true)}
                            onMouseOut={() => this.highlightNode(node, false)}
                            onClick={() => this.redirectToNode(node.id, this.props.popupId)}
                            data-cy='node'
                        >
                            <div className={s.nodeContainer}>
                                <div className={s.linkNode}>
                                    <TransitTypeNodeIcon
                                        nodeType={node.type}
                                        transitTypes={node.transitTypes}
                                    />
                                </div>
                                <div>{node.id}</div>
                            </div>
                        </div>
                    );
                })}
                {this.props.data.links.map((link: ILinkMapHighlight, index: number) => {
                    return (
                        <div
                            className={s.row}
                            key={index}
                            onMouseOver={() => this.highlightLink(link, true)}
                            onMouseOut={() => this.highlightLink(link, false)}
                            onClick={() => this.redirectToLink(link, this.props.popupId)}
                            data-cy='link'
                        >
                            <TransitIcon transitType={link.transitType} isWithoutBox={false} />
                            <div className={s.linkText}>
                                <div className={s.nodeContainer}>
                                    <div className={s.linkNode}>
                                        <TransitTypeNodeIcon
                                            nodeType={link.startNodeType}
                                            transitTypes={link.startNodeTransitTypes}
                                        />
                                    </div>
                                    {link.startNodeId}
                                </div>
                                <div className={s.divider}>-</div>
                                <div className={s.nodeContainer}>
                                    <div className={s.linkNode}>
                                        <TransitTypeNodeIcon
                                            nodeType={link.endNodeType}
                                            transitTypes={link.endNodeTransitTypes}
                                        />
                                    </div>
                                    {link.endNodeId}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default SelectNetworkEntityPopup;

export { ISelectNetworkEntityPopupData };
