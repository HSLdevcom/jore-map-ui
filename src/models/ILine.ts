import TransitType from '~/enums/transitType';
import { ILineRoute } from '.';

export default interface ILine {
    transitType: TransitType;
    lineId: string;
    routes: ILineRoute[];
}
