import TransitType from '~/enums/transitType';
import * as s from './transitTypeColors.scss';

class TransitTypeHelper {
    public static getColor = (type: TransitType) => {
        switch (type) {
            case TransitType.BUS:
                return '#007ac9';
            case TransitType.FERRY:
                return '#00b9e4';
            case TransitType.SUBWAY:
                return '#ff6319';
            case TransitType.TRAM:
                return '#00985f';
            case TransitType.TRAIN:
                return '#8c4799';
            default:
                throw new Error(`TransitType not supported: ${type}`);
        }
    };

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
            default:
                throw new Error(`TransitType not supported: ${type}`);
        }
    };

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
            default:
                throw new Error(`TransitType not supported: ${type}`);
        }
    };

    public static getTransitTypeLabel = (type: TransitType) => {
        switch (type) {
            case TransitType.BUS:
                return 'Linja-auto';
            case TransitType.FERRY:
                return 'Lautta';
            case TransitType.SUBWAY:
                return 'Metro';
            case TransitType.TRAM:
                return 'Raitiovaunu';
            case TransitType.TRAIN:
                return 'Lähijuna';
            default:
                throw new Error(`TransitType not supported: ${type}`);
        }
    };
}

export default TransitTypeHelper;
