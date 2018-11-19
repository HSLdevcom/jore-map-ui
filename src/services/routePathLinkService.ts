import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import IRoutePathLink from '~/models/IRoutePathLink';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import NodeType from '~/enums/nodeType';

export default class RoutePathLinkService {
    public static async fetchLinksWithLinkStartNodeId(nodeId: string)
        : Promise<IRoutePathLink[]> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getLinksWithRoutePathLinkStartNodeIdQuery, variables: { nodeId } },
            );
            const externalRoutePathLinks = queryResult.data.solmuBySoltunnus.
                linkkisByLnkalkusolmu.nodes.map((link: any) =>
                    this.getExternalRoutePathLink(link),
            );

            return externalRoutePathLinks.map((externalRoutePathLink: any) => {
                return RoutePathLinkFactory.createRoutePathLink(externalRoutePathLink);

            });
        } catch (error) {
            console.log(error); // tslint:disable-line
            notificationStore.addNotification({
                message: `Haku löytää reitin linkkien Lnkalkusolmu solmuja, joilla on
                    soltunnus ${nodeId}, ei onnistunut.`,
                type: NotificationType.ERROR,
            });
            return [];
        }
    }

    private static getExternalRoutePathLink(link: any): IExternalRoutePathLink {
        return {
            startNode: link.solmuByLnkalkusolmu,
            endNode: link.solmuByLnkloppusolmu,
            geojson: link.geojson,
            ajantaspys: '',
            lnkverkko: '',
            relid: 'new-12345' ,
            reljarjnro: 0,
            relpysakki: NodeType.STOP, // TODO, this can be crossroad aswell!
        };
    }
}

const getLinksWithRoutePathLinkStartNodeIdQuery = gql`
query getNodesWithRoutePathLinkStartNodeId($nodeId: String!) {
    solmuBySoltunnus(soltunnus: $nodeId) {
        linkkisByLnkalkusolmu {
            nodes {
                lnkverkko
                geojson
                solmuByLnkalkusolmu {
                    soltunnus
                    geojson
                    soltyyppi
                    solkirjain
                    geojsonManual
                }
                solmuByLnkloppusolmu {
                    soltunnus
                    geojson
                    soltyyppi
                    solkirjain
                    geojsonManual
                }
            }
        }
    }
}
`;
