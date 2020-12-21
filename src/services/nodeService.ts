import { ApolloQueryResult } from 'apollo-client';
import { LatLng } from 'leaflet';
import EndpointPath from '~/enums/endpointPath';
import TransitType from '~/enums/transitType';
import NodeFactory from '~/factories/nodeFactory';
import ApolloClient from '~/helpers/ApolloClient';
import { ILink, INode } from '~/models';
import { INodeMapHighlight, INodePrimaryKey, ISearchNode } from '~/models/INode';
import IExternalNode, { IExternalSearchNode } from '~/models/externals/IExternalNode';
import HttpUtils from '~/utils/HttpUtils';
import GraphqlQueries from './graphqlQueries';

class NodeService {
    public static fetchNode = async (nodeId: string): Promise<INode | null> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getNodeQuery(),
            variables: { nodeId },
            fetchPolicy: 'no-cache', // no-cache is needed because otherwise nested data fetch does not always work
        });
        const externalNode = queryResult.data.node;
        return externalNode ? NodeFactory.mapExternalNode(externalNode) : null;
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
                lat: latLng.lat,
            },
        });
        return queryResult.data.get_network_nodes_from_point.nodes.map((node: IExternalNode) =>
            NodeFactory.createNodeMapHighlight(node)
        );
    };

    public static fetchSearchNode = async (nodeId: string): Promise<ISearchNode | null> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getSearchNodeQuery(),
            variables: { nodeId },
            fetchPolicy: 'no-cache',
        });
        return queryResult.data.node ? NodeFactory.createSearchNode(queryResult.data.node) : null;
    };

    public static fetchAllSearchNodes = async ({
        shouldUseCache,
    }: {
        shouldUseCache: boolean;
    }): Promise<ISearchNode[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllSearchNodesQuery(),
            fetchPolicy: shouldUseCache ? undefined : 'no-cache',
        });
        return queryResult.data.allNodes.nodes.map((node: IExternalSearchNode) => {
            return NodeFactory.createSearchNode(node);
        });
    };

    public static updateNode = async (
        node: INode,
        links: ILink[],
        shouldChangeStopGapMeasurementType: boolean
    ) => {
        await HttpUtils.updateObject(EndpointPath.NODE, {
            node,
            links,
            shouldChangeStopGapMeasurementType,
        });
    };

    public static createNode = async (node: INode) => {
        const response = (await HttpUtils.createObject(EndpointPath.NODE, node)) as INodePrimaryKey;
        return response.id;
    };

    public static fetchAvailableNodeId = async ({
        node,
        transitType,
    }: {
        node: INode;
        transitType?: TransitType | null;
    }): Promise<string | null> => {
        return await HttpUtils.postRequest(EndpointPath.GET_AVAILABLE_NODE_ID, {
            transitType,
            latLng: node.coordinates,
            nodeType: node.type,
        });
    };

    public static fetchAvailableNodeIdsWithPrefix = async (beginningOfNodeId: string) => {
        return await HttpUtils.postRequest(EndpointPath.GET_AVAILABLE_NODE_IDS_WITH_PREFIX, {
            beginningOfNodeId,
        });
    };
}

export default NodeService;
