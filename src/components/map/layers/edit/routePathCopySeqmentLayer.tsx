import React, { Component } from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { inject, observer } from 'mobx-react';
import { Polyline } from 'react-leaflet';
import Moment from 'moment';
import {
    RoutePathCopySeqmentStore,
    ICopySeqmentRoutePath,
    ICopySeqmentLink,
} from '~/stores/routePathCopySeqmentStore';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import StartMarker from '../mapIcons/StartMarker';
import * as s from './routePathCopySeqmentLayer.scss';

interface IRoutePathCopySeqmentLayerProps {
    routePathCopySeqmentStore?: RoutePathCopySeqmentStore;
}

interface IRoutePathCopySeqmentLayerState {
    highlightedRoutePath: ICopySeqmentRoutePath|null;
}

const START_MARKER_COLOR = '#4286f4';
const END_MARKER_COLOR = '#4286f4';
const HIGHLIGHTED_LINK_TO_COPY = '#00df0b';
const HIGHLIGHTED_LINK_NOT_TO_COPY = '#f7e200';

@inject('routePathCopySeqmentStore')
@observer
class RoutePathCopySeqmentLayer extends Component
    <IRoutePathCopySeqmentLayerProps, IRoutePathCopySeqmentLayerState> {
    constructor(props: IRoutePathCopySeqmentLayerProps) {
        super(props);
        this.state = {
            highlightedRoutePath: null,
        };
    }

    private renderEndMarkerPopupContent = () => {
        const routePaths = this.props.routePathCopySeqmentStore!.routePaths;
        const isLoading = this.props.routePathCopySeqmentStore!.isLoading;
        const topicHtml = (
            <div className={s.topic}>
                Kopioitavat reitinsuunnat
            </div>
        );
        if (!isLoading && routePaths.length === 0) {
            return (
                <div className={s.popupContent}>
                    {topicHtml}
                    <div>Kopioitavia reitinsuunnan segmenttejä valitulta väliltä ei
                        löytynyt. Kokeile asettaa pienempi kopioitava väli.</div>
                </div>
            );
        }
        return (
            <div className={s.popupContent}>
                {topicHtml}
                { isLoading ? (
                    <div className={s.loaderContainer}>
                        <Loader size={LoaderSize.SMALL} />
                    </div>
                ) : (
                    <div className={s.routePathList}>
                        { routePaths.map((routePath, index) => {
                            return this.renderRoutePathRow(routePath, `row-${index}`);
                        })
                        }
                    </div>
                )
                }
            </div>
        );
    }

    private renderRoutePathRow = (routePath: ICopySeqmentRoutePath, key: string) => {
        return (
            <div
                key={key}
                className={s.routePathRow}
                onMouseEnter={this.setHighlightedRoutePath(routePath)}
                onMouseLeave={this.unsetHighlightedRoutePath()}
            >
                {routePath.routeId}
                <div className={s.icons}>
                    <div
                        className={s.icon}
                        title={`Kopioi reitin ${routePath.routeId} reitin suunnan segmentti`}
                        onClick={this.copySeqment(routePath)}
                    >
                        <FiCopy />
                    </div>
                    <div
                        className={s.icon}
                        title={`Avaa reitin ${routePath.routeId} reitin  suunta uuteen ikkunaan`}
                        onClick={this.openRoutePathInNewTab(routePath)}
                    >
                        <FiExternalLink />
                    </div>
                </div>
            </div>
        );
    }

    private setHighlightedRoutePath = (routePath: ICopySeqmentRoutePath) => () => {
        this.setState({
            highlightedRoutePath: routePath,
        });
    }

    private unsetHighlightedRoutePath = () => () => {
        this.setState({
            highlightedRoutePath: null,
        });
    }

    private copySeqment = (routePath: ICopySeqmentRoutePath) => () => {
        const startNodeId = this.props.routePathCopySeqmentStore!.startNode!.nodeId;
        const endNodeId = this.props.routePathCopySeqmentStore!.endNode!.nodeId;
        const seqmentsToCopy = _getLinksToCopy(routePath, startNodeId, endNodeId);
        console.log('seqmentsToCopy ', seqmentsToCopy);
    }

    private openRoutePathInNewTab = (routePath: ICopySeqmentRoutePath) => () => {
        const routePathLink = routeBuilder
        .to(SubSites.routePath)
        .toTarget([
                routePath.routeId,
                Moment(routePath.startTime).format('YYYY-MM-DDTHH:mm:ss'),
                routePath.direction,
        ].join(','))
        .toLink();
        window.open(routePathLink, '_blank');
    }

    private renderHighlightedRoutePath = () => {
        const highlightedRoutePath = this.state.highlightedRoutePath;
        if (!highlightedRoutePath) return null;

        const startNodeId = this.props.routePathCopySeqmentStore!.startNode!.nodeId;
        const endNodeId = this.props.routePathCopySeqmentStore!.endNode!.nodeId;
        const seqmentsToCopy = _getLinksToCopy(highlightedRoutePath, startNodeId, endNodeId);
        const seqmentsNotToCopy = _getLinksNotToCopy(highlightedRoutePath, startNodeId, endNodeId);
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
                weight={5}
                opacity={1}
            />
        );
    }

    render() {
        const startNode = this.props.routePathCopySeqmentStore!.startNode;
        const endNode = this.props.routePathCopySeqmentStore!.endNode;
        return (
            <>
                { startNode &&
                    <StartMarker
                        latLng={startNode!.geometry}
                        color={START_MARKER_COLOR}
                    />
                }
                { endNode &&
                    <StartMarker
                        latLng={endNode!.geometry}
                        color={END_MARKER_COLOR}
                        popupContent={this.renderEndMarkerPopupContent()}
                    />
                }
                {this.renderHighlightedRoutePath()}
            </>
        );
    }
}

const _getLinksToCopy = (
    routePath: ICopySeqmentRoutePath, startNodeId: string, endNodeId: string,
) => {
    const startLinkOrderNumber = _getStartLinkOrderNumber(routePath.links, startNodeId);
    const endLinkOrderNumber = _getEndLinkOrderNumber(routePath.links, endNodeId);

    return routePath.links.filter((link: ICopySeqmentLink) => {
        return link.orderNumber >= startLinkOrderNumber
            && link.orderNumber <= endLinkOrderNumber;
    });
};

const _getLinksNotToCopy = (
    routePath: ICopySeqmentRoutePath, startNodeId: string, endNodeId: string,
) => {
    const startLinkOrderNumber = _getStartLinkOrderNumber(routePath.links, startNodeId);
    const endLinkOrderNumber = _getEndLinkOrderNumber(routePath.links, endNodeId);

    return routePath.links.filter((link: ICopySeqmentLink) => {
        return link.orderNumber < startLinkOrderNumber
            || link.orderNumber > endLinkOrderNumber;
    });
};

const _getStartLinkOrderNumber = (links: ICopySeqmentLink[], startNodeId: string) => {
    return links
        .find((link: ICopySeqmentLink) => link.startNodeId === startNodeId)!
        .orderNumber;
};

const _getEndLinkOrderNumber = (links: ICopySeqmentLink[], endNodeId: string) => {
    return links
        .find((link: ICopySeqmentLink) => link.endNodeId === endNodeId)!
        .orderNumber;
};

export default RoutePathCopySeqmentLayer;
