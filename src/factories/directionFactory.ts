import { IDirection } from '../models';

class DirectionFactory {
    public static suuntaToIDirection = (suunta: any): IDirection => {
        return <IDirection>{
            directionName: suunta.suunimi,
            direction: suunta.suusuunta,
            geoJson: suunta.geojson,
        };
    }
}

export default DirectionFactory;
