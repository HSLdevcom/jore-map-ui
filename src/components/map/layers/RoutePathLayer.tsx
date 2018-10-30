import React, { Component } from 'react';
import L from 'leaflet';
import { inject, observer } from 'mobx-react';
import { SidebarStore } from '~/stores/sidebarStore';
import { IRoutePath } from '~/models';
import routeBuilder  from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import RoutePathLinkLayer from './RoutePathLinkLayer';

interface RoutePathLayerProps {
    sidebarStore?: SidebarStore;
    toggleHighlight: Function;
    setHoverHighlight: Function;
    clearHoverHighlights: Function;
    hasHighlight: Function;
    colors: string[];
    routePaths: IRoutePath[];
    fitBounds: (bounds: L.LatLngBoundsExpression) => void;
}

@inject('sidebarStore')
@observer
export default class RouteLayer extends Component<RoutePathLayerProps> {
    private openLinkView = (routePathLinkId: number) => {
        // TODO deal with fetching linkID in the endpoint
        this.props.sidebarStore!.setOpenLinkId(routePathLinkId);
        const linkViewLink = routeBuilder.to(subSites.link).toLink();
        navigator.goTo(linkViewLink);
    }

    render() {
        return this.props.routePaths
            .map((routePath, index) => {
                if (!routePath.visible) return;
                const color = this.props.colors[index];
                const internalId = routePath.internalId;
                return (
                    <RoutePathLinkLayer
                        key={index}
                        internalId={internalId}
                        onClick={this.props.toggleHighlight(internalId)}
                        onContextMenu={this.openLinkView}
                        onMouseOver={this.props.setHoverHighlight(internalId)}
                        onMouseOut={this.props.clearHoverHighlights}
                        routePathLinks={routePath.routePathLinks!}
                        color={color}
                        opacity={this.props.hasHighlight(internalId) ? 1 : 0.6}
                        weight={this.props.hasHighlight(internalId) ? 8 : 7}
                    />
                );
            });
    }
}
