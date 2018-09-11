import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '../util/ApolloClient';
import RouteFactory from '../factories/routeFactory';
import LineService from './lineService';
import NotificationType from '../enums/notificationType';
import NotificationStore from '../stores/notificationStore';
import { IRoute, INode } from '../models';
import NodeFactory from '../factories/nodeFactory';

export interface IMultipleRoutesQueryResult {
    routes: IRoute[];
    nodes: INode[];
}

export interface IRouteQueryResult {
    route: IRoute;
    nodes: INode[];
}

export default class RouteService {
    public static async runFetchRouteQuery(routeId: string) : Promise<IRouteQueryResult | null> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getRouteQuery, variables: { routeId } },
                );
            const line = await LineService.getLine(queryResult.data.route.lintunnus);
            const route = RouteFactory.createRoute(queryResult.data.route, line);
            const nodes = NodeFactory.parseNodes(queryResult);
            return {
                route,
                nodes,
            };
        } catch (err) {
            NotificationStore.addNotification({
                message: 'Reitin haku ei onnistunut.',
                type: NotificationType.ERROR,
            });
            return null;
        }
    }

    public static async fetchRoute(routeId: string): Promise<IRoute | null> {
        const queryResult = await RouteService.runFetchRouteQuery(routeId);
        return queryResult !== null ? queryResult.route : null;
    }

    public static async fetchMultipleRoutes(routeIds: string[]):
        Promise<IMultipleRoutesQueryResult> {
        return new Promise<IMultipleRoutesQueryResult>((resolve, reject) => {
            Promise
                .all(routeIds.map(id => RouteService.runFetchRouteQuery(id)))
                .then((queryResults) => {
                    resolve({
                        routes: queryResults
                            .filter(res => res !== null)
                            .map((res: IRouteQueryResult) => res.route),
                        nodes: [],
                    });
                });
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
                                    soltyyppi
                                }
                                solmuByLnkloppusolmu {
                                    solx,
                                    soly,
                                    soltunnus,
                                    soltyyppi
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
