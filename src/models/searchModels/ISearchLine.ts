import TransitType from '~/enums/transitType';
import ISearchLineRoute from './ISearchLineRoute';

interface ISearchLinePrimaryKey {
    id: string;
}

export default interface ISearchLine extends ISearchLinePrimaryKey {
    transitType: TransitType;
    routes: ISearchLineRoute[];
}

export {
    ISearchLinePrimaryKey,
};
