import gql from 'graphql-tag';
import apolloClient from '../util/ApolloClient';
import LineFactory from '../factories/lineFactory';
import NotificationType from '../enums/notificationType';
import NotificationStore from '../stores/notificationStore';
import { ILine } from '../models';

export default class LineService {
    public static async getAllLines(): Promise<ILine[] | null> {
        try {
            const { data }:any = await apolloClient.query({ query: getLinjas });
            return LineFactory.linjasToILines(data.allLinjas.nodes);
        } catch (err) {
            NotificationStore.addNotification(
                { message: 'Linjan haku ei onnistunut.', type: NotificationType.ERROR },
            );
            return null;
        }
    }

    public static async getLine(lintunnus: string): Promise<ILine | null> {
        try {
            const { data }:any = await apolloClient
                .query({ query: getLinja, variables: { lineId: lintunnus } });
            return LineFactory.createLine(data.linjaByLintunnus);
        } catch (err) {
            NotificationStore.addNotification(
                { message: 'Linjan haku ei onnistunut.', type: NotificationType.ERROR },
            );
            return null;
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
