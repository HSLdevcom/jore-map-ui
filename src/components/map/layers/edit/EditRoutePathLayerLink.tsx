import L from 'leaflet';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import IRoutePathLink from '~/models/IRoutePathLink';
import { MapFilter, MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { createCoherentLinesFromPolylines } from '~/utils/geomUtils';
import ArrowDecorator from '../utils/ArrowDecorator';
import DashedLine from '../utils/DashedLine';

const ROUTE_COLOR = '#000';

interface IRoutePathLayerProps {
    enableMapClickListener: () => void;
    disableMapClickListener: () => void;
    rpLink: IRoutePathLink;
    setExtendedListItem: (id: string | null) => void;
    routePathStore?: RoutePathStore;
    routePathLayerStore?: RoutePathLayerStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
}

@inject(
    'routePathStore',
    'routePathLayerStore',
    'toolbarStore',
    'mapStore',
    'routePathCopySegmentStore'
)
@observer
class EditRoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderLink = (routePathLink: IRoutePathLink) => {
        const routePathLayerStore = this.props.routePathLayerStore;
        let isLinkHighlighted;
        if (routePathLayerStore!.hoveredItemId) {
            isLinkHighlighted = routePathLayerStore!.hoveredItemId === routePathLink.id;
        } else {
            isLinkHighlighted = routePathLayerStore!.extendedListItemId === routePathLink.id;
        }
        return (
            <Polyline
                positions={routePathLink.geometry}
                key={routePathLink.id}
                color={ROUTE_COLOR}
                weight={isLinkHighlighted ? 25 : 5}
                opacity={isLinkHighlighted ? 0.5 : 0.8}
                onClick={this.handleLinkClick(routePathLink)}
                onMouseOver={() => this.onMouseOver(routePathLink.id)}
                onMouseOut={this.onMouseOut}
                interactive={true}
            />
        );
    };

    private onMouseOver = (id: string) => {
        this.props.routePathLayerStore!.setHoveredItemId(id);
    };

    private onMouseOut = () => {
        this.props.routePathLayerStore!.setHoveredItemId(null);
    };

    private handleLinkClick = (routePathLink: IRoutePathLink) => (e: L.LeafletMouseEvent) => {
        if (
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool.onRoutePathLinkClick
        ) {
            this.props.toolbarStore!.selectedTool.onRoutePathLinkClick(routePathLink.id)(e);
        } else {
            this.props.routePathLayerStore!.extendedListItemId === routePathLink.id
                ? this.props.setExtendedListItem(null)
                : this.props.setExtendedListItem(routePathLink.id);

            this.props.disableMapClickListener();
            // Prevent current click event from triggering map click listener
            setTimeout(() => {
                this.props.enableMapClickListener();
            }, 1);
        }
    };

    private renderDashedLines = (routePathLink: IRoutePathLink) => {
        return [
            <DashedLine
                key={'startNodeDashedLine'}
                startPoint={routePathLink.geometry[0]}
                endPoint={routePathLink.startNode.coordinates}
                color={'#efc210'}
            />,
            <DashedLine
                key={'endNodeDashedLine'}
                startPoint={routePathLink.geometry[routePathLink.geometry.length - 1]}
                endPoint={routePathLink.endNode.coordinates}
                color={'#efc210'}
            />,
        ];
    };

    private renderLinkDecorator = () => {
        if (!this.props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)) {
            return null;
        }

        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        const coherentPolylines = createCoherentLinesFromPolylines(
            routePathLinks.map((rpLink) => rpLink.geometry)
        );
        return coherentPolylines.map((polyline, index) => (
            <ArrowDecorator key={index} color={ROUTE_COLOR} geometry={polyline} />
        ));
    };

    render() {
        const rpLink = this.props.rpLink;
        return (
            <>
                {this.renderLink(rpLink)}
                {this.renderDashedLines(rpLink)}
                {this.renderLinkDecorator()}
            </>
        );
    }
}

export default EditRoutePathLayer;
