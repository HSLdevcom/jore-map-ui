import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import IExternalNode from '~/models/externals/IExternalNode';
import NodeFactory from '~/factories/nodeFactory';
import { INode, ILink } from '~/models';
import { INodePrimaryKey, INodeBase } from '~/models/INode';
import ApiClient from '~/util/ApiClient';
import endpoints from '~/enums/endpoints';
import GraphqlQueries from './graphqlQueries';

interface INodeSavingModel {
    node: INode;
    links: ILink[];
}

class NodeService {
    public static fetchNode = async (nodeId: string) => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getNodeQuery(),
            variables: { nodeId },
            fetchPolicy: 'no-cache' // no-cache is needed because otherwise nested data fetch does not always work
        });
        return NodeFactory.mapExternalNode(queryResult.data.node);
    };

    public static fetchAllNodes = async () => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getAllNodesQuery()
        });
        return queryResult.data.allNodes.nodes.map((node: IExternalNode) =>
            NodeFactory.createNodeBase(node)
        ) as INodeBase[];
    };

    public static updateNode = async (node: INode, links: ILink[]) => {
        const requestBody: INodeSavingModel = {
            node,
            links
        };

        await ApiClient.updateObject(endpoints.NODE, requestBody);
        await apolloClient.clearStore();
    };

    public static createNode = async (node: INode) => {
        const response = (await ApiClient.createObject(
            endpoints.NODE,
            node
        )) as INodePrimaryKey;
        await apolloClient.clearStore();
        return response.id;
    };
}

export default NodeService;
