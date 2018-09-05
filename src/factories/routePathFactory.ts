import { IRoutePath, IRoutePathLink } from '../models';
import HashHelper from '../util/hashHelper';
import RoutePathLinkFactory from './routePathLinkFactory';

class RoutePathFactory {
    // suunta to IRoutePath
    public static createRoutePath = (
        routeId: string,
        suunta: any,
        isVisible:boolean,
    ): IRoutePath => {
        const internalRoutePathId = HashHelper.getHashFromString(
            [
                routeId,
                suunta.suunimi,
                suunta.suuvoimast,
                suunta.suuvoimviimpvm,
                suunta.suusuunta,
            ].join('-'),
        ).toString();

        const routePathLinks:IRoutePathLink[]
        = suunta.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.edges
            .map((node: any) =>
                RoutePathLinkFactory.createRoutePathLink(node.node));

        const coordinates = JSON.parse(suunta.geojson).coordinates;
        const positions = coordinates.map((coor: [number, number]) => [coor[1], coor[0]]);

        return <IRoutePath>{
            routeId,
            positions,
            routePathLinks,
            internalId: internalRoutePathId,
            geoJson: JSON.parse(suunta.geojson),
            routePathName: suunta.suunimi,
            direction: suunta.suusuunta,
            startTime: new Date(suunta.suuvoimast),
            endTime: new Date(suunta.suuviimpvm),
            lastModified: new Date(suunta.suuvoimviimpvm),
            visible: isVisible,
        };
    }
}

export default RoutePathFactory;
