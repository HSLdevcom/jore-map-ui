import { IRoutePath } from '../models';

class RoutePathFactory {
    public static suuntaToIRoutePath = (suunta: any, isVisible:boolean): IRoutePath => {
        return <IRoutePath>{
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
