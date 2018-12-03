import { ApolloQueryResult } from 'apollo-client';
import moment from 'moment';
import apolloClient from '~/util/ApolloClient';
import { IRoutePath } from '~/models';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import ApiClient from '~/util/ApiClient';
import entityNames from '~/enums/entityNames';
import RoutePathFactory from '../factories/routePathFactory';
import GraphqlQueries from './graphqlQueries';

export default class RoutePathService {
    public static async fetchRoutePath
        (routeId: string, startDate: moment.Moment, direction: string): Promise<IRoutePath | null> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                {
                    query: GraphqlQueries.getRoutePathQuery(),
                    variables: {
                        routeId,
                        direction,
                        startDate: startDate.format(),
                    } },
            );
            const externalRoutePath = this.getExternalRoute(queryResult.data.routePath);
            return RoutePathFactory.createRoutePath(routeId, externalRoutePath);
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: 'Reitinsuunnan haku ei onnistunut.',
                type: NotificationType.ERROR,
            });
            return null;
        }
    }

    /**
     * Converts Apollo's queryResult into:
     * @return {IExternalRoutePath} externalRoutePath
     * @return {IExternalRoutePathLink[]} externalRoutePath.externalRoutePathLinks
     * @return {IExternalRoutePathLinkNode} externalRoutePathLinks.startNode
     * @return {IExternalRoutePathLinkNode} externalRoutePathLinks.endNode
     */
    private static getExternalRoute(routePath: any): IExternalRoutePath {
        // routePath.externalRoutePathLinks might already exist (got from cache)
        if (routePath.externalRoutePathLinks) {
            return routePath;
        }

        routePath.lintunnus = routePath.reittiByReitunnus.lintunnus;
        delete routePath.reittiByReitunnus;

        routePath.externalRoutePathLinks
        = routePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.nodes;
        delete routePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta;

        routePath.externalRoutePathLinks.forEach((externalRoutePathLink: any) => {
            externalRoutePathLink.link = externalRoutePathLink
                .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu;

            externalRoutePathLink.geojson = externalRoutePathLink
                .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu.geojson;
            externalRoutePathLink.startNode = externalRoutePathLink
                .solmuByLnkalkusolmu;
            externalRoutePathLink.endNode = externalRoutePathLink
                .solmuByLnkloppusolmu;

            externalRoutePathLink.solmuByLnkalkusolmu.externalStop
                = externalRoutePathLink.solmuByLnkalkusolmu.pysakkiBySoltunnus;

            externalRoutePathLink.solmuByLnkloppusolmu.externalStop
                = externalRoutePathLink.solmuByLnkloppusolmu.pysakkiBySoltunnus;

            delete externalRoutePathLink
                .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu;
            delete externalRoutePathLink
                .solmuByLnkalkusolmu;
            delete externalRoutePathLink
                .solmuByLnkloppusolmu;
        });

        routePath.externalRoutePathLinks.sort(
        (a: IExternalRoutePathLink, b: IExternalRoutePathLink) => {
            return a.reljarjnro - b.reljarjnro;
        });
        return routePath;
    }

    public static async saveRoutePath(routePath: IRoutePath) {
        const apiClient = new ApiClient();
        return await apiClient.updateObject(entityNames.ROUTEPATH, routePath);
    }
}
