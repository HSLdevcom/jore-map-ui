import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import Loader from '~/components/shared/loader/Loader';
import { IRoutePathSegment } from '~/models/IRoutePath';
import IRoutePathLink from '~/models/IRoutePathLink';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import RoutePathLinkService from '~/services/routePathLinkService';
import { AlertStore, AlertType } from '~/stores/alertStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import SidebarHeader from '../SidebarHeader';
import * as s from './routePathCopySegmentView.scss';

interface IRoutePathCopySegmentViewProps {
    alertStore?: AlertStore;
    routePathStore?: RoutePathStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
}

@inject('alertStore', 'routePathStore', 'routePathCopySegmentStore', 'toolbarStore')
@observer
class RoutePathCopySegmentView extends React.Component<IRoutePathCopySegmentViewProps> {
    private renderRoutePathRow = (routePath: IRoutePathSegment, key: string) => {
        return (
            <div
                key={key}
                className={s.routePathRow}
                onMouseEnter={this.setHighlightedRoutePath(routePath)}
                onMouseLeave={this.setHighlightedRoutePath(null)}
            >
                {this.renderTextRow(routePath)}
                <div className={s.icons}>
                    <div
                        className={s.icon}
                        title={`Kopioi reitin ${routePath.routeId} reitinsuunnan segmentti`}
                        onClick={this.copySegments(routePath)}
                        data-cy='copyRoutePathSegmentButton'
                    >
                        <FiCopy />
                    </div>
                    <div
                        className={s.icon}
                        title={`Avaa reitin ${routePath.routeId} reitinsuunta uuteen ikkunaan`}
                        onClick={this.openRoutePathInNewTab(routePath)}
                    >
                        <FiExternalLink />
                    </div>
                </div>
            </div>
        );
    };

    private setHighlightedRoutePath = (routePath: IRoutePathSegment | null) => () => {
        this.props.routePathCopySegmentStore!.setHighlightedRoutePath(routePath);
    };

    private renderTextRow = (routePath: IRoutePathSegment) => {
        return (
            <div>
                <div>
                    {routePath.routeId} {routePath.originFi} - {routePath.destinationFi}
                </div>
                <div className={s.timestampRow}>
                    {Moment(routePath.startDate).format('DD.MM.YYYY')} -{' '}
                    {Moment(routePath.endDate).format('DD.MM.YYYY')}
                </div>
            </div>
        );
    };

    private copySegments = (routePath: IRoutePathSegment) => async () => {
        const copySegmentStore = this.props.routePathCopySegmentStore;
        this.props.alertStore!.setLoaderMessage('Kopioidaan reitinsuunnan segmenttiä...');

        const startSegmentPoint = copySegmentStore!.startSegmentPoint;
        const endSegmentPoint = copySegmentStore!.endSegmentPoint;
        if (!startSegmentPoint || !endSegmentPoint) {
            throw 'Either start or end segment point was not set';
        }
        if (!startSegmentPoint.nodeInternalId && !endSegmentPoint.nodeInternalId) {
            throw 'Missing at least one nodeInternalId';
        }

        const segmentsToCopy = copySegmentStore!.getSegmentLinksToCopy(
            routePath,
            startSegmentPoint.nodeId,
            endSegmentPoint.nodeId
        );
        segmentsToCopy.sort((a, b) => (a.orderNumber < b.orderNumber ? -1 : 1));

        const isNaturalDirection =
            startSegmentPoint.nodeInternalId &&
            this.props.routePathStore!.hasNodeOddAmountOfNeighbors(
                startSegmentPoint.nodeInternalId
            );

        const isOppositeDirection =
            endSegmentPoint.nodeInternalId &&
            this.props.routePathStore!.hasNodeOddAmountOfNeighbors(endSegmentPoint.nodeInternalId);

        if (isNaturalDirection) {
            // orderNumbers start from 1
            let orderNumber =
                this.props.routePathStore!.routePath!.routePathLinks.find(
                    (link) => link.endNode.internalId === startSegmentPoint.nodeInternalId
                )!.orderNumber + 1;
            for (let i = 0; i < segmentsToCopy.length; i += 1) {
                await this.copySegment(segmentsToCopy[i].routePathLinkId, orderNumber);
                orderNumber += 1;
            }
        } else if (isOppositeDirection) {
            const orderNumber = this.props.routePathStore!.routePath!.routePathLinks.find(
                (link) => link.startNode.internalId === endSegmentPoint.nodeInternalId
            )!.orderNumber;
            for (let i = segmentsToCopy.length - 1; i >= 0; i -= 1) {
                await this.copySegment(segmentsToCopy[i].routePathLinkId, orderNumber);
            }
        } else {
            // Should not occur
            throw 'Node with odd neighbors not found from current routePath by startNodeId or endNodeId.';
        }

        this.props.routePathCopySegmentStore!.clear();
        this.props.toolbarStore!.selectTool(null);

        this.props.alertStore!.close();
        this.props.alertStore!.setFadeMessage({
            message: 'Segmentti kopioitu!',
            type: AlertType.Success,
        });
    };

