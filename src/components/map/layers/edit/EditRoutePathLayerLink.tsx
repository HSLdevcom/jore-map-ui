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
import ArrowDecorator from '../utils/ArrowDecorator';
import DashedLine from '../utils/DashedLine';

const DEFAULT_LINK_COLOR = '#000';
const HOVERED_LINK_COLOR = '#cfc400';
const EXTENDED_LINK_COLOR = '#007ac9';

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
        const isLinkHovered = routePathLayerStore!.hoveredItemId === routePathLink.id;
        const isLinkExtended = routePathLayerStore!.extendedListItemId === routePathLink.id;
        return [
            <Polyline
                positions={routePathLink.geometry}
                key={`rpLink-overlay-${routePathLink.id}`}
                color={
                    isLinkHovered
                        ? HOVERED_LINK_COLOR
                        : isLinkExtended
                        ? EXTENDED_LINK_COLOR
                        : DEFAULT_LINK_COLOR
                }
                weight={15}
                opacity={isLinkHovered || isLinkExtended ? 0.6 : 0}
                onClick={this.handleLinkClick(routePathLink)}
                onMouseOver={() => this.onMouseOver(routePathLink.id)}
                onMouseOut={this.onMouseOut}
                interactive={true}
            />,
            <Polyline
                positions={routePathLink.geometry}
                key={`rpLink-${routePathLink.id}`}
                color={DEFAULT_LINK_COLOR}
                weight={5}
                opacity={0.8}
                interactive={false}
            />,
        ];
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

    private renderLinkDecorator = (routePathLink: IRoutePathLink) => {
        if (!this.props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)) {
            return null;
        }

        return (
            <ArrowDecorator
                color={DEFAULT_LINK_COLOR}
                geometry={routePathLink.geometry}
                onClick={this.handleLinkClick(routePathLink)}
                onMouseOver={() => this.onMouseOver(routePathLink.id)}
                onMouseOut={this.onMouseOut}
            />
        );
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

    render() {
        const rpLink = this.props.rpLink;
        return (
            <>
                {this.renderLink(rpLink)}
                {this.renderLinkDecorator(rpLink)}
                {this.renderDashedLines(rpLink)}
            </>
        );
    }
}

export default EditRoutePathLayer;
