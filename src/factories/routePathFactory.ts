import { INode, IRoutePath } from '../models';
import NodeFactory from './nodeFactory';

class RoutePathFactory {
    // suunta to IRoutePath
    public static createRoutePath = (suunta: any, isVisible:boolean): IRoutePath => {
        const nodes:INode[]
        = suunta.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.edges
            .map((node: any) => NodeFactory.createNode(node.node));

        return <IRoutePath>{
            nodes,
            routePathName: suunta.suunimi,
            direction: suunta.suusuunta,
            geoJson: JSON.parse(suunta.geojson),
            startTime: new Date(suunta.suuvoimast),
            endTime: new Date(suunta.suuviimpvm),
            lastModified: new Date(suunta.suuvoimviimpvm),
            visible: isVisible,
        };
    }
}

export default RoutePathFactory;
