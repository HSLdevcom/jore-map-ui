import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import { INode, ICoordinate } from '~/models';
import IExternalNode from '~/models/externals/IExternalNode';
import notificationStore from '~/stores/notificationStore';
import { INewRoutePathNode } from '~/stores/new/newRoutePathStore';
import NotificationType from '~/enums/notificationType';
import NodeFactory from '~/factories/nodeFactory';

export default class NodeService {
    public static async fetchNode(nodeId: string): Promise<INode | null> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getNodeQuery, variables: { nodeId } },
            );

            const externalNode = this.getExternalNode(queryResult.data.node);

            return NodeFactory.createNode(externalNode);
        } catch (err) {
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
            node.stop = node.pysakkiBySoltunnus;

            delete node.pysakkiBySoltunnus;
        }

        return node;
    }

    public static async fetchNodesWithRoutePathLinkStartNodeId(nodeId: string)
        : Promise<INewRoutePathNode[] | null> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getNodesWithRoutePathLinkStartNodeIdQuery, variables: { nodeId } },
            );

            const nodes = queryResult.data.solmuBySoltunnus.linkkisByLnkalkusolmu.nodes;
            return this.createNodes(nodes);
        } catch (err) {
            notificationStore.addNotification({
                message: `Haku löytää reitin linkkien Lnkalkusolmu solmuja, joilla on
                    soltunnus ${nodeId}, ei onnistunut.`,
                type: NotificationType.ERROR,
            });
            return null;
        }
    }

    // TODO: use nodeFactory's createNode instead?
    private static createNodes(nodes: any): INewRoutePathNode[] {
        return nodes.map((queryNode: any) => {
            const node = queryNode.solmuByLnkloppusolmu;

            // Use less accurate location if measured location is missing.
            const coordinateList =
                JSON.parse(node.geojson ? node.geojson : node.geojsonManual);
            const coordinates : ICoordinate = {
                lon: coordinateList.coordinates[0],
                lat: coordinateList.coordinates[1],
            };

            return {
                coordinates,
                id: node.soltunnus,
            };
        });
    }
}

const getNodeQuery = gql`
query getNodeDetails($nodeId: String!) {
    node: solmuBySoltunnus(soltunnus: $nodeId) {
        soltyyppi
        soltunnus
        solkuka
        solviimpvm
        mittpvm
        geojson
        geojsonManual
        pysakkiBySoltunnus {
            pysnimi
            pysnimir
            pyssade
        }
    }
}
`;

const getNodesWithRoutePathLinkStartNodeIdQuery = gql`
query getNodesWithRoutePathLinkStartNodeId($nodeId: String!) {
    solmuBySoltunnus(soltunnus: $nodeId) {
        linkkisByLnkalkusolmu {
            nodes {
                solmuByLnkloppusolmu {
                    soltunnus
                    geojson
                    geojsonManual
                }
            }
        }
    }
}
`;
