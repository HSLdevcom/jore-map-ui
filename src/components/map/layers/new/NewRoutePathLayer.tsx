import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import * as L from 'leaflet';
import { NewRoutePathStore, INewRoutePathNode } from '~/stores/new/newRoutePathStore';
import { Marker } from 'react-leaflet';
import classnames from 'classnames';
import * as s from './newRoutePathLayer.scss';

interface IRoutePathLayerProps {
    newRoutePathStore?: NewRoutePathStore;
}

@inject('newRoutePathStore')
@observer
export default class RoutePathLayer extends Component<IRoutePathLayerProps> {

    private getMarkerHtml = (isNeighbor: boolean) => {
        return `<div class="${classnames(
            s.nodeBase,
            isNeighbor ? s.newRoutePathMarkerNeighbor : s.newRoutePathMarker,
        )}" />`;
    }

    private getIcon({ isNeighbor }: any) {
        const divIconOptions : L.DivIconOptions = {
            html: this.getMarkerHtml(isNeighbor),
            className: s.node,
        };

        return new L.DivIcon(divIconOptions);
    }

    private renderNodes() {
        return this.props.newRoutePathStore!.nodes.map((node, index) => {
            const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);
            return (
                <Marker
                    icon={this.getIcon({ isNeighbor: false })}
                    key={index}
                    position={latLng}
                />
            );
        });
    }

    private renderNeighbors() {
        return this.props.newRoutePathStore!.neighborNodes.map((node, index) => {
            const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);
            return (
                <Marker
                    onClick={this.addNode(node)}
                    icon={this.getIcon({ isNeighbor: true })}
                    key={index}
                    position={latLng}
                />
            );
        });
    }

    private addNode = (node: INewRoutePathNode) => () => {
        this.props.newRoutePathStore!.addNode(node);
    }

    render() {
        return (
            <>
                {this.renderNodes()}
                {this.renderNeighbors()}
            </>
        );

    }
}
