import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Polyline } from 'react-leaflet';
import { RoutePathCopySegmentStore, ICopySegmentLink } from '~/stores/routePathCopySegmentStore';
import Marker from '../markers/Marker';

interface IRoutePathCopySegmentLayerProps {
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
}

const START_MARKER_COLOR = '#00d4ff';
const END_MARKER_COLOR = '#ff96f4';
const HIGHLIGHTED_LINK_TO_COPY_COLOR = '#00df0b';
const HIGHLIGHTED_LINK_NOT_TO_COPY_COLOR = '#f7e200';

@inject('routePathCopySegmentStore')
@observer
class RoutePathCopySegmentLayer extends Component<IRoutePathCopySegmentLayerProps> {
    private renderHighlightedRoutePath = () => {
        const copySegmentStore = this.props.routePathCopySegmentStore;
        const startNode = copySegmentStore!.startNode;
        const endNode = copySegmentStore!.endNode;

        const highlightedRoutePath = copySegmentStore!.highlightedRoutePath;
        if (!highlightedRoutePath || !startNode || !endNode) return null;

        const startNodeId = startNode.nodeId;
        const endNodeId = endNode.nodeId;
        const segmentsToCopy = copySegmentStore!.getSegmentLinksToCopy(
            highlightedRoutePath,
            startNodeId,
            endNodeId
        );
        const segmentsNotToCopy = copySegmentStore!.getSegmentLinksNotToCopy(
            highlightedRoutePath,
            startNodeId,
            endNodeId
        );
        return (
            <>
                {segmentsToCopy.map(this.renderCopySegmentLink(HIGHLIGHTED_LINK_TO_COPY_COLOR))}
                {segmentsNotToCopy.map(
                    this.renderCopySegmentLink(HIGHLIGHTED_LINK_NOT_TO_COPY_COLOR)
                )}
            </>
        );
    };

    private renderCopySegmentLink = (color: string) => (link: ICopySegmentLink) => {
        return (
            <Polyline
                positions={link.geometry}
                key={link.orderNumber}
                color={color}
                weight={8}
                opacity={0.5}
            />
        );
    };

    render() {
        const startNode = this.props.routePathCopySegmentStore!.startNode;
        const endNode = this.props.routePathCopySegmentStore!.endNode;

        return (
            <>
                {startNode && (
                    <Marker
                        latLng={startNode!.geometry}
                        color={START_MARKER_COLOR}
                        isClickDisabled={true}
                    />
                )}
                {endNode && (
                    <Marker
                        latLng={endNode!.geometry}
                        color={END_MARKER_COLOR}
                        isClickDisabled={true}
                    />
                )}
                {this.renderHighlightedRoutePath()}
            </>
        );
    }
}

export default RoutePathCopySegmentLayer;
