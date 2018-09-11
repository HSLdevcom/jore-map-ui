import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '../util/ApolloClient';
import RouteFactory from '../factories/routeFactory';
import LineService from './lineService';
import NotificationType from '../enums/notificationType';
import NotificationStore from '../stores/notificationStore';
import { IRoute, INode } from '../models';

export interface IRouteServiceResult {
    routes: IRoute[];
    nodes: INode[];
}

export interface IRouteResult {
    route: IRoute;
    nodes: INode[];
}

export default class RouteService {
    public static async getRoute(routeId: string) {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getRoute, variables: { routeId } },
                );
            const line = await LineService.getLine(queryResult.data.route.lintunnus);
            return RouteFactory.createRoute(queryResult.data.route, line);
        } catch (err) {
            NotificationStore.addNotification(
            { message: 'Reitin haku ei onnistunut.', type: NotificationType.ERROR },
            );
            return err;
        }
    }

    public static async getRouteData(routeId: string): Promise<IRouteResult> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getRoute, variables: { routeId } },
                );
            const line = await LineService.getLine(queryResult.data.route.lintunnus);
            return {
                route: RouteFactory.createRoute(queryResult.data.route, line),
                nodes: [],
            };
        } catch (err) {
            NotificationStore.addNotification(
            { message: 'Reitin haku ei onnistunut.', type: NotificationType.ERROR },
            );
            return err;
        }
    }

    public static async getRoutesData(routeIds: string[]): Promise<IRouteServiceResult> {
        return new Promise<IRouteServiceResult>((resolve, reject) => {
            Promise
                .all(routeIds.map(id => RouteService.getRouteData(id)))
                .then((routeResults: IRouteResult[]) => {
                    resolve({
                        routes: routeResults.map(res => res.route),
                        nodes: [],
                    });
                });
        });
    }
}

const getRoute = gql`
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
