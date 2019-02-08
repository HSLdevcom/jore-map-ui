import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import INodeBase from '~/models/baseModels/INodeBase';
import IExternalNode from '~/models/externals/IExternalNode';
import NodeFactory from '~/factories/nodeFactory';
import { INode } from '~/models';
import ApiClient from '~/util/ApiClient';
import entityName from '~/enums/entityName';
import GraphqlQueries from './graphqlQueries';

class NodeService {
    public static fetchNode = async (nodeId: string) => {
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

    public static fetchAllNodes = async () => {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getAllNodesQuery() },
            );
            return queryResult.data.allNodes.nodes
                .map((node: IExternalNode) =>
                NodeFactory.createNodeBase(node),
            ) as INodeBase[];
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: 'Solmujen haku ei onnistunut.',
                type: NotificationType.ERROR,
            });
            return null;
        }
    }

    public static updateNode = async (node: INode) => {
        const apiClient = new ApiClient();
        await apiClient.updateObject(entityName.NODE, node);
        await apolloClient.clearStore();
    }
}

export default NodeService;
