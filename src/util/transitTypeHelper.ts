import TransitType from '~/enums/transitType';

class TransitTypeHelper {
    public static convertTransitTypeCodeToTransitType = (type: string) => {
        switch (type) {
        case '1':
            return TransitType.BUS;
        case '2':
            return TransitType.SUBWAY;
        case '3':
            return TransitType.TRAM;
        case '4':
            return TransitType.TRAIN;
        case '7':
            return TransitType.FERRY;
        default:
            return TransitType.NOT_FOUND;
        }
    }
    public static convertTransitTypeToTransitTypeCode = (type: TransitType) => {
        switch (type) {
        case TransitType.BUS:
            return '1';
        case TransitType.SUBWAY:
            return '2';
        case TransitType.TRAM:
            return '3';
        case TransitType.TRAIN:
            return '4';
        case TransitType.FERRY:
            return '7';
        default:
            return null;
        }
    }
    public static convertTransitTypeCodesToTransitTypes = (types: string[]) => {
        return types.map(t => TransitTypeHelper.convertTransitTypeCodeToTransitType(t));
    }
}

export default TransitTypeHelper;
