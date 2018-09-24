import React, { Component } from 'react';
import L from 'leaflet';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import { SidebarStore } from '../../../stores/sidebarStore';
import { IRoutePath } from '../../../models';
import routeBuilder  from '../../../routing/routeBuilder';
import subSites from '../../../routing/subSites';
import navigator from '../../../routing/navigator';
import RoutePathLayer from './RoutePathLayer';

interface RouteLayerProps {
    sidebarStore?: SidebarStore;
    routePaths: IRoutePath[];
    fitBounds: (bounds: L.LatLngBoundsExpression) => void;
    colors: string[];
    bringRouteLayerToFront: Function;
}

interface IRouteLayerState {
    selectedPolylines: string[];
    hoveredPolylines: string[];
}

@inject('sidebarStore')
@observer
export default class RouteLayer extends Component<RouteLayerProps, IRouteLayerState> {
    constructor(props: RouteLayerProps) {
        super(props);
        this.state = {
            selectedPolylines: [],
            hoveredPolylines: [],
        };
    }

    calculateBounds() {
        let bounds:L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routePaths.forEach((routePath) => {
            const geoJSON = L.geoJSON(toJS(routePath.geoJson));
            if (!bounds) {
                bounds = geoJSON.getBounds();
            } else {
                bounds.extend(geoJSON.getBounds());
            }
        });

        if (bounds.isValid()) {
            this.props.fitBounds(bounds);
        }
    }

    componentDidUpdate(prevProps: RouteLayerProps) {
        const routePathsChanged =
            prevProps.routePaths.map(rPath => rPath.internalId).join(':')
            !== this.props.routePaths.map(rPath => rPath.internalId).join(':');
        if (routePathsChanged) {
            this.calculateBounds();
            this.setState({
                selectedPolylines: [],
            });
        }
    }

    private toggleHighlight(internalId: string) {
        const selectedPolylines = this.state.selectedPolylines;
        const isSelected = selectedPolylines.indexOf(internalId) > -1;

        (isSelected) ?
            selectedPolylines.splice(selectedPolylines.indexOf(internalId), 1) :
            selectedPolylines.push(internalId);

        this.setState({
            selectedPolylines,
        });
        this.props.bringRouteLayerToFront(internalId);
    }

    private openLinkView = (routePathLinkId: number) => {
        // TODO deal with fetching linkID in the endpoint
        this.props.sidebarStore!.setOpenLinkId(routePathLinkId);
        const linkViewLink = routeBuilder.to(subSites.link).toLink();
        navigator.goTo(linkViewLink);
    }

    private hasHighlight(internalId: string) {
        return this.state.selectedPolylines.includes(internalId) ||
            this.state.hoveredPolylines.includes(internalId);
    }

    private setHoverHighlight(internalId: string) {
        this.setState({
            hoveredPolylines: this.state.hoveredPolylines.concat(internalId),
        });
        this.props.bringRouteLayerToFront(internalId);
    }

    private clearHoverHightlights = () => {
        this.setState({
            hoveredPolylines: [],
        });
    }

    render() {
        return this.props.routePaths
            .map((routePath, index) => {
                const color = this.props.colors[index];
                const internalId = routePath.internalId;
                return (
                    <RoutePathLayer
                        key={index}
                        onClick={this.toggleHighlight.bind(this, internalId)}
                        onContextMenu={this.openLinkView}
                        onMouseOver={this.setHoverHighlight.bind(this, internalId)}
                        onMouseOut={this.clearHoverHightlights}
                        routePathLinks={routePath.routePathLinks}
                        color={color}
                        opacity={this.hasHighlight(internalId) ? 1 : 0.6}
                        weight={this.hasHighlight(internalId) ? 8 : 7}
                    />
                );
            });
    }
}