    private copySegment = async (routePathLinkId: number, fixedOrderNumber: number) => {
        const routePathLink: IRoutePathLink = await RoutePathLinkService.fetchRoutePathLink(
            routePathLinkId
        );
        routePathLink.orderNumber = fixedOrderNumber;

        this.props.routePathStore!.addLink(routePathLink);
    };

    private openRoutePathInNewTab = (routePath: IRoutePathSegment) => () => {
        const routePathLink = routeBuilder
            .to(SubSites.routePath)
            .toTarget(
                ':id',
                [
                    routePath.routeId,
                    Moment(routePath.startDate).format('YYYY-MM-DDTHH:mm:ss'),
                    routePath.direction,
                ].join(',')
            )
            .toLink();
        window.open(routePathLink, '_blank');
    };

    private renderErrorMessage = () => {
        return (
            <div className={s.routePathList}>
                <div className={s.messageContainer}>Virhe alku- ja loppusolmun asetuksessa.</div>
            </div>
        );
    };

    private renderResults = () => {
        const routePaths = this.props.routePathCopySegmentStore!.routePaths;
        return (
            <div className={s.routePathList}>
                {routePaths.length === 0 ? (
                    <div className={s.messageContainer}>
                        Kopioitavia reitinsuunnan segmenttejä ei löytynyt valitulta alku- ja
                        loppusolmun väliltä. Kokeile muuttaa kopioitavaa väliä, esimerkiksi asettaa
                        pienempi kopioitava väli.
                    </div>
                ) : (
                    <>
                        {routePaths.map((routePath, index) => {
                            return this.renderRoutePathRow(
                                routePath,
                                `row-${index}-${routePath.routeId}`
                            );
                        })}
                    </>
                )}
            </div>
        );
    };
    private closeEditing = () => {
        this.props.routePathCopySegmentStore!.clear();
    };

    render() {
        const isLoading = this.props.routePathCopySegmentStore!.isLoading;
        const areNodePositionsValid = this.props.routePathCopySegmentStore!.areNodePositionsValid;
        let state;
        if (!areNodePositionsValid) {
            state = 'hasError';
        } else if (isLoading) {
            state = 'isLoading';
        } else {
            state = 'showResults';
        }

        return (
            <div className={s.routePathCopySegmentView}>
                <SidebarHeader
                    className={s.header}
                    onCloseButtonClick={this.closeEditing}
                    isCloseButtonVisible={true}
                    isBackButtonVisible={false}
                >
                    Kopioitavat reitinsuuntasegmentit
                </SidebarHeader>
                {
                    {
                        hasError: this.renderErrorMessage(),
                        isLoading: <Loader size='small' />,
                        showResults: this.renderResults(),
                    }[state]
                }
            </div>
        );
    }
}

export default RoutePathCopySegmentView;
