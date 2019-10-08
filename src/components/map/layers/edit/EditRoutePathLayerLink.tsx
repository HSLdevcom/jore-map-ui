import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import { inject, observer } from 'mobx-react';
import IRoutePathLink from '~/models/IRoutePathLink';
import { createCoherentLinesFromPolylines } from '~/util/geomHelper';
import { RoutePathStore } from '~/stores/routePathStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { MapStore, MapFilter } from '~/stores/mapStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import ArrowDecorator from '../ArrowDecorator';

const ROUTE_COLOR = '#000';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
    highlightItemById: (id: string) => void;
}

@inject(
    'routePathStore',
    'toolbarStore',
    'mapStore',
    'routePathCopySegmentStore'
)
@observer
class EditRoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderRoutePathLinks = () => {
        const routePathLinks = this.props.routePathStore!.routePath!
            .routePathLinks;
        if (!routePathLinks || routePathLinks.length < 1) return;

        return routePathLinks.map((rpLink, index) => {
            return (
                <div key={index}>
                    {this.renderLink(rpLink)}
                    {this.renderDashedLines(rpLink)}{' '}
                </div>
            );
        });
    };

    private renderLink = (routePathLink: IRoutePathLink) => {
        const onRoutePathLinkClick =
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick
                ? this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick!(
                      routePathLink.id
                  )
                : () => this.props.highlightItemById(routePathLink.id);

        return [
            <Polyline
                positions={routePathLink.geometry}
                key={routePathLink.id}
                color={ROUTE_COLOR}
                weight={5}
                opacity={0.8}
                onClick={onRoutePathLinkClick}
            />,
            this.props.routePathStore!.listHighlightedNodeIds.includes(
                routePathLink.id
            ) && (
                <Polyline
                    positions={routePathLink.geometry}
                    key={`${routePathLink.id}-highlight`}
                    color={ROUTE_COLOR}
                    weight={25}
                    opacity={0.5}
                    onClick={onRoutePathLinkClick}
                />
            )
        ];
    };

    private renderDashedLines = (routePathLink: IRoutePathLink) => {
        const startNodeCoordinates = routePathLink.startNode.coordinates;
        const endNodeCoordinates = routePathLink.endNode.coordinates;

        const linkStartCoordinates = routePathLink.geometry[0];
        const linkEndCoordinates =
            routePathLink.geometry[routePathLink.geometry.length - 1];
        const dashedLines = [];
        if (!startNodeCoordinates.equals(linkStartCoordinates)) {
            dashedLines.push(
                this.renderDashedLine(
                    startNodeCoordinates,
                    linkStartCoordinates,
                    `startNodeDashedLine-${routePathLink.orderNumber}`
                )
            );
        }
        if (!endNodeCoordinates.equals(linkEndCoordinates)) {
            dashedLines.push(
                this.renderDashedLine(
                    endNodeCoordinates,
                    linkEndCoordinates,
                    `endNodeDashedLine-${routePathLink.orderNumber}`
                )
            );
        }
        return dashedLines;
    };

    private renderDashedLine = (
        startCoordinates: L.LatLng,
        endCoordinates: L.LatLng,
        key: string
    ) => {
        return (
            <Polyline
                positions={[startCoordinates, endCoordinates]}
                key={key}
                color={'#007ac9'}
                weight={5}
                opacity={0.75}
                dashArray={'10, 10'}
            />
        );
    };

    private renderLinkDecorator = () => {
        if (
            !this.props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)
        ) {
            return null;
        }

        const routePathLinks = this.props.routePathStore!.routePath!
            .routePathLinks;
        const coherentPolylines = createCoherentLinesFromPolylines(
            routePathLinks.map(rpLink => rpLink.geometry)
        );
        return coherentPolylines.map((polyline, index) => (
            <ArrowDecorator
                key={index}
                color={ROUTE_COLOR}
                geometry={polyline}
            />
        ));
    };

    render() {
        return (
            <>
                {this.renderRoutePathLinks()}
                {this.renderLinkDecorator()}
            </>
        );
    }
}

export default EditRoutePathLayer;
