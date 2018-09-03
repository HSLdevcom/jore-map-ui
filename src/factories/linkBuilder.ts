import * as qs from 'qs';
import { Location } from 'history';

class LinkBuilder {
    public static createLink(location: Location, routeId: string) {
        const pathname = (location.pathname === '/')
            ? 'routes/' : location.pathname;
        const queryValues = qs.parse(
            location.search,
            { ignoreQueryPrefix: true, arrayLimit: 1 },
        );
        const queryRoutes = queryValues.routes ? queryValues.routes.split(' ') : [];
        const routeIds = [...queryRoutes, routeId];
        return pathname +
            qs.stringify(
                { ...queryValues, routes: routeIds.join('+') },
                { addQueryPrefix: true, encode: false },
            );
    }
}

export default LinkBuilder;
