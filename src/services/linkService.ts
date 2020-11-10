import { ApolloQueryResult } from 'apollo-client';
import { LatLng } from 'leaflet';
import EndpointPath from '~/enums/endpointPath';
import LinkFactory from '~/factories/linkFactory';
import ApolloClient from '~/helpers/ApolloClient';
import ILink, { ILinkMapHighlight } from '~/models/ILink';
import IExternalLink, { IExternalNetworkSelectLink } from '~/models/externals/IExternalLink';
import HttpUtils from '~/utils/HttpUtils';
import GraphqlQueries from './graphqlQueries';

class LinkService {
    public static fetchLinksWithStartNodeOrEndNode = async (nodeId: string): Promise<ILink[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getLinksByStartNodeAndEndNodeQuery(),
            variables: { nodeId },
        });
        const queriedLinks = [
            ...queryResult.data.solmuBySoltunnus.linkkisByLnkalkusolmu.nodes,
            ...queryResult.data.solmuBySoltunnus.linkkisByLnkloppusolmu.nodes,
        ];
        return queriedLinks.map((link: IExternalLink) => LinkFactory.mapExternalLink(link));
    };

    public static fetchLink = async (
        startNodeId: string,
        endNodeId: string,
        transitTypeCode: string
    ): Promise<ILink | null> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getLinkQuery(),
            variables: { startNodeId, endNodeId, transitType: transitTypeCode },
        });
        const externalLink: IExternalLink | null = queryResult.data.link;
        return externalLink ? LinkFactory.mapExternalLink(externalLink) : null;
    };

    public static fetchMapHighlightLinksFromLatLng = async (
        latLng: LatLng,
        bufferSize: number
    ): Promise<ILinkMapHighlight[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getNetworkLinksFromPointQuery(),
            variables: {
                bufferSize,
                lat: latLng.lat,
                lon: latLng.lng,
            },
        });
        return queryResult.data.get_network_links_from_point.nodes.map(
            (link: IExternalNetworkSelectLink) => LinkFactory.createLinkMapHighlight(link)
        );
    };

    public static fetchLinks = async (startNodeId: string, endNodeId: string): Promise<ILink[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getLinksQuery(),
            variables: { startNodeId, endNodeId },
        });
        const queriedLinks = queryResult.data.getLinks.nodes;
        return queriedLinks.map((link: IExternalLink) => LinkFactory.mapExternalLink(link));
    };

    public static updateLink = async (link: ILink, shouldChangeStopGapMeasurementType: boolean) => {
        await HttpUtils.updateObject(EndpointPath.LINK, {
            shouldChangeStopGapMeasurementType,
            link: {
                ...link,
                geometry: link.geometry.map((coor) => new LatLng(coor.lat, coor.lng)),
            },
        });
    };

    public static createLink = async (link: ILink) => {
        await HttpUtils.createObject(EndpointPath.LINK, { link });
    };
}

export default LinkService;
