import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import RouteFactory, { IRouteResult } from '~/factories/routeFactory';
import { IRoute, INode } from '~/models';
import IExternalRoute from '~/models/externals/IExternalRoute';
import QueryParsingHelper from '~/factories/queryParsingHelper';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import LineService from './lineService';

export interface IMultipleRoutesQueryResult {
    routes: IRoute[];
    nodes: INode[];
}

export default class RouteService {
    public static async fetchRoute(routeId: string): Promise<IRoute | undefined> {
        const routeResult = await RouteService.runFetchRouteQuery(routeId);
        return routeResult ? routeResult.route : undefined;
    }

    public static async fetchMultipleRoutes(routeIds: string[]):
        Promise<IMultipleRoutesQueryResult | null> {
        let queryResult = await Promise
            .all(routeIds.map(id => RouteService.runFetchRouteQuery(id)));
        queryResult = queryResult.filter(res => res && res.route);
        if (!queryResult) return null;
        return({
            routes: queryResult
                .map((res: IRouteResult) => res.route!),
            nodes: QueryParsingHelper.removeINodeDuplicates(
                queryResult
                    .reduce<INode[]>(
                        (flatList, node) => flatList.concat(node!.nodes),
                        [],
                    )),
        });
    }

    private static async runFetchRouteQuery(routeId: string): Promise<IRouteResult | null> {
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
        } catch (err) {
            console.log(err); // tslint:disable-line
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

            const externalRoutePaths = route.externalRoutePaths
            .map((externalRoutePath: any) => {

                externalRoutePath.externalRoutePathLinks =
                externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.nodes
                .map((externalRoutePathLink: any) => {
                    externalRoutePathLink.geojson = externalRoutePathLink
                        .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu.geojson;
                    externalRoutePathLink.startNode = externalRoutePathLink
                        .solmuByLnkalkusolmu;
                    externalRoutePathLink.endNode = externalRoutePathLink
                        .solmuByLnkloppusolmu;

                    delete externalRoutePathLink
                        .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu;
                    delete externalRoutePathLink
                        .solmuByLnkalkusolmu;
                    delete externalRoutePathLink
                        .solmuByLnkloppusolmu;

                    return externalRoutePathLink;
                });

                delete externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta;

                return externalRoutePath;
            });
            route.externalRoutePaths = externalRoutePaths;
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
