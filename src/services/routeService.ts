import gql from 'graphql-tag';
import apolloClient from '../util/ApolloClient';
import { ApolloQueryResult } from 'apollo-client';
import RouteFactory from '../factories/routeFactory';
// import LineStore from '../stores/lineStore';
import LineService from './lineService';

export default class RouteService {
    public static async getRoute(lineId: string) {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getRoute, variables: { routeId: lineId } },
                );
            const line = await LineService.getLine(queryResult.data.route.lintunnus);
            return RouteFactory.createRoute(queryResult.data.route, line);
        } catch (err) {
            return err;
        }
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
