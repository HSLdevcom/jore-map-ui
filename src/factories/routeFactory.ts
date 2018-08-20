import { IRoute, IRoutePath, ILine, INode } from '../models';
import NodeType from '../enums/nodeType';
import RoutePathFactory from './routePathFactory';

class RouteFactory {

    private static addStartNodes = (routePaths: IRoutePath[]) => {
        for (let i = 0; i < routePaths.length; i = i + 1) {
            const startPoint = routePaths[i].nodes[0];
            const routeStart: INode = {
                id: 0,
                type: NodeType.START,
                geoJson: startPoint.geoJson,
            };
            routePaths[i].nodes.unshift(routeStart);
        }
        return routePaths;
    }

    // reitti to IRoute
    public static createRoute = (reitti: any, line?: ILine): IRoute => {
        let routePaths:IRoutePath[]
            = reitti.reitinsuuntasByReitunnus.edges
                .map((routePath: any, index:number) => {
                    // By default make the first two routePaths visible
                    const isVisible = (index <= 1);

                    return RoutePathFactory.createRoutePath(routePath.node, isVisible);
                });

        routePaths = RouteFactory.addStartNodes(routePaths);
        console.log(routePaths);
        return <IRoute>{
            routePaths,
            line,
            routeName: reitti.reinimi,
            routeNameSwedish: reitti.reinimir,
            lineId: reitti.lintunnus,
        };
    }
}

export default RouteFactory;
