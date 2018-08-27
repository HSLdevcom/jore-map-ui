import gql from 'graphql-tag';
import apolloClient from '../util/ApolloClient';
import LineFactory from '../factories/lineFactory';

export default class LineService {
    public static async getAllLines() {
        try {
            const { data }:any = await apolloClient.query({ query: getLinjas });
            const routes = LineFactory.linjasToILines(data.allLinjas.nodes);
            return routes;
        } catch (err) {
            return err;
        }
    }

    public static async getLine(lintunnus: string) {
        try {
            const { data }:any = await apolloClient
                .query({ query: getLinja, variables: { lineId: lintunnus } });
            return LineFactory.createLine(data.linjaByLintunnus);
        } catch (err) {
            return err;
        }
    }
}

const getLinja = gql`
query getLineByLintunnus ($lineId: String!) {
    linjaByLintunnus(lintunnus:$lineId) {
        lintunnus
        linjoukkollaji
        linverkko
        reittisByLintunnus(first: 1, orderBy: REIVIIMPVM_DESC) {
            nodes {
                reinimi
                reiviimpvm
            }
        }
    }
}
`;

const getLinjas = gql`
{
    allLinjas {
        nodes {
            lintunnus
            linjoukkollaji
            linverkko
            reittisByLintunnus(first: 1, orderBy: REIVIIMPVM_DESC) {
                nodes {
                    reinimi
                    reiviimpvm
                }
            }
        }
    }
}
`;
