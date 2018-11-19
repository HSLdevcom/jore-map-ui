import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import LineFactory from '~/factories/lineFactory';
import NotificationType from '~/enums/notificationType';
import NotificationStore from '~/stores/notificationStore';
import { ILine } from '~/models';

export default class LineService {
    public static async fetchAllLines(): Promise<ILine[] | null> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getLinjas },
            );

            return queryResult.data.allLinjas.nodes.map(((linja: any) => {
                const externalLine = this.getExternalLine(linja);
                return LineFactory.createLine(externalLine);
            }));
        } catch (error) {
            console.log(error); // tslint:disable-line
            NotificationStore.addNotification(
                { message: 'Linjojen haku ei onnistunut.', type: NotificationType.ERROR },
            );
            // TODO: return object such as { success, result } to know
            // at view component if whether query ended up into an error or not
            return null;
        }
    }

    public static async fetchLine(lintunnus: string): Promise<ILine | null> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getLinja, variables: { lineId: lintunnus } },
            );

            const externalLine = this.getExternalLine(queryResult.data.linjaByLintunnus);
            return LineFactory.createLine(externalLine);
        } catch (err) {
            NotificationStore.addNotification(
                { message: 'Linjan haku ei onnistunut.', type: NotificationType.ERROR },
            );
            // TODO: return object such as { success, result } to know
            // at view component if whether query ended up into an error or not
            return null;
        }
    }

    /**
     * Converts Apollo's queryResult into:
     * @return {IExternalLine} externalLine
     * @return {IExternalRoute[]} externalLine.externalRoutes
     */
    private static getExternalLine(line: any) {
        // externalRoutes might already exist at line (line got from cache)
        if (line.reittisByLintunnus) {
            line.externalRoutes = line.reittisByLintunnus.nodes;

            delete line.reittisByLintunnus;
        }

        return line;
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
