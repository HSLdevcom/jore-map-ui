import { LatLngBounds } from 'leaflet';
import { union } from 'lodash';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import ClusterNodeMarker from '~/components/map/layers/markers/ClusterNodeMarker';
import { ISelectRoutePathNeighborPopupData } from '~/components/map/layers/popups/SelectRoutePathNeighborPopup';
import NodeSize from '~/enums/nodeSize';
import NodeType from '~/enums/nodeType';
import NodeFactory from '~/factories/nodeFactory';
import EventListener, { IEditRoutePathNeighborLinkClickParams } from '~/helpers/EventListener';
import { IRoutePath } from '~/models';
import INeighborLink from '~/models/INeighborLink';
import INode from '~/models/INode';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import { NeighborToAddType, RoutePathLayerStore } from '~/stores/routePathLayerStore';
import NodeUtils from '~/utils/NodeUtils';
import NodeMarker from '../markers/NodeMarker';
import { INodeUsagePopupData } from '../popups/NodeUsagePopup';
import * as s from './routePathNeighborLinkLayer.scss';

interface IRoutePathLayerProps {
    routePathLayerStore?: RoutePathLayerStore;
    popupStore?: PopupStore;
    mapStore?: MapStore;
}

interface IRoutePathLayerState {
    polylineRefs: PolylineRefs;
}

interface PolylineRefs {
    [key: string]: any;
}

@inject('routePathLayerStore', 'popupStore', 'mapStore')
@observer
class RoutePathNeighborLinkLayer extends Component<IRoutePathLayerProps, IRoutePathLayerState> {
    private linkListener: IReactionDisposer;
    constructor(props: IRoutePathLayerProps) {
        super(props);
        this.state = {
            polylineRefs: {},
        };
        this.linkListener = reaction(
            () => this.props.routePathLayerStore!.neighborLinks,
            () => this.initializePolylineRefs()
        );
    }

    public componentWillUnmount() {
        this.linkListener();
    }

    private initializePolylineRefs = () => {
        const polylineRefs = {};
        this.props.routePathLayerStore!.neighborLinks.forEach((neighborLink) => {
            polylineRefs[neighborLink.routePathLink.id] = React.createRef<any>();
        });
        this.setState({
            polylineRefs,
        });
    };

    private showNodePopup = (node: INode, routePaths: IRoutePath[]) => {
        const popupData: INodeUsagePopupData = {
            routePaths,
        };
        const nodePopup: IPopupProps = {
            type: 'nodeUsagePopup',
            data: popupData,
            coordinates: node!.coordinates,
            isCloseButtonVisible: false,
            isAutoCloseOn: true,
        };
        if (routePaths.length > 0) {
            this.props.popupStore!.showPopup(nodePopup);
        }
    };

    private renderNeighborNode = (node: INode, neighborLink: INeighborLink, key: number) => {
        const onNeighborLinkClick = () => {
            const clickParams: IEditRoutePathNeighborLinkClickParams = {
                neighborLink,
            };
            EventListener.trigger('editRoutePathNeighborLinkClick', clickParams);
        };

        const visibleNodeLabels = union(this.props.mapStore!.visibleNodeLabels, [
            NodeLabel.longNodeId,
        ]);

        const isNeighborLinkHighlighted =
            neighborLink.routePathLink.id ===
            this.props.routePathLayerStore!.highlightedNeighborLinkId;

        return (
            <NodeMarker
                key={`${key}-${node.id}`}
                coordinates={node.coordinates}
                nodeType={node.type}
                transitTypes={[]}
                nodeLocationType={'coordinates'}
                nodeId={node.id}
                shortId={NodeUtils.getShortId(node)}
                hastusId={node.stop ? node.stop.hastusId : undefined}
                classNames={[this.getNodeMarkerClassName(node)]}
                visibleNodeLabels={visibleNodeLabels}
                onClick={onNeighborLinkClick}
                onContextMenu={() => this.showNodePopup(node, neighborLink.nodeUsageRoutePaths)}
                onMouseOver={() =>
                    this.setRoutePathLinkHighlight({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: true,
                    })
                }
                onMouseOut={() =>
                    this.setRoutePathLinkHighlight({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: false,
                    })
                }
                hasHighZIndex={true}
                size={NodeSize.LARGE}
            >
                <div
                    className={s.usageCount}
                    style={{
                        color: getNeighborLinkColor(neighborLink, isNeighborLinkHighlighted),
                    }}
                >
                    {neighborLink.nodeUsageRoutePaths.length > 9
                        ? '9+'
                        : neighborLink.nodeUsageRoutePaths.length}
                </div>
            </NodeMarker>
        );
    };

