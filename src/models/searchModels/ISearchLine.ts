import TransitType from '~/enums/transitType';
import ISearchLineRoute from './ISearchLineRoute';

export default interface ISearchLine {
    id: string;
    transitType: TransitType;
    routes: ISearchLineRoute[];
}
