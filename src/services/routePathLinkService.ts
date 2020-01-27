import { ApolloQueryResult } from 'apollo-client';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import ApolloClient from '~/helpers/ApolloClientHelper';
import IRoutePathLink from '~/models/IRoutePathLink';
import GraphqlQueries from './graphqlQueries';

class RoutePathLinkService {
    public static fetchRoutePathLink = async (id: number): Promise<IRoutePathLink> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRoutePathLinkQuery(),
            variables: { routeLinkId: id }
        });
        return RoutePathLinkFactory.mapExternalRoutePathLink(queryResult.data.routePathLink);
    };
}

export default RoutePathLinkService;
