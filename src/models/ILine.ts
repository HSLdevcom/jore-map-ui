import TransitType from '~/enums/transitType';

interface ILinePrimaryKey {
    id: string;
}

export default interface ILine extends ILinePrimaryKey {
    transitType?: TransitType;
    lineBasicRoute: string;
    lineStartDate: Date;
    lineEndDate: Date;
    publicTransportType: string;
    clientOrganization: string;
    modifiedBy?: string;
    modifiedOn?: Date;
    publicTransportDestination?: string;
    exchangeTime?: number;
    lineReplacementType?: string;
}

export { ILinePrimaryKey };
