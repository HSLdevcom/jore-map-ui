import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import * as L from 'leaflet';
import { NewRoutePathStore } from '~/stores/new/newRoutePathStore';
import { Marker } from 'react-leaflet';
import classnames from 'classnames';
import * as s from './newRoutePathLayer.scss';

interface IRoutePathLayerProps {
    newRoutePathStore?: NewRoutePathStore;
}

@inject('newRoutePathStore')
@observer
export default class RoutePathLayer extends Component<IRoutePathLayerProps> {

    private getMarkerHtml = () => {
        return `<div class="${classnames(s.nodeBase, s.newRoutePathMarker)}" />`;
    }

    private getIcon() {
        const divIconOptions : L.DivIconOptions = {
            html: this.getMarkerHtml(),
            className: s.node,
        };

        return new L.DivIcon(divIconOptions);

    }

    private renderNodes() {
        return this.props.newRoutePathStore!.nodes.map((node, index) => {
            const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);
            return (
                <Marker
                    icon={this.getIcon()}
                    key={index}
                    position={latLng}
                />
            );
        });
    }

    render() {
        return (
            <>
                {this.renderNodes()}
            </>
        );

    }
}
