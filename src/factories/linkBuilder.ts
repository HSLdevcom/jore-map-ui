import * as qs from 'qs';
import { Location } from 'history';

class LinkBuilder {
    public static createLinkWithRoute(location: Location, routeId: string) {
        const { routes: queryRoutes, ...queryValues } = qs.parse(
            location.search,
            { ignoreQueryPrefix: true, arrayLimit: 1 },
        );
        const routeIds = [...this.parseRouteIds(queryRoutes), routeId];
        return this.createLink(queryValues, routeIds);
    }

    public static createLinkWithoutRoute(location: Location, routeId: string) {
        const { routes: queryRoutes, ...queryValues } = qs.parse(
            location.search,
            { ignoreQueryPrefix: true, arrayLimit: 1 },
        );
        const routeIds = this.parseRouteIds(queryRoutes).filter(x => x !== routeId);
        return this.createLink(queryValues, routeIds);
    }

    public static parseRouteIds(queryValues: any): string[] {
        return queryValues ? queryValues.split(' ') : [];
    }

    private static createLink(queryValues:any, routeIds: string[]) {
        const pathname = (routeIds.length > 0)
            ? 'routes/' : '/';
        return pathname +
            qs.stringify(
                routeIds.length < 1 ? queryValues : { ...queryValues, routes: routeIds.join('+') },
                { addQueryPrefix: true, encode: false },
            );
    }
}

export default LinkBuilder;
