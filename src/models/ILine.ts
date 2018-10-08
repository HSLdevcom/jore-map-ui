import TransitType from '~/enums/transitType';
import { ILineRoute } from '.';

export default interface ILine {
    transitType: TransitType;
    lineNumber: string;
    lineId: string;
    routes: ILineRoute[];
}
