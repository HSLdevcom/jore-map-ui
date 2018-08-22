import gql from 'graphql-tag';
import apolloClient from '../util/ApolloClient';
import { ApolloQueryResult } from 'apollo-client';
import RouteFactory from '../factories/routeFactory';
import LineStore from '../stores/lineStore';
import NotificationType from '../enums/notificationType';
import NotificationStore from '../stores/notificationStore';

export default class RouteService {
    public static getRoute(lineId: string, routeId: string) {
        return new Promise((resolve: (res: any) => void, reject: (err: any) => void) => {
            apolloClient.query({ query: getRoute, variables: { routeId } })
                .then((res: ApolloQueryResult<any>) => {
                    const line = LineStore.lineByLineId(lineId);
                    resolve(RouteFactory.createRoute(res.data.route, line));
                })
                .catch((err: any) => {
                    NotificationStore.addNotification(
                        { message: 'Reitin haku ei onnistunut.', type: NotificationType.ERROR },
                    );
                    reject(err);
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
