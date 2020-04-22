import _ from 'lodash';
import EndpointPath from '~/enums/endpointPath';
import ApolloClient from '~/helpers/ApolloClient';
import { IRoutePath } from '~/models';
import { IMassEditRoutePath } from '~/models/IRoutePath';
import HttpUtils from '~/utils/HttpUtils';

interface IMassEditRoutePathSaveModel {
    added: IRoutePath[];
    modified: IRoutePath[];
    originals: IRoutePath[];
}

class RoutePathMassEditService {
    public static massEditRoutePaths = async (massEditRoutePaths: IMassEditRoutePath[]) => {
        const added: IRoutePath[] = [];
        const modified: IRoutePath[] = [];
        const originals: IRoutePath[] = [];
        massEditRoutePaths.forEach(massEditRp => {
            if (_.isEqual(massEditRp.routePath, massEditRp.oldRoutePath)) {
                originals.push(massEditRp.routePath);
            } else {
                if (!massEditRp.oldRoutePath) {
                    added.push(massEditRp.routePath);
                } else {
                    modified.push(massEditRp.routePath);
                }
            }
        });
        const massEditRoutePathSaveModel: IMassEditRoutePathSaveModel = {
            added,
            modified,
            originals
        };
        await HttpUtils.postRequest(EndpointPath.ROUTE_PATH_MASS_EDIT, massEditRoutePathSaveModel);
        ApolloClient.clearStore();
    };
}

export default RoutePathMassEditService;
