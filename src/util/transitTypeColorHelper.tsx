import TransitType from '../enums/transitType';
import * as s from './transitTypeColors.scss';

class TransitTypeColorHelper {
    public static getColorClass = (type: TransitType) => {
        switch (type) {
        case TransitType.BUS:
            return s.bus;
        case TransitType.FERRY:
            return s.ferry;
        case TransitType.SUBWAY:
            return s.subway;
        case TransitType.TRAM:
            return s.tram;
        case TransitType.TRAIN:
            return s.train;
        case TransitType.NOT_FOUND:
            return s.notFound;
        default:
            throw new Error('TransitType not supported: ' + type);
        }
    }

    public static getBackgroundColorClass = (type: TransitType) => {
        switch (type) {
        case TransitType.BUS:
            return s.busBg;
        case TransitType.FERRY:
            return s.ferryBg;
        case TransitType.SUBWAY:
            return s.subwayBg;
        case TransitType.TRAM:
            return s.tramBg;
        case TransitType.TRAIN:
            return s.trainBg;
        case TransitType.NOT_FOUND:
            return s.notFound;
        default:
            throw new Error('TransitType not supported: ' + type);
        }
    }
}

export default TransitTypeColorHelper;
