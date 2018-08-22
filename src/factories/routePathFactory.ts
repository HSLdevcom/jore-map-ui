import { INode, IRoutePath } from '../models';
import NodeFactory from './nodeFactory';

class RoutePathFactory {

    // suunta to IRoutePath
    public static createRoutePath = (suunta: any, isVisible:boolean): IRoutePath => {
        const nodes:INode[]
        = suunta.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.edges
            .map((node: any) => {
                return NodeFactory.createNode(node.node);
            });

        const geoJson = JSON.parse(suunta.geojson);
        const asd = NodeFactory.createStartingPointNode(geoJson.coordinates[0]);
        nodes.unshift(asd);

        return <IRoutePath>{
            nodes,
            geoJson,
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
