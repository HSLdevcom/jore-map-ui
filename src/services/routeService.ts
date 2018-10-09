import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '../util/ApolloClient';
import RouteFactory, { IRouteResult } from '../factories/routeFactory';
import LineService from './lineService';
import { IRoute, INode } from '../models';
import QueryParsingHelper from '../factories/queryParsingHelper';
import notificationStore from '../stores/notificationStore';
import NotificationType from '../enums/notificationType';

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
            const line = await LineService.getLine(queryResult.data.route.lintunnus);
            if (line !== null) {
                return RouteFactory.createRoute(queryResult.data.route, line);
            }
            return null;
        } catch (err) {
            notificationStore.addNotification({
                message: 'Reitin haku ei onnistunut.',
                type: NotificationType.ERROR,
            });
            return null;
        }
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
            edges {
                node {
                    suusuunta
                    suunimi
                    suuvoimast
                    suuviimpvm
                    suuvoimviimpvm
                    suulahpaik
                    suulahpaikr
                    suupaapaikr
                    suupaapaik
                    geojson
                    reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta {
                        edges {
                            node {
                                relid
                                lnkalkusolmu
                                lnkloppusolmu
                                reljarjnro
                                lnkverkko
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
    }
}
`;
