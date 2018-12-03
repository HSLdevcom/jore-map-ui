import React, { Component } from 'react';
import * as L from 'leaflet';
import { Polyline, FeatureGroup, Marker } from 'react-leaflet';
import { observer, inject } from 'mobx-react';
import { IRoutePathLink } from '~/models';
import NodeType from '~/enums/nodeType';
import PinIcon from '~/icons/pin';
import { PopupStore } from '~/stores/popupStore';
import NodeLayer from './NodeLayer';
import * as s from './routePathLinkLayer.scss';

// The logic of Z Indexes is not very logical.
// Setting z-index to 2, if other items is 1 wont force it to be on top.
// Setting z-index to a very high number will however most likely set the item on top.
// https://leafletjs.com/reference-1.3.4.html#marker-zindexoffset
const VERY_HIGH_Z_INDEX = 1000;

interface RoutePathLinkLayerProps {
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
export default class RoutePathLayer extends Component<RoutePathLinkLayerProps> {

    private onContextMenu = (routePathLinkId: string) => () => {
        this.props.onContextMenu(routePathLinkId);
    }

    private renderRoutePathLinks() {
        const routePathLinks = this.props.routePathLinks;
        return routePathLinks.map((routePathLink, index) => {
            return (
                <Polyline
                    positions={routePathLink.positions}
                    key={routePathLink.id}
                    color={this.props.color}
                    weight={this.props.weight}
                    opacity={this.props.opacity}
                    onClick={this.props.onClick}
                    onContextMenu={this.onContextMenu(routePathLink.id)}
                />
            );
        });
    }

    private renderNodes() {
        const routePathLinks = this.props.routePathLinks;
        return routePathLinks.map((routePathLink, index) => {
            return (
                <div key={index}>
                    <NodeLayer
                        key={`${routePathLink.startNode.id}`}
                        node={routePathLink.startNode}
                        isDisabled={routePathLink.startNodeType === NodeType.DISABLED}
                        isTimeAlignmentStop={routePathLink.isStartNodeTimeAlignmentStop}
                    />
                    { index === routePathLinks.length - 1 &&
                        <NodeLayer
                            key={`${routePathLink.endNode.id}`}
                            node={routePathLink.endNode}
                            /* hardcoded because last node doens't have this data */
                            isDisabled={false}
                            /* hardcoded because last node doens't have this data */
                            isTimeAlignmentStop={false}
                        />
                    }
                </div>
            );
        });
    }

    private renderStartMarker() {
        const routePathLinks = this.props.routePathLinks;

        const icon = this.getStartPointIcon();
        const coordinates = routePathLinks![0].startNode.coordinates;
        return (
            <Marker
                zIndexOffset={VERY_HIGH_Z_INDEX}
                icon={icon}
                position={[coordinates.lat, coordinates.lon]}
            />
        );
    }

    private getStartPointIcon = () => {
        const divIconOptions : L.DivIconOptions = {
            className: s.nodeMarker,
            html: PinIcon.getPin(this.props.color),
        };

        return new L.DivIcon(divIconOptions);
    }

    render() {
        return (
            <FeatureGroup
                routePathInternalId={this.props.internalId}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
            >
                {this.renderRoutePathLinks()}
                {this.renderNodes()}
                {this.renderStartMarker()}
            </FeatureGroup>
        );
    }
}
