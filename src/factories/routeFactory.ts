import { IRoute, IDirection, ILine } from '../models';
import DirectionFactory from './directionFactory';

class RouteFactory {
    public static reittiToIRoute = (reitti: any, line?: ILine): IRoute => {
        const directions:IDirection[]
            = reitti.reitinsuuntasByReitunnus.edges
                .map((direction: any) => DirectionFactory.suuntaToIDirection(direction.node));

        return <IRoute>{
            directions,
            line,
            routeName: reitti.reinimi,
            routeNameSwedish: reitti.reinimir,
            lineId: reitti.lintunnus,
        };
    }
}

export default RouteFactory;
