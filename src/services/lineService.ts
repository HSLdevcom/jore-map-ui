import gql from 'graphql-tag';
import apolloClient from '../util/ApolloClient';
import LineFactory from '../factories/lineFactory';
import { ApolloQueryResult } from 'apollo-client';
import { ILine } from '../models';
import NotificationStore from '../stores/notificationStore';

export default class LineService {
    public static getAllLines() {
        return new Promise((resolve: (res: ILine[]) => void, reject: (err: any) => void) => {
            apolloClient.query({ query: getLinjas })
                .then((res: ApolloQueryResult<any>) => {
                    resolve(
                        LineFactory.linjasToILines(res.data.allLinjas.nodes),
                    );
                })
                .catch((err: any) => {
                    NotificationStore.addNotification(
                        { message: 'Linjan haku ei onnistunut.', type: 'error' },
                    );
                    reject(err);
                });
        });
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
