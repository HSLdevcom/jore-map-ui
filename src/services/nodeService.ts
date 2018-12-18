import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import { INode } from '~/models';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import NodeFactory from '~/factories/nodeFactory';
import GraphqlQueries from './graphqlQueries';

export default class NodeService {
    public static async fetchNode(nodeId: string): Promise<INode | null> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getNodeQuery(), variables: { nodeId } },
            );
            return NodeFactory.createNode(queryResult.data.node);
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: 'Solmun haku ei onnistunut.',
                type: NotificationType.ERROR,
            });
            return null;
        }
    }
}
