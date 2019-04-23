import React from 'react';
import {
    RoutePathCopySeqmentStore, ICopySeqmentRoutePath,
} from '~/stores/routePathCopySeqmentStore';
import { inject, observer } from 'mobx-react';
import Loader, { LoaderSize } from '~/components/shared/loader/Loader';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import Moment from 'moment';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import * as s from './routePathCopySeqmentView.scss';

interface IRoutePathCopySeqmentViewProps {
    routePathCopySeqmentStore?: RoutePathCopySeqmentStore;
}

@inject('routePathCopySeqmentStore')
@observer
class RoutePathCopySeqmentView extends React.Component<IRoutePathCopySeqmentViewProps> {

    private renderRoutePathRow = (routePath: ICopySeqmentRoutePath, key: string) => {
        return (
            <div
                key={key}
                className={s.routePathRow}
                onMouseEnter={this.setHighlightedRoutePath(routePath)}
                onMouseLeave={this.setHighlightedRoutePath(null)}
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

    private setHighlightedRoutePath = (routePath: ICopySeqmentRoutePath|null) => () => {
        this.props.routePathCopySeqmentStore!.setHighlightedRoutePath(routePath);
    }

    private copySeqment = (routePath: ICopySeqmentRoutePath) => () => {
        const copySeqmentStore = this.props.routePathCopySeqmentStore;
        const startNodeId = copySeqmentStore!.startNode!.nodeId;
        const endNodeId = copySeqmentStore!.endNode!.nodeId;
        const seqmentsToCopy = copySeqmentStore!.getLinksToCopy(routePath, startNodeId, endNodeId);
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

    render() {
        const routePaths = this.props.routePathCopySeqmentStore!.routePaths;
        const isLoading = this.props.routePathCopySeqmentStore!.isLoading;

        return (
            <div className={s.routePathCopySeqmentView}>
                <div className={s.topic}>
                    Kopioitavat reitinsuunnat
                </div>
                { isLoading ? (
                    <div className={s.loaderContainer}>
                        <Loader size={LoaderSize.SMALL} />
                    </div>
                ) : (
                    <div className={s.routePathList}>
                        { routePaths.length === 0 ? (
                            <div className={s.noResultsContainer}>
                                Kopioitavia reitinsuunnan segmenttejä valitulta väliltä ei
                                löytynyt. Kokeile asettaa pienempi kopioitava väli.
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

export default RoutePathCopySeqmentView;
