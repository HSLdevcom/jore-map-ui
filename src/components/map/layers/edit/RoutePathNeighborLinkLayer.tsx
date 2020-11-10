import _ from 'lodash';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import NodeSize from '~/enums/nodeSize';
import NodeType from '~/enums/nodeType';
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
    highlightedRoutePathLinkId: string;
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
            highlightedRoutePathLinkId: '',
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

        const visibleNodeLabels = _.union(this.props.mapStore!.visibleNodeLabels, [
            NodeLabel.longNodeId,
        ]);

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
                    this.highlightRoutePathLink({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: true,
                    })
                }
                onMouseOut={() =>
                    this.highlightRoutePathLink({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: false,
                    })
                }
                hasHighZIndex={this.isNeighborLinkHighlighted(neighborLink)}
                size={NodeSize.LARGE}
            >
                <div
                    className={s.usageCount}
                    style={{ color: this.getNeighborLinkColor(neighborLink) }}
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

    private isNeighborLinkHighlighted = (neighborLink: INeighborLink) => {
        return neighborLink.routePathLink.id === this.state.highlightedRoutePathLinkId;
    };

    private renderNeighborLink = (neighborLink: INeighborLink) => {
        const onNeighborLinkClick = () => {
            const clickParams: IEditRoutePathNeighborLinkClickParams = {
                neighborLink,
            };
            EventListener.trigger('editRoutePathNeighborLinkClick', clickParams);
        };
        return (
            <Polyline
                ref={this.state.polylineRefs[neighborLink.routePathLink.id]}
                onMouseOver={() =>
                    this.highlightRoutePathLink({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: true,
                    })
                }
                onMouseOut={() =>
                    this.highlightRoutePathLink({
                        id: neighborLink.routePathLink.id,
                        isHighlighted: false,
                    })
                }
                positions={neighborLink.routePathLink.geometry}
                key={neighborLink.routePathLink.id}
                color={this.getNeighborLinkColor(neighborLink)}
                weight={5}
                opacity={this.isNeighborLinkHighlighted(neighborLink) ? 0.8 : 1}
                onClick={onNeighborLinkClick}
            />
        );
    };

    private getNeighborLinkColor = (neighborLink: INeighborLink) => {
        const isNeighborLinkUsed = neighborLink.nodeUsageRoutePaths.length > 0;
        if (this.isNeighborLinkHighlighted(neighborLink)) {
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

    private highlightRoutePathLink = ({
        id,
        isHighlighted,
    }: {
        id: string;
        isHighlighted: boolean;
    }) => {
        if (isHighlighted) {
            if (this.state.highlightedRoutePathLinkId !== id) {
                this.setState({
                    highlightedRoutePathLinkId: id,
                });
                this.state.polylineRefs[id]!.current.leafletElement.bringToFront();
            }
        } else {
            if (this.state.highlightedRoutePathLinkId === id) {
                this.setState({
                    highlightedRoutePathLinkId: '',
                });
            }
        }
    };

    render() {
        const neighborLinks = this.props.routePathLayerStore!.neighborLinks;
        return neighborLinks.map((neighborLink, index) => {
            const neighborToAddType = this.props.routePathLayerStore!.neighborToAddType;
            const nodeToRender =
                neighborToAddType === NeighborToAddType.AfterNode
                    ? neighborLink.routePathLink.endNode
                    : neighborLink.routePathLink.startNode;
            return [
                this.renderNeighborNode(nodeToRender, neighborLink, index),
                this.renderNeighborLink(neighborLink),
            ];
        });
    }
}

export default RoutePathNeighborLinkLayer;
