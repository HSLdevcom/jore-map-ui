import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import RouteFactory from '~/factories/routeFactory';
import { IRoute, INode } from '~/models';
import IExternalRoute from '~/models/externals/IExternalRoute';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import LineService from './lineService';

export interface IMultipleRoutesQueryResult {
    routes: IRoute[];
    nodes: INode[];
}

export default class RouteService {
    // TODO: refactor undefined to null?
    public static async fetchRoute(routeId: string): Promise<IRoute | undefined> {
        const route = await RouteService.runFetchRouteQuery(routeId);
        return route ? route : undefined;
    }

    public static async fetchMultipleRoutes(routeIds: string[]):
        Promise<IRoute[] | null> {
        const routes = await Promise
            .all(routeIds.map(id => RouteService.runFetchRouteQuery(id)));

        if (!routes) return null;

        return routes.map((res: IRoute) => res!);
    }

    private static async runFetchRouteQuery(routeId: string): Promise<IRoute | null> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getRouteQuery, variables: { routeId } },
            );
            const line = await LineService.fetchLine(queryResult.data.route.lintunnus);
            if (line !== null) {
                const externalRoute = this.getExternalRoute(queryResult.data.route);
                return RouteFactory.createRoute(externalRoute, line);
            }
            return null;
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: 'Reitin haku ei onnistunut.',
                type: NotificationType.ERROR,
            });
            return null;
        }
    }

    /**
     * Converts Apollo's queryResult into:
     * @return {IExternalRoute} externalRoute
     * @return {IExternalRoutePath[]} externalRoute.externalRoutePaths
     * @return {IExternalRoutePathLink[]} externalRoutePaths.externalRoutePathLinks
     * @return {IExternalRoutePathLinkNode} externalRoutePathLinks.startNode
     * @return {IExternalRoutePathLinkNode} externalRoutePathLinks.endNode
     */
    private static getExternalRoute(route: any): IExternalRoute {
        if (route.reitinsuuntasByReitunnus) {
            route.externalRoutePaths = route.reitinsuuntasByReitunnus.nodes;
            delete route.reitinsuuntasByReitunnus;

            route.externalRoutePaths.forEach((externalRoutePath: any) => {
                externalRoutePath.externalRoutePathLinks
                    = externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.nodes;
                delete externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta;

                externalRoutePath.externalRoutePathLinks.forEach((externalRoutePathLink: any) => {
                    externalRoutePathLink.geojson = externalRoutePathLink
                        .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu.geojson;
                    externalRoutePathLink.startNode = externalRoutePathLink
                        .solmuByLnkalkusolmu;
                    externalRoutePathLink.endNode = externalRoutePathLink
                        .solmuByLnkloppusolmu;

                    externalRoutePathLink.startNode.externalStop
                        = externalRoutePathLink.startNode.pysakkiBySoltunnus;

                    externalRoutePathLink.endNode.externalStop
                        = externalRoutePathLink.endNode.pysakkiBySoltunnus;

                    delete externalRoutePathLink
                        .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu;
                    delete externalRoutePathLink
                        .solmuByLnkalkusolmu;
                    delete externalRoutePathLink
                        .solmuByLnkloppusolmu;
                });

                externalRoutePath.externalRoutePathLinks.sort(
                    (a: IExternalRoutePathLink, b: IExternalRoutePathLink) => {
                        return a.reljarjnro - b.reljarjnro;
                    });
            });
        }

        return route;
    }
}

const getRouteQuery = gql`
query getLineDetails($routeId: String!) {
    route: reittiByReitunnus(reitunnus: $routeId) {
        reitunnus
        reinimi
        reinimilyh
        reinimir
        reinimilyhr
        lintunnus
        reikuka
        reiviimpvm
        reitinsuuntasByReitunnus{
            nodes {
                suusuunta
                suunimi
                suuvoimast
                suuviimpvm
                suuvoimviimpvm
                suulahpaik
                suupaapaik
                geojson
                reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta {
                    nodes {
                        relid
                        lnkalkusolmu
                        lnkloppusolmu
                        relpysakki
                        reljarjnro
                        lnkverkko
                        ajantaspys
                        solmuByLnkalkusolmu {
                            solx,
                            soly,
                            soltunnus,
                            soltyyppi,
                            geojson,
                            geojsonManual,
                            pysakkiBySoltunnus {
                                pyssade,
                                pysnimi,
                                pysnimir
                            }
                        }
                        solmuByLnkloppusolmu {
                            solx,
                            soly,
                            soltunnus,
                            soltyyppi,
                            geojson,
                            geojsonManual,
                            pysakkiBySoltunnus {
                                pyssade,
                                pysnimi,
                                pysnimir
                            }
                        }
                        linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu {
                            geojson
                        }
                    }
                }
            }
        }
    }
}
`;