    private getNodeMarkerClassName = (node: INode) => {
        switch (node.type) {
            case NodeType.STOP:
                return s.nodeMarkerStop;
            case NodeType.CROSSROAD:
                return s.nodeMarkerCrossroad;
            case NodeType.MUNICIPALITY_BORDER:
                return s.nodeMarkerMunicipality;
            default:
                throw `NodeType not supported: ${node.type}`;
        }
    };

    private renderNeighborLinks = (neighborLinks: INeighborLink[]) => {
        return neighborLinks.map((neighborLink) => this.renderNeighborLink(neighborLink));
    };

    private renderNeighborLink = (neighborLink: INeighborLink) => {
        const onNeighborLinkClick = () => {
            const clickParams: IEditRoutePathNeighborLinkClickParams = {
                neighborLink,
            };
            EventListener.trigger('editRoutePathNeighborLinkClick', clickParams);
        };
        const isNeighborLinkHighlighted =
            neighborLink.routePathLink.id ===
            this.props.routePathLayerStore!.highlightedNeighborLinkId;
        return (
            <Polyline
                ref={this.state.polylineRefs[neighborLink.routePathLink.id]}
                onMouseOver={() =>
                    this.setRoutePathLinkHighlight({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: true,
                    })
                }
                onMouseOut={() =>
                    this.setRoutePathLinkHighlight({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: false,
                    })
                }
                positions={neighborLink.routePathLink.geometry}
                key={neighborLink.routePathLink.id}
                color={getNeighborLinkColor(neighborLink, isNeighborLinkHighlighted)}
                weight={5}
                opacity={isNeighborLinkHighlighted ? 0.8 : 1}
                onClick={onNeighborLinkClick}
            />
        );
    };

    private setRoutePathLinkHighlight = ({
        id,
        isHighlighted,
    }: {
        id: string;
        isHighlighted: boolean;
    }) => {
        if (isHighlighted) {
            if (this.props.routePathLayerStore!.highlightedNeighborLinkId !== id) {
                this.props.routePathLayerStore!.setHighlightedNeighborLinkId(id);
                this.state.polylineRefs[id]!.current.leafletElement.bringToFront();
            }
        } else {
            if (this.props.routePathLayerStore!.highlightedNeighborLinkId === id) {
                this.props.routePathLayerStore!.setHighlightedNeighborLinkId('');
            }
        }
    };

