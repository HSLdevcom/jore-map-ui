import TransitType from '../enums/transitType';
import {
  tram,
  bus,
  ferry,
  subway,
  train,
  tramBg,
  busBg,
  ferryBg,
  subwayBg,
  trainBg,
} from './transitTypeColors.scss';

class TransitTypeColorHelper {
    public static getColorClass = (type: TransitType, isBackground: boolean) => {
        switch (type) {
        case TransitType.BUS:
            return isBackground ? busBg : bus;
        case TransitType.FERRY:
            return isBackground ? ferryBg : ferry;
        case TransitType.SUBWAY:
            return isBackground ? subwayBg : subway;
        case TransitType.TRAM:
            return isBackground ? tramBg : tram;
        case TransitType.TRAIN:
            return isBackground ? trainBg : train;
        default:
            return isBackground ? busBg : bus;
        }
    }
}

export default TransitTypeColorHelper;
