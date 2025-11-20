import { inject, observer } from 'mobx-react';
import React, { useRef } from 'react';
import TransitTypeNodeIcon from '~/components/shared/TransitTypeNodeIcon';
import EventListener, { IEditRoutePathNeighborLinkClickParams } from '~/helpers/EventListener';
import { INeighborLink, INode } from '~/models';
import { PopupStore } from '~/stores/popupStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import IRoutePathLink from '../../../../models/IRoutePathLink';
import * as s from './selectNetworkEntityPopup.scss';

interface ISelectRoutePathNeighborProps {
    node: INode;
    neighborLink: INeighborLink;
}

interface ISelectRoutePathNeighborPopupData {
    neighborNodes: ISelectRoutePathNeighborProps[];
}

interface ISelectNetworkEntityPopupProps {
    popupId: number;
    data: any;
    popupStore?: PopupStore;
    routePathLayerStore?: RoutePathLayerStore;
}

const SelectRoutePathNeighborPopup = inject(
    'popupStore',
    'routePathLayerStore'
)(
    observer((props: ISelectNetworkEntityPopupProps) => {
        const highlightLink = (link: IRoutePathLink, isHighlighted: boolean) => {
            const highlightId = isHighlighted ? link.id : '';
            props.routePathLayerStore!.setHighlightedNeighborLinkId(highlightId);
        };

        const selectRoutePathNeighbor = (neighborLink: INeighborLink, popupId: number) => {
            props.popupStore!.closePopup(popupId);
            const clickParams: IEditRoutePathNeighborLinkClickParams = {
                neighborLink,
            };
            EventListener.trigger('editRoutePathNeighborLinkClick', clickParams);
        };

        return (
            <div className={s.selectNetworkEntityPopup} data-cy='selectNetworkEntityPopup'>
                {props.data.neighborNodes.map(
                    (selectNeighborProps: ISelectRoutePathNeighborProps, index: number) => {
                        const containerRef = useRef<HTMLDivElement>(null);
                        return (
                            <div
                                key={index}
                                className={s.row}
                                onMouseOver={() =>
                                    highlightLink(
                                        selectNeighborProps.neighborLink.routePathLink,
                                        true
                                    )
                                }
                                onMouseOut={() =>
                                    highlightLink(
                                        selectNeighborProps.neighborLink.routePathLink,
                                        false
                                    )
                                }
                                onClick={() =>
                                    selectRoutePathNeighbor(
                                        selectNeighborProps.neighborLink,
                                        props.popupId
                                    )
                                }
                                data-cy='node'
                                ref={containerRef}
                            >
                                <div className={s.nodeContainer}>
                                    <div className={s.linkNode}>
                                        <TransitTypeNodeIcon
                                            nodeType={selectNeighborProps.node.type}
                                            transitTypes={selectNeighborProps.node.transitTypes}
                                        />
                                    </div>
                                    <div>{selectNeighborProps.node.id}</div>
                                    <div>
                                        {` (${selectNeighborProps.neighborLink.nodeUsageRoutePaths.length})`}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        );
    })
);

export default SelectRoutePathNeighborPopup;

export { ISelectRoutePathNeighborPopupData };
