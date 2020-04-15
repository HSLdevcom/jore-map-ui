import _ from 'lodash';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Polyline } from 'react-leaflet';
import TransitTypeLink from '~/components/shared/TransitTypeLink';
import EventHelper, { IEditRoutePathNeighborLinkClickParams } from '~/helpers/EventHelper';
import { IRoutePath } from '~/models';
import INeighborLink from '~/models/INeighborLink';
import INode from '~/models/INode';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import { NeighborToAddType, RoutePathStore } from '~/stores/routePathStore';
import NodeUtils from '~/utils/NodeUtils';
import { toDateString } from '~/utils/dateUtils';
import NodeMarker from '../markers/NodeMarker';
import * as s from './routePathNeighborLinkLayer.scss';

const USED_NEIGHBOR_COLOR = '#0dce0a';
const USED_NEIGHBOR_COLOR_HIGHLIGHT = '#048c01';
const UNUSED_NEIGHBOR_COLOR = '#fc383a';
const UNUSED_NEIGHBOR_COLOR_HIGHLIGHT = '#c40608';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    mapStore?: MapStore;
}

interface IRoutePathLayerState {
    highlightedRoutePathLinkId: string;
    polylineRefs: PolylineRefs;
}

interface PolylineRefs {
    [key: string]: any;
}

@inject('routePathStore', 'mapStore')
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

    private getNodeUsageViewMarkup = (routePaths: IRoutePath[]) => {
        if (!routePaths || routePaths.length === 0) return;
        return ReactDOMServer.renderToStaticMarkup(
            <div className={s.nodeUsageList}>
                <div className={s.topic}>Solmua käyttävät reitinsuunnat</div>
                {routePaths
                    .slice()
                    .sort((a, b) => (a.routeId < b.routeId ? -1 : 1))
                    .map((routePath, index) => {
                        const routePathLink = routeBuilder
                            .to(SubSites.routePath)
                            .toTarget(
                                ':id',
                                [
                                    routePath.routeId,
                                    Moment(routePath.startTime).format('YYYY-MM-DDTHH:mm:ss'),
                                    routePath.direction
                                ].join(',')
                            )
                            .toLink();
                        const openRoutePathInNewWindow = () => {
                            const path = routePathLink; // TODO? + Navigator.getSearch();
                            window.open(path, '_blank');
                        };
                        return (
                            <div className={s.usageListItem} key={index}>
                                <div className={s.transitTypeLinkWrapper}>
                                    <TransitTypeLink
                                        transitType={routePath.transitType!}
                                        shouldShowTransitTypeIcon={true}
                                        text={routePath.routeId}
                                        size='small'
                                        onClick={openRoutePathInNewWindow}
                                        hoverText={`Avaa reitin suunta ${
                                            routePath.routeId
                                        } uuteen ikkunaan`}
                                    />
                                </div>
                                <div className={s.direction}>{routePath.direction}</div>
                                <div>
                                    <div className={s.place}>{routePath.originFi}</div>
                                    <div>-</div>
                                    <div className={s.place}>{routePath.destinationFi}</div>
                                </div>
                                <div>
                                    <div>{toDateString(routePath.startTime)}</div>
                                    <div>-</div>
                                    <div>{toDateString(routePath.endTime)}</div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
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
                onClick={onNeighborLinkClick}
                markerClasses={[s.neighborMarker]}
                forcedVisibleNodeLabels={[NodeLabel.longNodeId]}
                popupContent={this.getNodeUsageViewMarkup(neighborLink.nodeUsageRoutePaths)}
                color={this.getNeighborLinkColor(neighborLink)}
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
