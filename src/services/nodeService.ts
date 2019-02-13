import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import INodeBase from '~/models/baseModels/INodeBase';
import IExternalNode from '~/models/externals/IExternalNode';
import NodeFactory from '~/factories/nodeFactory';
import { INode } from '~/models';
import ApiClient from '~/util/ApiClient';
import entityName from '~/enums/entityName';
import GraphqlQueries from './graphqlQueries';

class NodeService {
    public static fetchNode = async (nodeId: string) => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: GraphqlQueries.getNodeQuery(), variables: { nodeId } },
        );
        return NodeFactory.createNode(queryResult.data.node);
    }

    public static fetchAllNodes = async () => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: GraphqlQueries.getAllNodesQuery() },
        );
        return queryResult.data.allNodes.nodes
            .map((node: IExternalNode) =>
            NodeFactory.createNodeBase(node),
        ) as INodeBase[];
    }

    public static updateNode = async (node: INode) => {
        const apiClient = new ApiClient();
        await apiClient.updateObject(entityName.NODE, node);
        await apolloClient.clearStore();
    }
}

export default NodeService;
