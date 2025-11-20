import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, RefObject } from 'react';
import TransitIcon from '~/components/shared/TransitIcon';
import TransitTypeNodeIcon from '~/components/shared/TransitTypeNodeIcon';
import { ILinkMapHighlight } from '~/models/ILink';
import { INodeMapHighlight } from '~/models/INode';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import NodeService from '~/services/nodeService';
import { ConfirmStore } from '~/stores/confirmStore';
import { HighlightEntityStore } from '~/stores/highlightEntityStore';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { INodePopupData } from './NodePopup';
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

const SelectNetworkEntityPopup = inject(
    'toolbarStore',
    'confirmStore',
    'popupStore',
    'highlightEntityStore'
)(
    observer((props: ISelectNetworkEntityPopupProps) => {
        const highlightNode = (node: INodeMapHighlight, isHighlighted: boolean) => {
            const nodes = isHighlighted ? [node] : [];
            props.highlightEntityStore!.setNodes(nodes);
        };

        const redirectToNode = (nodeId: string, popupId: number) => {
            props.popupStore!.closePopup(popupId);
            props.highlightEntityStore!.setNodes([]);
            const nodeViewLink = routeBuilder.to(SubSites.node).toTarget(':id', nodeId).toLink();
            navigator.goTo({
                link: nodeViewLink,
                unsavedChangesPromptMessage: `Sinulla on tallentamattomia muutoksia. Haluatko varmasti avata solmun ${nodeId}? Tallentamattomat muutokset kumotaan.`,
            });
        };

        const highlightLink = (link: ILinkMapHighlight, isHighlighted: boolean) => {
            const links = isHighlighted ? [link] : [];
            props.highlightEntityStore!.setLinks(links);
        };

        const redirectToLink = (link: ILinkMapHighlight, popupId: number) => {
            props.popupStore!.closePopup(popupId);
            props.highlightEntityStore!.setLinks([]);
            const linkViewLink = routeBuilder
                .to(SubSites.link)
                .toTarget(':id', [link.startNodeId, link.endNodeId, link.transitType].join(','))
                .toLink();
            navigator.goTo({
                link: linkViewLink,
                unsavedChangesPromptMessage: `Sinulla on tallentamattomia muutoksia. Haluatko varmasti avata linkin? Tallentamattomat muutokset kumotaan.`,
            });
        };

        return (
            <div className={s.selectNetworkEntityPopup} data-cy='selectNetworkEntityPopup'>
                {props.data.nodes.map((node: INodeMapHighlight, index: number) => {
                    const containerRef = useRef<HTMLDivElement>(null);
                    return (
                        <div
                            key={index}
                            className={s.row}
                            onMouseOver={() => highlightNode(node, true)}
                            onMouseOut={() => highlightNode(node, false)}
                            onClick={() => redirectToNode(node.id, props.popupId)}
                            data-cy='node'
                            ref={containerRef}
                        >
                            <ShowNodePopupContextMenu
                                key={index}
                                parentRef={containerRef}
                                nodeId={node.id}
                                popupId={props.popupId}
                                popupStore={props.popupStore}
                            />
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
                {props.data.links.map((link: ILinkMapHighlight, index: number) => {
                    return (
                        <div
                            className={s.row}
                            key={index}
                            onMouseOver={() => highlightLink(link, true)}
                            onMouseOut={() => highlightLink(link, false)}
                            onClick={() => redirectToLink(link, props.popupId)}
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
    })
);

const ShowNodePopupContextMenu = ({
    parentRef,
    nodeId,
    popupId,
    popupStore,
}: {
    parentRef: RefObject<HTMLDivElement>;
    nodeId: string;
    popupId: number;
    popupStore?: PopupStore;
}) => {
    useEffect(() => {
        const parent = parentRef.current;
        if (!parent) {
            return;
        }

        const showNodePopup = async (event: any) => {
            event.preventDefault();
            const node = await NodeService.fetchNode(nodeId);
            popupStore!.closePopup(popupId);
            const popupData: INodePopupData = {
                node: node!,
            };
            const nodePopup: IPopupProps = {
                type: 'nodePopup',
                data: popupData,
                coordinates: node!.coordinates,
                isCloseButtonVisible: false,
            };

            popupStore!.showPopup(nodePopup);
        };

        parent.addEventListener('contextmenu', showNodePopup);

        return () => {
            parent.removeEventListener('contextmenu', showNodePopup);
        };
    });

    return null;
};

export default SelectNetworkEntityPopup;

export { ISelectNetworkEntityPopupData };
