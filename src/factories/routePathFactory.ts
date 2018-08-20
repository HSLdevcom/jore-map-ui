import { INode, IRoutePath } from '../models';
import NodeFactory from './nodeFactory';
import NodeType from '../enums/nodeType';

class RoutePathFactory {

    private static getStartNode = (geoJson: any) => {
        const startingPointNode: INode = {
            id: 0,
            type: NodeType.START,
            geoJson: {
                type: NodeType.START,
                coordinates: geoJson.coordinates[0],
            },
        };
        return startingPointNode;
    }

    // suunta to IRoutePath
    public static createRoutePath = (suunta: any, isVisible:boolean): IRoutePath => {
        const nodes:INode[]
        = suunta.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.edges
            .map((node: any) => {
                return NodeFactory.createNode(node.node);
            });

        const geoJson = JSON.parse(suunta.geojson);
        const startingPointNode = RoutePathFactory.getStartNode(geoJson);
        nodes.unshift(startingPointNode);

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
