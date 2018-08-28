import gql from 'graphql-tag';
import apolloClient from '../util/ApolloClient';
import LineFactory from '../factories/lineFactory';
import NotificationType from '../enums/notificationType';
import NotificationStore from '../stores/notificationStore';

export default class LineService {
    public static async getAllLines() {
        try {
            const { data }:any = await apolloClient.query({ query: getLinjas });
            const routes = LineFactory.linjasToILines(data.allLinjas.nodes);
            return routes;
        } catch (err) {
            NotificationStore.addNotification(
                { message: 'Linjan haku ei onnistunut.', type: NotificationType.ERROR },
            );
            return err;
        }
    }

    public static async getLine(lintunnus: string) {
        try {
            const { data }:any = await apolloClient
                .query({ query: getLinja, variables: { lineId: lintunnus } });
            return LineFactory.createLine(data.linjaByLintunnus);
        } catch (err) {
            NotificationStore.addNotification(
                { message: 'Linjan haku ei onnistunut.', type: NotificationType.ERROR },
            );
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
            reittisByLintunnus(orderBy: REIVIIMPVM_DESC) {
                nodes {
                    reinimi
                    reitunnus
                    reiviimpvm
                }
            }
        }
    }
}
`;
