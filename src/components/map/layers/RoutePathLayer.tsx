import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { withLeaflet } from 'react-leaflet';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { LeafletContext } from '../Map';
import RoutePathLinkLayer from './RoutePathLinkLayer';

interface IRoutePathLayerProps {
    leaflet: LeafletContext;
    routePathLayerStore?: RoutePathLayerStore;
}

@inject('routePathLayerStore')
@observer
class RoutePathLayer extends Component<IRoutePathLayerProps> {
    constructor(props: IRoutePathLayerProps) {
        super(props);
    }
    private toggleSelectedRoutePath = (target: any, id: string) => (e: any) => {
        this.props.routePathLayerStore!.toggleSelectedRoutePath(id);
        if (target.current) {
            target.current.leafletElement.bringToFront();
        }
        this.bringArrowDecoratorsOnTop();
    };
    private hoverHighlight = (target: any, id: string) => (e: any) => {
        this.props.routePathLayerStore!.setRoutePathHighlight(id);
        if (target.current && !Boolean(this.props.routePathLayerStore!.selectedRoutePathId)) {
            target.current.leafletElement.bringToFront();
        }
        this.bringArrowDecoratorsOnTop();
    };
    private hoverHighlightOff = (target: any, id: string) => (e: any) => {
        this.props.routePathLayerStore!.setRoutePathHighlight(null);
        if (target.current && !Boolean(this.props.routePathLayerStore!.selectedRoutePathId)) {
            target.current.leafletElement.bringToBack();
        }
        this.bringArrowDecoratorsOnTop();
    };

    // This moves (magically) ArrowDecorators on top of routePathLinks
    private bringArrowDecoratorsOnTop = () => {
        const map = this.props.leaflet.map;
        map!.setView(map!.getCenter(), map!.getZoom());
    };

    render() {
        const routePathLayerStore = this.props.routePathLayerStore!;
        const routePaths = routePathLayerStore.routePaths;
        return routePaths.map((routePath, index) => {
            const internalId = routePath.internalId;
            return (
                <RoutePathLinkLayer
                    key={routePath.internalId}
                    internalId={internalId}
                    onClick={this.toggleSelectedRoutePath}
                    onMouseOver={this.hoverHighlight}
                    onMouseOut={this.hoverHighlightOff}
                    routePath={routePath}
                />
            );
        });
    }
}

export default withLeaflet(RoutePathLayer);
