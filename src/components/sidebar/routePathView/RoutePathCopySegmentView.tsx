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
import { DialogStore, DialogType } from '~/stores/dialogStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { IRoutePathLink } from '~/models';
import * as s from './routePathCopySegmentView.scss';

interface IRoutePathCopySegmentViewProps {
    dialogStore?: DialogStore;
    routePathStore?: RoutePathStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
}

@inject('dialogStore', 'routePathStore', 'routePathCopySegmentStore', 'toolbarStore')
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
        this.props.dialogStore!.setLoaderMessage('Kopioidaan reitinsuunnan segmenttiä...');

        const copySegmentStore = this.props.routePathCopySegmentStore;
        const startNodeId = copySegmentStore!.startNode!.nodeId;
        const endNodeId = copySegmentStore!.endNode!.nodeId;
        const segmentsToCopy = copySegmentStore!
            .getSegmentLinksToCopy(routePath, startNodeId, endNodeId);

        for (let i = 0; i < segmentsToCopy.length; i += 1) {
            await this.copySegment(segmentsToCopy[i].routePathLinkId);
        }
        this.props.routePathCopySegmentStore!.clear();
        this.props.toolbarStore!.selectTool(null);

        this.props.dialogStore!.closeLoaderMessage();
        this.props.dialogStore!.setFadeMessage('Segmentti kopioitu!', DialogType.Success);
    }

    private copySegment = async (routePathLinkId: number) => {
        const routePathLink: IRoutePathLink = await RoutePathLinkService
            .fetchRoutePathLink(routePathLinkId);
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

    render() {
        const routePaths = this.props.routePathCopySegmentStore!.routePaths;
        const isLoading = this.props.routePathCopySegmentStore!.isLoading;

        return (
            <div className={s.routePathCopySegmentView}>
                <div className={s.topic}>
                    Kopioitavat reitinsuuntasegmentit
                </div>
                { isLoading ? (
                    <div className={s.loaderContainer}>
                        <Loader size={LoaderSize.SMALL} />
                    </div>
                ) : (
                    <div className={s.routePathList}>
                        { routePaths.length === 0 ? (
                            <div className={s.noResultsContainer}>
                                Kopioitavia reitinsuunnan segmenttejä ei löytynyt valitulta väliltä.
                                Kokeile asettaa pienempi kopioitava väli.
                            </div>
                        ) : (
                            <>
                            { routePaths.map((routePath, index) => {
                                return this.renderRoutePathRow(
                                    routePath, `row-${index}-${routePath.routeId}'`);
                            })
                            }
                            </>
                        )}
                    </div>
                )
                }
            </div>
        );
    }

}

export default RoutePathCopySegmentView;
