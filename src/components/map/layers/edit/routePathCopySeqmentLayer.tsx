import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Polyline } from 'react-leaflet';
import {
    RoutePathCopySeqmentStore,
    ICopySeqmentLink,
} from '~/stores/routePathCopySeqmentStore';
import Marker from '../markers/Marker';

interface IRoutePathCopySeqmentLayerProps {
    routePathCopySeqmentStore?: RoutePathCopySeqmentStore;
}

const START_MARKER_COLOR = '#4286f4';
const END_MARKER_COLOR = '#4286f4';
const HIGHLIGHTED_LINK_TO_COPY = '#00df0b';
const HIGHLIGHTED_LINK_NOT_TO_COPY = '#f7e200';

@inject('routePathCopySeqmentStore')
@observer
class RoutePathCopySeqmentLayer extends Component<IRoutePathCopySeqmentLayerProps> {

    private renderHighlightedRoutePath = () => {
        const copySeqmentStore = this.props.routePathCopySeqmentStore;
        const startNode = copySeqmentStore!.startNode;
        const endNode = copySeqmentStore!.endNode;

        const highlightedRoutePath = copySeqmentStore!.highlightedRoutePath;
        if (!highlightedRoutePath || !startNode || !endNode) return null;

        const startNodeId = startNode.nodeId;
        const endNodeId = endNode.nodeId;
        const seqmentsToCopy = copySeqmentStore!
            .getSegmentLinksToCopy(highlightedRoutePath, startNodeId, endNodeId);
        const seqmentsNotToCopy = copySeqmentStore!
            .getSegmentLinksNotToCopy(highlightedRoutePath, startNodeId, endNodeId);
        return (
            <>
                {seqmentsToCopy.map(this.renderCopySeqmentLink(HIGHLIGHTED_LINK_TO_COPY))}
                {seqmentsNotToCopy.map(this.renderCopySeqmentLink(HIGHLIGHTED_LINK_NOT_TO_COPY))}
            </>
        );
    }

    private renderCopySeqmentLink = (color: string) => (link: ICopySeqmentLink) => {
        return (
            <Polyline
                positions={link.geometry}
                key={link.orderNumber}
                color={color}
                weight={8}
                opacity={0.5}
            />
        );
    }

    render() {
        const startNode = this.props.routePathCopySeqmentStore!.startNode;
        const endNode = this.props.routePathCopySeqmentStore!.endNode;

        return (
            <>
                { startNode &&
                    <Marker
                        latLng={startNode!.geometry}
                        color={START_MARKER_COLOR}
                    />
                }
                { endNode &&
                    <Marker
                        latLng={endNode!.geometry}
                        color={END_MARKER_COLOR}
                    />
                }
                {this.renderHighlightedRoutePath()}
            </>
        );
    }
}

export default RoutePathCopySeqmentLayer;
