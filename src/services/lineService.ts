import gql from 'graphql-tag';
import apolloClient from '../util/ApolloClient';
import LineFactory from '../factories/lineFactory';

export default class LineService {
    public static async getAllLines() {
        try {
            const { data }:any = await apolloClient.query({ query: getLinjas });
            return LineFactory.linjasToILines(data.allLinjas.nodes);
        } catch (err) {
            return err;
        }
    }
}

const getLinjas = gql`
{
  allLinjas {
    nodes {
      lintunnus
      linjoukkollaji
      linverkko
      reittisByLintunnus(first: 1, orderBy: REIVIIMPVM_DESC) {
        edges {
          node {
            reinimi
            reiviimpvm
          }
        }
      }
    }
  }
}
`;
