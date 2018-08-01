import { IDirection } from '../models';

class DirectionFactory {
    public static suuntaToIDirection = (suunta: any): IDirection => {
        return <IDirection>{
            directionName: suunta.suunimi,
            direction: suunta.suusuunta,
            geoJson: suunta.geojson,
            startTime: new Date(suunta.suuvoimast),
            endTime: new Date(suunta.suuviimpvm),
            lastModified: new Date(suunta.suuvoimviimpvm),
            visible: false,
        };
    }
}

export default DirectionFactory;
