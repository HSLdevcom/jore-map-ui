import { ApolloQueryResult } from 'apollo-client';
import moment from 'moment';
import apolloClient from '~/util/ApolloClient';
import { IRoutePath } from '~/models';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import ApiClient from '~/util/ApiClient';
import entityName from '~/enums/entityName';
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
            return RoutePathFactory.createRoutePath(routeId, queryResult.data.routePath);
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: 'Reitinsuunnan haku ei onnistunut.',
                type: NotificationType.ERROR,
            });
            return null;
        }
    }

    public static async saveRoutePath(routePath: IRoutePath) {
        const apiClient = new ApiClient();
        return await apiClient.updateObject(entityName.ROUTEPATH, routePath);
    }
}
