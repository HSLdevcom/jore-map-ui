import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import { CopySeqmentRoutePath } from '~/stores/routePathCopySeqmentStore';
import RoutePathCopySeqmentFactory from '~/factories/routePathCopySeqmentFactory';
import GraphqlQueries from './graphqlQueries';

class RoutePathSeqmentService {
    public static fetchRoutePathLinkSeqment = async (
        startNodeId: string,
        endNodeId: string,
    ): Promise<CopySeqmentRoutePath[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query:
                GraphqlQueries.getRoutePathSeqmentQuery(),
                variables: { startNodeId, endNodeId },
            },
        );
        return RoutePathCopySeqmentFactory
            .mapExternalLinksWithRoutePathInfo(queryResult.data.linkswithroutepathinfo.nodes);
    }

}

export default RoutePathSeqmentService;
