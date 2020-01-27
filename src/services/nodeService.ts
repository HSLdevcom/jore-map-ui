import { ApolloQueryResult } from 'apollo-client';
import { LatLng } from 'leaflet';
import EndpointPath from '~/enums/endpointPath';
import NodeFactory from '~/factories/nodeFactory';
import ApolloClient from '~/helpers/ApolloClient';
import { ILink, INode } from '~/models';
import { INodeBase, INodeMapHighlight, INodePrimaryKey } from '~/models/INode';
import IExternalNode from '~/models/externals/IExternalNode';
import HttpUtils from '~/utils/HttpUtils';
import GraphqlQueries from './graphqlQueries';

class NodeService {
    public static fetchNode = async (nodeId: string) => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getNodeQuery(),
            variables: { nodeId },
            fetchPolicy: 'no-cache' // no-cache is needed because otherwise nested data fetch does not always work
        });
        return NodeFactory.mapExternalNode(queryResult.data.node);
    };

    public static fetchMapHighlightNodesFromLatLng = async (
        latLng: LatLng,
        bufferSize: number
    ): Promise<INodeMapHighlight[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getNetworkNodesFromPointQuery(),
            variables: {
                bufferSize,
                lon: latLng.lng,
                lat: latLng.lat
            }
        });
        return queryResult.data.get_network_nodes_from_point.nodes.map((node: IExternalNode) =>
            NodeFactory.createNodeMapHighlight(node)
        );
    };

    public static fetchAllNodes = async () => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllNodesQuery()
        });
        return queryResult.data.allNodes.nodes.map((node: IExternalNode) =>
            NodeFactory.createNodeBase(node)
        ) as INodeBase[];
    };

    public static updateNode = async (node: INode, links: ILink[]) => {
        interface INodeSaveModel {
            node: INode;
            links: ILink[];
        }
        const requestBody: INodeSaveModel = {
            node,
            links
        };

        await HttpUtils.updateObject(EndpointPath.NODE, requestBody);
    };

    public static createNode = async (node: INode) => {
        const response = (await HttpUtils.createObject(EndpointPath.NODE, node)) as INodePrimaryKey;
        return response.id;
    };

    public static fetchAvailableNodeId = async (node: INode) => {
        return await HttpUtils.postRequest(EndpointPath.GET_AVAILABLE_NODE_ID, {
            latLng: node.coordinates,
            nodeType: node.type,
            transitType: node.stop?.transitType
        });
    };

    public static fetchAvailableNodeIdsWithPrefix = async (beginningOfNodeId: string) => {
        return await HttpUtils.postRequest(EndpointPath.GET_AVAILABLE_NODE_IDS_WITH_PREFIX, {
            beginningOfNodeId
        });
    }
}

export default NodeService;
