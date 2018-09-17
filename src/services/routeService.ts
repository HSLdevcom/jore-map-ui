import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '../util/ApolloClient';
import RouteFactory, { IRouteResult } from '../factories/routeFactory';
import LineService from './lineService';
import { IRoute, INode } from '../models';
import QueryParsingHelper from '../factories/queryParsingHelper';

export interface IMultipleRoutesQueryResult {
    routes: IRoute[];
    nodes: INode[];
}

export default class RouteService {
    public static async runFetchRouteQuery(routeId: string): Promise<IRouteResult | null> {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: getRouteQuery, variables: { routeId } },
        );
        const line = await LineService.getLine(queryResult.data.route.lintunnus);
        if (line !== null) {
            return RouteFactory.createRoute(queryResult.data.route, line);
        }
        return null;
    }

    public static async fetchRoute(routeId: string): Promise<IRoute | undefined> {
        const routeResult = await RouteService.runFetchRouteQuery(routeId);
        if (routeResult !== null) {
            return routeResult.route;
        }
        return undefined;
    }

    public static async fetchMultipleRoutes(routeIds: string[]):
        Promise<IMultipleRoutesQueryResult> {
        const queryResults = await Promise
            .all(routeIds.map(id => RouteService.runFetchRouteQuery(id)));
        const nonNullRoutes = queryResults.filter(res => res && res.route);
        return({
            routes: nonNullRoutes
                .map((res: IRouteResult) => res.route!),
            nodes: QueryParsingHelper.removeINodeDuplicates(
                nonNullRoutes
                    .reduce<INode[]>(
                        (flatList, node) => flatList.concat(node!.nodes),
                        [],
                    )),
        });
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
                                    geojson
                                }
                                solmuByLnkloppusolmu {
                                    solx,
                                    soly,
                                    soltunnus,
                                    soltyyppi,
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
