import { INode, IRoutePath } from '../models';
import NodeFactory from './nodeFactory';

class RoutePathFactory {
    // suunta to IRoutePath
    public static createRoutePath = (suunta: any, isVisible:boolean): IRoutePath => {
        const nodes:INode[]
        = suunta.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.edges
            .map((node: any) => NodeFactory.createNode(node.node));

        const coordinates = JSON.parse(suunta.geojson).coordinates;
        const positions = coordinates.map((coor: [number, number]) => [coor[1], coor[0]]);

        return <IRoutePath>{
            nodes,
            positions,
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
