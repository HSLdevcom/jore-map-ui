import TransitType from '../enums/transitType';

export default interface ILine {
    transitType: TransitType;
    description: string;
    lineNumber: string;
    lineId: string;
    routeNumber: string;
}
