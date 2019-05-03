import React from 'react';
import { inject, observer } from 'mobx-react';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import Moment from 'moment';
import RoutePathLinkService from '~/services/routePathLinkService';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import {
    RoutePathCopySegmentStore, ICopySegmentRoutePath,
} from '~/stores/routePathCopySegmentStore';
import { AlertStore, AlertType } from '~/stores/alertStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { IRoutePathLink } from '~/models';
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

    private renderRoutePathRow = (routePath: ICopySegmentRoutePath, key: string) => {
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
                        title={`Kopioi reitin ${routePath.routeId} reitin suunnan segmentti`}
                        onClick={this.copySegments(routePath)}
                    >
                        <FiCopy />
                    </div>
                    <div
                        className={s.icon}
                        title={`Avaa reitin ${routePath.routeId} reitin suunta uuteen ikkunaan`}
                        onClick={this.openRoutePathInNewTab(routePath)}
                    >
                        <FiExternalLink />
                    </div>
                </div>
            </div>
        );
    }

    private setHighlightedRoutePath = (routePath: ICopySegmentRoutePath|null) => () => {
        this.props.routePathCopySegmentStore!.setHighlightedRoutePath(routePath);
    }

    private renderTextRow = (routePath: ICopySegmentRoutePath) => {
        return (
            <div>
                <div>{routePath.routeId} {routePath.originFi} - {routePath.destinationFi}</div>
                <div className={s.timestampRow}>
                    {Moment(routePath.startTime).format('DD.MM.YYYY')} -{' '}
                    {Moment(routePath.endTime).format('DD.MM.YYYY')}
                </div>
            </div>
        );
    }

    private copySegments = (routePath: ICopySegmentRoutePath) => async () => {
        this.props.alertStore!.setLoaderMessage('Kopioidaan reitinsuunnan segmenttiä...');

        const copySegmentStore = this.props.routePathCopySegmentStore;
        const copyStartNodeId = copySegmentStore!.startNode!.nodeId;
        const copyEndNodeId = copySegmentStore!.endNode!.nodeId;
        const segmentsToCopy = copySegmentStore!
            .getSegmentLinksToCopy(routePath, copyStartNodeId, copyEndNodeId);
        segmentsToCopy.sort((a, b) => a.orderNumber < b.orderNumber ? -1 : 1);

        const isNaturalDirection = this.props.routePathStore!
            .hasNodeOddAmountOfNeighbors(copyStartNodeId);

        const isOppositeDirection = this.props.routePathStore!
            .hasNodeOddAmountOfNeighbors(copyEndNodeId);

        if (isNaturalDirection) {
            // orderNumbers start from 1
            let orderNumber = this.props.routePathStore!.routePath!.routePathLinks!
            .find(link => link.endNode.id === copyStartNodeId)!.orderNumber + 1;
            for (let i = 0; i < segmentsToCopy.length; i += 1) {
                await this.copySegment(segmentsToCopy[i].routePathLinkId, orderNumber);
                orderNumber += 1;
            }
        } else if (isOppositeDirection) {
            const orderNumber = this.props.routePathStore!.routePath!.routePathLinks!
                .find(link => link.startNode.id === copyEndNodeId)!.orderNumber;
            for (let i = segmentsToCopy.length - 1; i >= 0; i -= 1) {
                await this.copySegment(segmentsToCopy[i].routePathLinkId, orderNumber);
            }
        } else {
            // Should not occur
            throw 'Node with odd neighbors not found from current routePath by startNodeId or endNodeId.'; // tslint:disable-line max-line-length
        }

        this.props.routePathCopySegmentStore!.clear();
        this.props.toolbarStore!.selectTool(null);

        this.props.alertStore!.closeLoaderMessage();
        this.props.alertStore!.setFadeMessage('Segmentti kopioitu!', AlertType.Success);
    }

    private copySegment = async (routePathLinkId: number, fixedOrderNumber: number) => {
        const routePathLink: IRoutePathLink = await RoutePathLinkService
            .fetchRoutePathLink(routePathLinkId);
        routePathLink.orderNumber = fixedOrderNumber;

        this.props.routePathStore!.addLink(routePathLink);
    }

    private openRoutePathInNewTab = (routePath: ICopySegmentRoutePath) => () => {
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

    private renderErrorMessage = () => {
        return (
            <div className={s.routePathList}>
                <div className={s.messageContainer}>
                    Virhe alku- ja loppusolmun asetuksessa.
                </div>
            </div>
        );
    }

    private renderResults = () => {
        const routePaths = this.props.routePathCopySegmentStore!.routePaths;
        return (
            <div className={s.routePathList}>
                { routePaths.length === 0 ? (
                    <div className={s.messageContainer}>
                        Kopioitavia reitinsuunnan segmenttejä ei löytynyt valitulta väliltä.
                        Kokeile asettaa pienempi kopioitava väli.
                    </div>
                ) : (
                    <>
                    { routePaths.map((routePath, index) => {
                        return this.renderRoutePathRow(
                            routePath, `row-${index}-${routePath.routeId}`);
                    })
                    }
                    </>
                )}
        </div>
        );
    }

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
                <div className={s.topic}>
                    Kopioitavat reitinsuuntasegmentit
                </div>
                {{
                    hasError: this.renderErrorMessage(),
                    isLoading:
                    <div className={s.loaderContainer}>
                        <Loader size={LoaderSize.SMALL} />
                    </div>,
                    showResults: this.renderResults(),
                }[state]}
            </div>
        );
    }

}

export default RoutePathCopySegmentView;