    render() {
        const neighborLinks: INeighborLink[] = this.props.routePathLayerStore!.neighborLinks;
        // get clusteredNeighborLinksMap<IRoutePathLink>
        const clusteredNeighborLinksMap: Map<
            LatLngBounds,
            INeighborLink[]
        > = _getClusteredNeighborLinksMap(
            neighborLinks,
            this.props.routePathLayerStore!.neighborToAddType
        );

        const clusteredNeighborLinkMapEntries = Array.from(clusteredNeighborLinksMap.entries());

        return (
            <>
                {clusteredNeighborLinkMapEntries.map(([bounds, neighborLinkCluster], index) => {
                    if (neighborLinkCluster.length === 1) {
                        const neighborLink = neighborLinkCluster[0];
                        // return renderNodeMarker(neighborLinkCluster[0]);
                        const nodeToRender =
                            this.props.routePathLayerStore!.neighborToAddType ===
                            NeighborToAddType.AfterNode
                                ? neighborLink.routePathLink.endNode
                                : neighborLink.routePathLink.startNode;
                        return [
                            this.renderNeighborNode(nodeToRender, neighborLink, index),
                            this.renderNeighborLink(neighborLink),
                        ];
                    }
                    if (neighborLinkCluster.length > 1) {
                        const searchNodes = neighborLinkCluster.map(
                            (neighborLink: INeighborLink) => {
                                const nodeToRender =
                                    this.props.routePathLayerStore!.neighborToAddType ===
                                    NeighborToAddType.AfterNode
                                        ? neighborLink.routePathLink.endNode
                                        : neighborLink.routePathLink.startNode;
                                return NodeFactory.createSearchNodeFromNode(nodeToRender);
                            }
                        );

                        const popupData: ISelectRoutePathNeighborPopupData = {
                            neighborNodes: neighborLinkCluster.map(
                                (neighborLink: INeighborLink) => {
                                    const nodeToRender =
                                        this.props.routePathLayerStore!.neighborToAddType ===
                                        NeighborToAddType.AfterNode
                                            ? neighborLink.routePathLink.endNode
                                            : neighborLink.routePathLink.startNode;
                                    return {
                                        neighborLink,
                                        node: nodeToRender,
                                    };
                                }
                            ),
                        };
                        return [
                            <ClusterNodeMarker
                                key={`clusterMarker-${index}`}
                                coordinates={bounds.getCenter()}
                                nodes={searchNodes}
                                iconSize={'large'}
                                popupType={'selectRoutePathNeighborPopup'}
                                popupData={popupData}
                            />,
                            this.renderNeighborLinks(neighborLinkCluster),
                        ];
                    }
                    return null;
                })}
            </>
        );
    }
}

const _getClusteredNeighborLinksMap = (
    neighborLinks: INeighborLink[],
    neighborToAddType: NeighborToAddType
): Map<LatLngBounds, INeighborLink[]> => {
    if (neighborLinks.length === 0) {
        return new Map();
    }
    const clusteredNeighborLinksMap = new Map<LatLngBounds, INeighborLink[]>();

    for (const neighborLink of neighborLinks) {
        let areaBounds;
        const node =
            neighborToAddType === NeighborToAddType.AfterNode
                ? neighborLink.routePathLink.endNode
                : neighborLink.routePathLink.startNode;
        if (clusteredNeighborLinksMap.size !== 0) {
            const areaEntries = clusteredNeighborLinksMap.entries();
            for (const [area] of areaEntries) {
                if (area.contains(node.coordinates)) {
                    areaBounds = area;
                    break;
                }
            }
        }

        if (!areaBounds) {
            areaBounds = node.coordinates.toBounds(3);
        }

        const neighborLinkGroup = clusteredNeighborLinksMap.get(areaBounds) || [];
        neighborLinkGroup.push(neighborLink);
        clusteredNeighborLinksMap.set(areaBounds, neighborLinkGroup);
    }
    return clusteredNeighborLinksMap;
};

const getNeighborLinkColor = (neighborLink: INeighborLink, isNeighborLinkHighlighted: boolean) => {
    const isNeighborLinkUsed = neighborLink.nodeUsageRoutePaths.length > 0;
    if (isNeighborLinkHighlighted) {
        if (isNeighborLinkUsed) {
            return s.usedNeighborColorHighlight;
        }
        return s.unusedNeighborColorHighlight;
    }
    if (isNeighborLinkUsed) {
        return s.usedNeighborColor;
    }
    return s.unusedNeighborColor;
};

export default RoutePathNeighborLinkLayer;

export { getNeighborLinkColor };
