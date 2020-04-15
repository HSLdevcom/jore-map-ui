import _ from 'lodash';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import EventHelper, { IEditRoutePathNeighborLinkClickParams } from '~/helpers/EventHelper';
import { IRoutePath } from '~/models';
import INeighborLink from '~/models/INeighborLink';
import INode from '~/models/INode';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import { IPopupProps, PopupStore } from '~/stores/popupStore';
import { NeighborToAddType, RoutePathStore } from '~/stores/routePathStore';
import NodeUtils from '~/utils/NodeUtils';
import NodeMarker from '../markers/NodeMarker';
import { INodeUsagePopupData } from '../popups/NodeUsagePopup';
import * as s from './routePathNeighborLinkLayer.scss';

const USED_NEIGHBOR_COLOR = '#0dce0a';
const USED_NEIGHBOR_COLOR_HIGHLIGHT = '#048c01';
const UNUSED_NEIGHBOR_COLOR = '#fc383a';
const UNUSED_NEIGHBOR_COLOR_HIGHLIGHT = '#c40608';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    mapStore?: MapStore;
    popupStore?: PopupStore;
}

interface IRoutePathLayerState {
    highlightedRoutePathLinkId: string;
    polylineRefs: PolylineRefs;
}

interface PolylineRefs {
    [key: string]: any;
}

@inject('routePathStore', 'mapStore', 'popupStore')
@observer
class RoutePathNeighborLinkLayer extends Component<IRoutePathLayerProps, IRoutePathLayerState> {
    private linkListener: IReactionDisposer;
    constructor(props: IRoutePathLayerProps) {
        super(props);
        this.state = {
            highlightedRoutePathLinkId: '',
            polylineRefs: {}
        };
        this.linkListener = reaction(
            () => this.props.routePathStore!.neighborLinks.length,
            () => this.initializePolylineRefs()
        );
    }

    public componentWillUnmount() {
        this.linkListener();
    }

    private initializePolylineRefs = () => {
        const polylineRefs = {};
        this.props.routePathStore!.neighborLinks.forEach(neighborLink => {
            polylineRefs[neighborLink.routePathLink.id] = React.createRef<any>();
        });
        this.setState({
            polylineRefs
        });
    };

    private showNodePopup = (node: INode, routePaths: IRoutePath[]) => {
        const popupData: INodeUsagePopupData = {
            routePaths
        };
        const nodePopup: IPopupProps = {
            type: 'nodeUsagePopup',
            data: popupData,
            coordinates: node!.coordinates,
            isCloseButtonVisible: false,
            isAutoCloseOn: true
        };

        this.props.popupStore!.showPopup(nodePopup);
    };

    private renderNeighborNode = (node: INode, neighborLink: INeighborLink, key: number) => {
        const onNeighborLinkClick = () => {
            const clickParams: IEditRoutePathNeighborLinkClickParams = {
                neighborLink
            };
            EventHelper.trigger('editRoutePathNeighborLinkClick', clickParams);
        };

        return (
            <NodeMarker
                key={`${key}-${node.id}`}
                coordinates={node.coordinates}
                nodeType={node.type}
                nodeLocationType={'coordinates'}
                nodeId={node.id}
                shortId={NodeUtils.getShortId(node)}
                hastusId={node.stop ? node.stop.hastusId : undefined}
                isHighlighted={this.props.mapStore!.selectedNodeId === node.id}
                markerClasses={[s.neighborMarker]}
                forcedVisibleNodeLabels={[NodeLabel.longNodeId]}
                color={this.getNeighborLinkColor(neighborLink)}
                onClick={onNeighborLinkClick}
                onContextMenu={() => this.showNodePopup(node, neighborLink.nodeUsageRoutePaths)}
                onMouseOver={() =>
                    this.highlightRoutePathLink({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: true
                    })
                }
                onMouseOut={() =>
                    this.highlightRoutePathLink({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: false
                    })
                }
                hasHighZIndex={this.isNeighborLinkHighlighted(neighborLink)}
            >
                <div className={s.usageCount}>
                    {neighborLink.nodeUsageRoutePaths.length > 9
                        ? '9+'
                        : neighborLink.nodeUsageRoutePaths.length}
                </div>
            </NodeMarker>
        );
    };

    private getNeighborLinkColor = (neighborLink: INeighborLink) => {
        const isNeighborLinkUsed = neighborLink.nodeUsageRoutePaths.length > 0;
        if (this.isNeighborLinkHighlighted(neighborLink)) {
            if (isNeighborLinkUsed) {
                return USED_NEIGHBOR_COLOR_HIGHLIGHT;
            }
            return UNUSED_NEIGHBOR_COLOR_HIGHLIGHT;
        }
        if (isNeighborLinkUsed) {
            return USED_NEIGHBOR_COLOR;
        }
        return UNUSED_NEIGHBOR_COLOR;
    };

    private isNeighborLinkHighlighted = (neighborLink: INeighborLink) => {
        return neighborLink.routePathLink.id === this.state.highlightedRoutePathLinkId;
    };

    private renderNeighborLink = (neighborLink: INeighborLink) => {
        const onNeighborLinkClick = () => {
            const clickParams: IEditRoutePathNeighborLinkClickParams = {
                neighborLink
            };
            EventHelper.trigger('editRoutePathNeighborLinkClick', clickParams);
        };
        return (
            <Polyline
                ref={this.state.polylineRefs[neighborLink.routePathLink.id]}
                onMouseOver={() =>
                    this.highlightRoutePathLink({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: true
                    })
                }
                onMouseOut={() =>
                    this.highlightRoutePathLink({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: false
                    })
                }
                positions={neighborLink.routePathLink.geometry}
                key={neighborLink.routePathLink.id}
                color={this.getNeighborLinkColor(neighborLink)}
                weight={5}
                opacity={this.isNeighborLinkHighlighted(neighborLink) ? 1 : 0.8}
                onClick={onNeighborLinkClick}
            />
        );
    };

    private highlightRoutePathLink = ({
        id,
        isHighlighted
    }: {
        id: string;
        isHighlighted: boolean;
    }) => {
        if (isHighlighted) {
            if (this.state.highlightedRoutePathLinkId !== id) {
                this.setState({
                    highlightedRoutePathLinkId: id
                });
                this.state.polylineRefs[id]!.current.leafletElement.bringToFront();
            }
        } else {
            if (this.state.highlightedRoutePathLinkId === id) {
                this.setState({
                    highlightedRoutePathLinkId: ''
                });
            }
        }
    };

    render() {
        const neighborLinks = this.props.routePathStore!.neighborLinks;
        return neighborLinks.map((neighborLink, index) => {
            const neighborToAddType = this.props.routePathStore!.neighborToAddType;
            const nodeToRender =
                neighborToAddType === NeighborToAddType.AfterNode
                    ? neighborLink.routePathLink.endNode
                    : neighborLink.routePathLink.startNode;
            return [
                this.renderNeighborNode(nodeToRender, neighborLink, index),
                this.renderNeighborLink(neighborLink)
            ];
        });
    }
}

export default RoutePathNeighborLinkLayer;
