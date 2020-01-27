import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import IRoutePathLink from '~/models/IRoutePathLink';
import { MapFilter, MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { createCoherentLinesFromPolylines } from '~/utils/geomHelpers';
import ArrowDecorator from '../utils/ArrowDecorator';
import DashedLine from '../utils/DashedLine';

const ROUTE_COLOR = '#000';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
    highlightItemById: (id: string) => void;
}

@inject('routePathStore', 'toolbarStore', 'mapStore', 'routePathCopySegmentStore')
@observer
class EditRoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderRoutePathLinks = () => {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks || routePathLinks.length < 1) return;

        return routePathLinks.map((rpLink, index) => {
            return (
                <div key={index}>
                    {this.renderLink(rpLink)}
                    {this.renderDashedLines(rpLink)}
                </div>
            );
        });
    };

    private renderLink = (routePathLink: IRoutePathLink) => {
        const onRoutePathLinkClick =
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick
                ? this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick!(routePathLink.id)
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
            this.props.routePathStore!.listHighlightedNodeIds.includes(routePathLink.id) && (
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
            />
        ];
    };

    private renderLinkDecorator = () => {
        if (!this.props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)) {
            return null;
        }

        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        const coherentPolylines = createCoherentLinesFromPolylines(
            routePathLinks.map(rpLink => rpLink.geometry)
        );
        return coherentPolylines.map((polyline, index) => (
            <ArrowDecorator key={index} color={ROUTE_COLOR} geometry={polyline} />
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
