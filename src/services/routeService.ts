import gql from 'graphql-tag';
import apolloClient from '../util/ApolloClient';
import { ApolloQueryResult } from 'apollo-client';
import RouteFactory from '../factories/routeFactory';
import LineStore from '../stores/lineStore';

export default class RouteService {
    public static getRoute(lineId: string) {
        return new Promise((resolve: (res: any) => void, reject: (err: any) => void) => {
            apolloClient.query({ query: getRoute, variables: { routeId: lineId } })
                .then((res: ApolloQueryResult<any>) => {
                    const line = LineStore.lineByLineId(lineId);
                    resolve(RouteFactory.createRoute(res.data.route, line));
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }
}

const getRoute = gql`
query getLineDetails($routeId: String!) {
    route: reittiByReitunnus(reitunnus: $routeId) {
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
