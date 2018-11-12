import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import moment from 'moment';
import apolloClient from '~/util/ApolloClient';
import { IRoutePath } from '~/models';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import ApiClient from '~/util/ApiClient';
import entityNames from '~/enums/entityNames';
import RoutePathFactory from '../factories/routePathFactory';

export default class RoutePathService {
    public static async fetchRoutePath
        (routeId: string, startDate: moment.Moment, direction: string): Promise<IRoutePath | null> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                {
                    query: getRoutePathQuery,
                    variables: {
                        routeId,
                        direction,
                        startDate: startDate.format(),
                    } },
            );
            const externalRoutePath = this.getExternalRoute(queryResult.data.routePath);
            return RoutePathFactory.createRoutePath(routeId, externalRoutePath);
        } catch (err) {
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
        // routePath.lintunnus might already exist (got from cache)
        if (routePath.reittiByReitunnus) {
            routePath.lintunnus = routePath.reittiByReitunnus.lintunnus;
            delete routePath.reittiByReitunnus;
        }

        routePath.externalRoutePathLinks = [];

        return routePath;
    }

    public static async saveRoutePath(routePath: IRoutePath) {
        const apiClient = new ApiClient();
        return await apiClient.updateObject(entityNames.ROUTEPATH, routePath);
    }
}

// tslint:disable:max-line-length
const getRoutePathQuery = gql`
query getRoutePath($routeId: String!, $startDate: Datetime!, $direction: String!) {
    routePath: reitinsuuntaByReitunnusAndSuuvoimastAndSuusuunta(reitunnus: $routeId, suuvoimast: $startDate, suusuunta: $direction){
        reitunnus
        suusuunta
        suunimi
        suunimir
        suunimilyh
        suunimilyhr
        suuvoimast
        suuviimpvm
        suuvoimviimpvm
        suulahpaik
        suulahpaikr
        suupaapaik
        suukuka
        suupaapaikr
        reittiByReitunnus {
            lintunnus
        }
    }
}
`;
// tslint:enable:max-line-length
