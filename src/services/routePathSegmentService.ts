import { ApolloQueryResult } from 'apollo-client';
import RoutePathCopySegmentFactory from '~/factories/routePathCopySegmentFactory';
import ApolloClient from '~/helpers/ApolloClient';
import { IRoutePathSegment } from '~/models/IRoutePath';
import GraphqlQueries from './graphqlQueries';

class RoutePathSegmentService {
    public static fetchRoutePathLinkSegment = async ({
        startNodeId,
        endNodeId,
        transitType,
        routeId,
    }: {
        startNodeId: string;
        endNodeId: string;
        transitType: string;
        routeId: string;
    }): Promise<IRoutePathSegment[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRoutePathSegmentQuery(),
            fetchPolicy: 'no-cache',
            variables: { startNodeId, endNodeId, transitType, routeId },
        });
        return RoutePathCopySegmentFactory.mapExternalLinksWithRoutePathInfo(
            queryResult.data.links_with_route_path_info.nodes
        );
    };
}

export default RoutePathSegmentService;
