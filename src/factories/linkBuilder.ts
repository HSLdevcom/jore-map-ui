import * as qs from 'qs';
import { Location } from 'history';

class LinkBuilder {
    public static createLinkWithRoute = (location: Location, routeId: string) => {
        const { routes: queryRoutes, ...queryValues } = qs.parse(
            location.search,
            { ignoreQueryPrefix: true, arrayLimit: 1 },
        );
        const routeIds = [...LinkBuilder.parseRouteIds(queryRoutes), routeId];
        return LinkBuilder.createLink(queryValues, routeIds);
    }

    public static createLinkWithoutRoute = (location: Location, routeId: string) => {
        const { routes: queryRoutes, ...queryValues } = qs.parse(
            location.search,
            { ignoreQueryPrefix: true, arrayLimit: 1 },
        );
        const routeIds = LinkBuilder.parseRouteIds(queryRoutes)
            .filter((x: string) => x !== routeId);
        return LinkBuilder.createLink(queryValues, routeIds);
    }

    public static parseRouteIds = (queryValues: any) => {
        return queryValues ? queryValues.split(' ') : [];
    }

    private static createLink = (queryValues:any, routeIds: string[]) => {
        const pathname = (routeIds.length < 1)
            ? '/' : '/routes/';
        return pathname +
            qs.stringify(
                routeIds.length < 1 ? queryValues : { ...queryValues, routes: routeIds.join('+') },
                { addQueryPrefix: true, encode: false },
            );
    }
}

export default LinkBuilder;
