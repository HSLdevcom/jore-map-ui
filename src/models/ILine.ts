import TransitType from '~/enums/transitType';
import { ILineRoute } from '.';

interface ILinePrimaryKey {
    id: string;
}

export default interface ILine extends ILinePrimaryKey {
    transitType: TransitType;
    routes: ILineRoute[];
}

export {
    ILinePrimaryKey,
};
