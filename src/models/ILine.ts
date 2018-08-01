import TransitType from '../enums/transitType';

export default interface ILine {
    transitType: TransitType;
    lineNumber: string;
    lineId: string;
    lineName: string;
}
