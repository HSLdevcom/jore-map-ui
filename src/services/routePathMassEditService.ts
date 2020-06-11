import _ from 'lodash';
import EndpointPath from '~/enums/endpointPath';
import ApolloClient from '~/helpers/ApolloClient';
import IRoutePath, {
    IMassEditRoutePath,
    IMultipleRoutePathSaveModel,
    IRoutePathPrimaryKey,
    IRoutePathSaveModel,
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
        const addedRpSaveModel: IRoutePathSaveModel[] = [];
        const modifiedRpSaveModel: IRoutePathSaveModel[] = [];
        const originalRpSaveModel: IRoutePathSaveModel[] = [];
        massEditRoutePaths.forEach((massEditRp) => {
            const currentRp = massEditRp.routePath;
            const oldRp = massEditRp.oldRoutePath;
            if (_.isEqual(massEditRp.routePath, massEditRp.oldRoutePath)) {
                originalRpSaveModel.push({
                    routePath: currentRp,
                    routePathLinkSaveModel: {
                        added: [],
                        modified: [],
                        removed: [],
                        originals: [],
                    },
                    originalPrimaryKey: _getOriginalRpPrimaryKey(currentRp),
                });
            } else {
                if (massEditRp.isNew) {
                    addedRpSaveModel.push({
                        routePath: currentRp,
                        routePathLinkSaveModel: {
                            added: currentRp.routePathLinks,
                            modified: [],
                            removed: [],
                            originals: [],
                        },
                        originalPrimaryKey: _getOriginalRpPrimaryKey(oldRp!),
                    });
                } else {
                    modifiedRpSaveModel.push({
                        routePath: currentRp,
                        routePathLinkSaveModel: {
                            added: [],
                            modified: currentRp.routePathLinks,
                            removed: [],
                            originals: [],
                        },
                        originalPrimaryKey: _getOriginalRpPrimaryKey(oldRp!),
                    });
                }
            }
        });
        const massEditRoutePathSaveModel: IMultipleRoutePathSaveModel = {
            routeId,
            added: addedRpSaveModel,
            modified: modifiedRpSaveModel,
            originals: originalRpSaveModel,
        };
        await HttpUtils.postRequest(EndpointPath.ROUTE_PATH_MASS_EDIT, massEditRoutePathSaveModel);
        ApolloClient.clearStore();
    };
}

const _getOriginalRpPrimaryKey = (routePath: IRoutePath): IRoutePathPrimaryKey => {
    return {
        routeId: routePath.routeId,
        direction: routePath.direction,
        startDate: routePath.startDate,
    };
};

export default RoutePathMassEditService;
