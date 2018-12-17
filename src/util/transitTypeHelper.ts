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
    public static convertTransitTypeCodesToTransitTypes = (types: string[]) => {
        return types.map(t => TransitTypeHelper.convertTransitTypeCodeToTransitType(t));
    }
}

export default TransitTypeHelper;
