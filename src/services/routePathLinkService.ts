import { ApolloQueryResult } from 'apollo-client';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import ApolloClient from '~/helpers/ApolloClient';
import { IViaName } from '~/models';
import IRoutePathLink from '~/models/IRoutePathLink';
import IViaShieldName from '~/models/IViaShieldName';
import GraphqlQueries from './graphqlQueries';
import ViaNameService from './viaNameService';

class RoutePathLinkService {
    public static fetchRoutePathLink = async (id: number): Promise<IRoutePathLink> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRoutePathLinkQuery(),
            variables: { routeLinkId: id },
        });
        let routePathLink: IRoutePathLink = RoutePathLinkFactory.mapExternalRoutePathLink(
            queryResult.data.routePathLink
        );
        const viaName: IViaName | null = await ViaNameService.fetchViaNameById(id);
        const viaShieldName: IViaShieldName | null = await ViaNameService.fetchViaShieldNameById(
            id
        );
        routePathLink = {
            ...routePathLink,
            ...viaShieldName,
            ...viaName,
        };
        return routePathLink;
    };
}

export default RoutePathLinkService;
