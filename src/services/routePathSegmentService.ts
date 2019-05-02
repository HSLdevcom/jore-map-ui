import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import { ICopySegmentRoutePath } from '~/stores/routePathCopySegmentStore';
import RoutePathCopySegmentFactory from '~/factories/routePathCopySegmentFactory';
import GraphqlQueries from './graphqlQueries';

class RoutePathSegmentService {
    public static fetchRoutePathLinkSegment = async (
        startNodeId: string,
        endNodeId: string,
        transitType: string,
    ): Promise<ICopySegmentRoutePath[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query:
                GraphqlQueries.getRoutePathSegmentQuery(),
                variables: { startNodeId, endNodeId, transitType },
            },
        );
        return RoutePathCopySegmentFactory
            .mapExternalLinksWithRoutePathInfo(queryResult.data.linkswithroutepathinfo.nodes);
    }

}

export default RoutePathSegmentService;
