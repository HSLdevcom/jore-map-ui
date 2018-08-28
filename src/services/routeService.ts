import gql from 'graphql-tag';
import apolloClient from '../util/ApolloClient';
import { ApolloQueryResult } from 'apollo-client';
import RouteFactory from '../factories/routeFactory';
import LineService from './lineService';
import NotificationType from '../enums/notificationType';
import NotificationStore from '../stores/notificationStore';

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

    public static async getRoutes(routeIds: string[]) {
        return Promise.all(routeIds.map(x => RouteService.getRoute(x)));
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
                        solmuByLnkalkusolmu {
                            geojson
                        pysakkiBySoltunnus {
                            pysnimi
                        }
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
