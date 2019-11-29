import { ApolloQueryResult } from 'apollo-client';
import { LatLng } from 'leaflet';
import endpoints from '~/enums/endpoints';
import NodeFactory from '~/factories/nodeFactory';
import { ILink, INode } from '~/models';
import { INodeBase, INodeMapHighlight, INodePrimaryKey } from '~/models/INode';
import IExternalNode from '~/models/externals/IExternalNode';
import ApiClient from '~/util/ApiClient';
import ApolloClient from '~/util/ApolloClient';
import GraphqlQueries from './graphqlQueries';

interface INodeSaveModel {
    node: INode;
    links: ILink[];
}

class NodeService {
    public static fetchNode = async (nodeId: string) => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getNodeQuery(),
            variables: { nodeId },
            fetchPolicy: 'no-cache' // no-cache is needed because otherwise nested data fetch does not always work
        });
        return NodeFactory.mapExternalNode(queryResult.data.node);
    };

    public static fetchNodesFromLatLng = async (latLng: LatLng): Promise<INodeMapHighlight[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getNetworkObjectsFromPointQuery(),
            variables: {
                lon: latLng.lng,
                lat: latLng.lat
            }
        });

        return queryResult.data.get_network_objects_from_point.nodes.map((node: IExternalNode) =>
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
        const requestBody: INodeSaveModel = {
            node,
            links
        };

        await ApiClient.updateObject(endpoints.NODE, requestBody);
    };

    public static createNode = async (node: INode) => {
        const response = (await ApiClient.createObject(endpoints.NODE, node)) as INodePrimaryKey;
        return response.id;
    };
}

export default NodeService;
