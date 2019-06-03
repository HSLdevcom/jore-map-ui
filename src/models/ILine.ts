import TransitType from '~/enums/transitType';
import { IRoute } from '.';

interface ILinePrimaryKey {
    id: string;
}

export default interface ILine extends ILinePrimaryKey {
    routes: IRoute[];
    transitType?: TransitType;
    lineBasicRoute: string;
    lineStartDate: Date;
    lineEndDate: Date;
    publicTransportType: string;
    clientOrganization: string;
    modifiedBy?: string;
    modifiedOn?: string;
    publicTransportDestination?: string;
    exchangeTime?: number;
    lineReplacementType?: string;
}

export { ILinePrimaryKey };
