import { IRoute, IDirection } from '../models';
import DirectionFactory from './directionFactory';

class RouteFactory {
    public static reittiToIRoute = (reitti: any): IRoute => {
        const directions:IDirection[]
            = reitti.reitinsuuntasByReitunnus.edges
                .map((direction: any) => DirectionFactory.suuntaToIDirection(direction.node));
        return <IRoute>{
            directions,
            routeName: reitti.reinimi,
            routeNameSwedish: reitti.reinimir,
            lineId: reitti.lintunnus,
        };
    }
}

export default RouteFactory;
