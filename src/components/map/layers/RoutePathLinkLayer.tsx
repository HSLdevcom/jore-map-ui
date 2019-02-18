import React, { Component } from 'react';
import 'leaflet-polylinedecorator';
import { Polyline, FeatureGroup, withLeaflet } from 'react-leaflet';
import { PolylineDecorator, Symbol } from 'leaflet';
import { observer, inject } from 'mobx-react';
import { INode, IRoutePathLink } from '~/models';
import { createCoherentLinesFromPolylines } from '~/util/geomHelper';
import NodeType from '~/enums/nodeType';
import { PopupStore } from '~/stores/popupStore';
import NodeMarker from './mapIcons/NodeMarker';
import StartMarker from './mapIcons/StartMarker';
import { LeafletContext } from '../Map';

interface RoutePathLinkLayerProps {
    leaflet: LeafletContext;
    popupStore?: PopupStore;
    internalId: string;
    routePathLinks: IRoutePathLink[];
    onClick: Function;
    onContextMenu: Function;
    onMouseOver: Function;
    onMouseOut: Function;
    color: string;
    opacity: number;
    weight: number;
}

@inject('popupStore')
@observer
class RoutePathLinkLayer extends Component<RoutePathLinkLayerProps> {
    private decorators: PolylineDecorator[] = [];
    private layerRef: any;

    constructor(props: RoutePathLinkLayerProps) {
        super(props);
        this.layerRef = React.createRef();
    }

    private onContextMenu = (routePathLinkId: string) => () => {
        this.props.onContextMenu(routePathLinkId);
    }

    private openPopup = (node: INode) => () => {
        this.props.popupStore!.showPopup(node);
    }

    private renderRoutePathLinks() {
        const routePathLinks = this.props.routePathLinks;
        return routePathLinks.map((routePathLink) => {
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
        const nodes = routePathLinks
            .map((routePathLink, index) => {
                return (
                    <NodeMarker
                        key={`${routePathLink.orderNumber}-${index}`}
                        node={routePathLink.startNode}
                        isDisabled={routePathLink.startNodeType === NodeType.DISABLED}
                        isTimeAlignmentStop={routePathLink.isStartNodeTimeAlignmentStop}
                        onContextMenu={this.openPopup(routePathLink.startNode)}
                    />
                );
            });
        const lastRoutePathLink = routePathLinks[routePathLinks.length - 1];
        nodes.push(
            <NodeMarker
                key='last-node'
                node={lastRoutePathLink.endNode}
                isDisabled={false} // Last node can't be disabled
                isTimeAlignmentStop={false} // Last node can't be a time alignment stop
                onContextMenu={this.openPopup(lastRoutePathLink.endNode)}
            />);
        return nodes;
    }

    private renderStartMarker() {
        const color = this.props.color;
        const routePathLinks = this.props.routePathLinks;
        if (routePathLinks!.length === 0) return;
        return (
            <StartMarker
                latLng={routePathLinks![0].startNode.coordinates}
                color={color}
            />
        );
    }

    private renderDirectionDecoration() {
        this.removeOldDecorators();
        const routePathLinks = this.props.routePathLinks;

        const map = this.props.leaflet.map!;
        const geoms = routePathLinks
            .map(routePathLink => routePathLink.geometry);

        createCoherentLinesFromPolylines(geoms).map((geom) => {
            const decorator = new PolylineDecorator(geom, {
                patterns: [
                    { repeat: 120, symbol: Symbol.arrowHead(
                        {
                            pixelSize: 15,
                            pathOptions: {
                                color: this.props.color,
                                fillColor: '#FFF',
                                fillOpacity: 1,
                                opacity: 1,
                            },
                        }),
                    },
                ],
            });
            decorator.on('mouseover', this.props.onMouseOver(this.layerRef));
            decorator.on('mouseout', this.props.onMouseOut(this.layerRef));
            decorator.on('click', this.props.onClick(this.layerRef));
            this.decorators.push(decorator);
            decorator.addTo(map);
        });
    }

    private removeOldDecorators() {
        this.decorators.forEach((editableLink: any) => {
            editableLink.remove();
        });
        this.decorators = [];
    }

    componentWillUnmount() {
        this.removeOldDecorators();
    }

    render() {
        return (
            <FeatureGroup
                routePathInternalId={this.props.internalId}
                onMouseOver={this.props.onMouseOver(this.layerRef)}
                onMouseOut={this.props.onMouseOut(this.layerRef)}
                ref={this.layerRef}
            >
                {this.renderRoutePathLinks()}
                {this.renderDirectionDecoration()}
                {this.renderNodes()}
                {this.renderStartMarker()}
            </FeatureGroup>
        );
    }
}

export default withLeaflet(RoutePathLinkLayer);
