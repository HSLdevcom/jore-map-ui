import _ from 'lodash';
import EndpointPath from '~/enums/endpointPath';
import ApolloClient from '~/helpers/ApolloClient';
import {
    IBackendMassEditRoutePath,
    IMassEditRoutePath,
    IMassEditRoutePathSaveModel,
    IMassEditRoutePathSaveModels,
    IRoutePathPrimaryKey,
} from '~/models/IRoutePath';
import HttpUtils from '~/utils/HttpUtils';

class RoutePathMassEditService {
    public static massEditRoutePaths = async ({
        routeId,
        massEditRoutePaths,
    }: {
        routeId: string;
        massEditRoutePaths: IMassEditRoutePath[];
    }) => {
        const addedRpSaveModel: IMassEditRoutePathSaveModel[] = [];
        const modifiedRpSaveModel: IMassEditRoutePathSaveModel[] = [];
        const originalRpSaveModel: IMassEditRoutePathSaveModel[] = [];
        massEditRoutePaths.forEach((massEditRp) => {
            const currentRp = massEditRp.routePath;
            const massEditRoutePath: IBackendMassEditRoutePath = {
                routeId: currentRp.routeId,
                startDate: currentRp.startDate,
                direction: currentRp.direction,
                endDate: currentRp.endDate,
            };

            const oldRp = massEditRp.oldRoutePath;
            if (_.isEqual(massEditRp.routePath, massEditRp.oldRoutePath)) {
                originalRpSaveModel.push({
                    massEditRoutePath,
                    originalPrimaryKey: _getOriginalRpPrimaryKey(currentRp),
                });
            } else {
                if (massEditRp.isNew) {
                    addedRpSaveModel.push({
                        massEditRoutePath,
                        originalPrimaryKey: _getOriginalRpPrimaryKey(oldRp!),
                    });
                } else {
                    modifiedRpSaveModel.push({
                        massEditRoutePath,
                        originalPrimaryKey: _getOriginalRpPrimaryKey(oldRp!),
                    });
                }
            }
        });
        const massEditRoutePathSaveModel: IMassEditRoutePathSaveModels = {
            routeId,
            added: addedRpSaveModel,
            modified: modifiedRpSaveModel,
            originals: originalRpSaveModel,
        };
        await HttpUtils.postRequest(EndpointPath.ROUTE_PATH_MASS_EDIT, massEditRoutePathSaveModel);
        ApolloClient.clearStore();
    };
}

const _getOriginalRpPrimaryKey = (routePath: IBackendMassEditRoutePath): IRoutePathPrimaryKey => {
    return {
        routeId: routePath.routeId,
        direction: routePath.direction,
        startDate: routePath.startDate,
    };
};

export default RoutePathMassEditService;
