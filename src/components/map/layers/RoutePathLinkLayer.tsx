import React, { Component } from 'react';
import 'leaflet-polylinedecorator';
import { Polyline, FeatureGroup } from 'react-leaflet';
import { observer, inject } from 'mobx-react';
import { INode, IRoutePathLink } from '~/models';
import { createCoherentLinesFromPolylines } from '~/util/geomHelper';
import { PopupStore } from '~/stores/popupStore';
import { MapStore, MapFilter } from '~/stores/mapStore';
import NodeMarker from './markers/NodeMarker';
import Marker from './markers/Marker';
import ArrowDecorator from './ArrowDecorator';

interface RoutePathLinkLayerProps {
    popupStore?: PopupStore;
    mapStore?: MapStore;
    internalId: string;
    routePathLinks: IRoutePathLink[];
    onClick: (target: any) => () => void;
    onContextMenu: (routePathLinkId: string) => void;
    onMouseOver: (target: any) => () => void;
    onMouseOut: (target: any) => () => void;
    color: string;
    opacity: number;
    weight: number;
}

@inject('popupStore', 'mapStore')
@observer
class RoutePathLinkLayer extends Component<RoutePathLinkLayerProps> {
    private layerRef: React.Ref<any>;

    constructor(props: RoutePathLinkLayerProps) {
        super(props);
        this.layerRef = React.createRef<any>();
    }

    private onContextMenu = (routePathLinkId: string) => () => {
        this.props.onContextMenu(routePathLinkId);
    };

    private openPopup = (node: INode) => () => {
        this.props.popupStore!.showPopup(node);
    };

    private renderRoutePathLinks() {
        const routePathLinks = this.props.routePathLinks;
        return routePathLinks.map(routePathLink => {
            return (
                <Polyline
                    positions={routePathLink.geometry}
                    key={routePathLink.id}
                    color={this.props.color}
                    weight={this.props.weight}
                    opacity={this.props.opacity}
                    onClick={this.props.onClick(this.layerRef)}
                    onContextMenu={this.onContextMenu(routePathLink.id)}
                />
            );
        });
    }
    private renderNodes() {
        const routePathLinks = this.props.routePathLinks;
        const nodes = routePathLinks.map((routePathLink, index) => {
            const node = routePathLink.startNode;
            return (
                <NodeMarker
                    key={`${routePathLink.orderNumber}-${index}`}
                    node={node}
                    isSelected={this.props.mapStore!.selectedNodeId === node.id}
                    isDisabled={routePathLink.startNodeType}
                    isTimeAlignmentStop={
                        routePathLink.startNodeTimeAlignmentStop !== '0'
                    }
                    onContextMenu={this.openPopup(routePathLink.startNode)}
                />
            );
        });
        const lastRoutePathLink = routePathLinks[routePathLinks.length - 1];
        const node = lastRoutePathLink.endNode;
        nodes.push(
            <NodeMarker
                key='last-node'
                node={node}
                isSelected={this.props.mapStore!.selectedNodeId === node.id}
                isDisabled={false} // Last node can't be disabled
                isTimeAlignmentStop={false} // Last node can't be a time alignment stop
                onContextMenu={this.openPopup(lastRoutePathLink.endNode)}
            />
        );
        return nodes;
    }

    private renderStartMarker() {
        const color = this.props.color;
        const routePathLinks = this.props.routePathLinks;
        if (routePathLinks!.length === 0) return;
        return (
            <Marker
                latLng={routePathLinks![0].startNode.coordinates}
                color={color}
                isClickDisabled={true}
            />
        );
    }

    private renderDirectionDecoration() {
        if (
            !this.props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)
        ) {
            return null;
        }

        const routePathLinks = this.props.routePathLinks;

        const geoms = routePathLinks.map(
            routePathLink => routePathLink.geometry
        );

        return createCoherentLinesFromPolylines(geoms).map((geom, index) => (
            <ArrowDecorator
                key={index}
                color={this.props.color}
                geometry={geom}
                onClick={this.props.onClick(this.layerRef)}
                onMouseOver={this.props.onMouseOver(this.layerRef)}
                onMouseOut={this.props.onMouseOut(this.layerRef)}
                isUpdatePrevented={true}
            />
        ));
    }

    render() {
        if (this.props.routePathLinks.length === 0) return null;

        return (
            <>
                <FeatureGroup
                    ref={this.layerRef}
                    onMouseOver={this.props.onMouseOver(this.layerRef)}
                    onMouseOut={this.props.onMouseOut(this.layerRef)}
                >
                    {this.renderRoutePathLinks()}
                    {this.renderNodes()}
                    {this.renderStartMarker()}
                </FeatureGroup>
                <FeatureGroup>{this.renderDirectionDecoration()}</FeatureGroup>
            </>
        );
    }
}

export default RoutePathLinkLayer;
