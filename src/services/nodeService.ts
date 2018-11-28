import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import { INode } from '~/models';
import IExternalNode from '~/models/externals/IExternalNode';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import NodeFactory from '~/factories/nodeFactory';
import Graphql from './graphql';

export default class NodeService {
    public static async fetchNode(nodeId: string): Promise<INode | null> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: Graphql.getNodeQuery(), variables: { nodeId } },
            );

            const externalNode = this.getExternalNode(queryResult.data.node);

            return NodeFactory.createNode(externalNode);
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: 'Solmun haku ei onnistunut.',
                type: NotificationType.ERROR,
            });
            return null;
        }
    }

    private static getExternalNode(node: any): IExternalNode {

        // node.stop might already exist (got from cache)
        if (node.pysakkiBySoltunnus) {
            node.externalStop = node.pysakkiBySoltunnus;

            delete node.pysakkiBySoltunnus;
        }

        return node;
    }
}
