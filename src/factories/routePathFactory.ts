import { INode, IRoutePath } from '../models';
import NodeFactory from './nodeFactory';
import HashHelper from '../util/hashHelper';

class RoutePathFactory {
    // suunta to IRoutePath
    public static createRoutePath = (
        routeId: string,
        suunta: any,
        isVisible:boolean,
    ): IRoutePath => {
        const madeUpId = HashHelper.getHashFromString(
            `${routeId}-${suunta.suunimi}-${suunta.suuvoimast}-${suunta.suuvoimviimpvm}`,
        ).toString();

        const nodes:INode[]
        = suunta.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.edges
            .map((node: any) => NodeFactory.createNode(madeUpId, node.node));

        const coordinates = JSON.parse(suunta.geojson).coordinates;
        const positions = coordinates.map((coor: [number, number]) => [coor[1], coor[0]]);

        return <IRoutePath>{
            routeId,
            nodes,
            positions,
            internalRoutePathId: madeUpId,
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
