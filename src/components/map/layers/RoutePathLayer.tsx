import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { withLeaflet } from 'react-leaflet';
import { RoutePathLayerListStore } from '~/stores/routePathLayerListStore';
import { LeafletContext } from '../Map';
import RoutePathLinkLayer from './RoutePathLinkLayer';

interface IRoutePathLayerProps {
    leaflet: LeafletContext;
    routePathLayerListStore?: RoutePathLayerListStore;
}

@inject('routePathLayerListStore')
@observer
class RoutePathLayer extends Component<IRoutePathLayerProps> {
    constructor(props: IRoutePathLayerProps) {
        super(props);
    }
    private toggleSelectedRoutePath = (target: any, id: string) => (e: any) => {
        this.props.routePathLayerListStore!.toggleSelectedRoutePath(id);
        if (target.current) {
            target.current.leafletElement.bringToFront();
        }
        this.bringArrowDecoratorsOnTop();
    };
    private hoverHighlight = (target: any, id: string) => (e: any) => {
        this.props.routePathLayerListStore!.setRoutePathHighlight(id);
        if (target.current && !Boolean(this.props.routePathLayerListStore!.selectedRoutePathId)) {
            target.current.leafletElement.bringToFront();
        }
        this.bringArrowDecoratorsOnTop();
    };
    private hoverHighlightOff = (target: any, id: string) => (e: any) => {
        this.props.routePathLayerListStore!.setRoutePathHighlight(null);
        if (target.current && !Boolean(this.props.routePathLayerListStore!.selectedRoutePathId)) {
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
        const routePathLayerListStore = this.props.routePathLayerListStore!;
        const routePaths = routePathLayerListStore.routePaths;
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
