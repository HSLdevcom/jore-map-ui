import { IValidationResult } from '~/validation/FormValidator';
import ILineHeader from './ILineHeader';

// Keep lineHeader original dates in memory and use them as part of the primary key
interface ILineHeaderPrimaryKey {
    lineId: string;
    originalStartDate: Date;
    originalEndDate: Date;
}

export default interface IMassEditLineHeader {
    id: ILineHeaderPrimaryKey;
    isRemoved: boolean;
    lineHeader: ILineHeader;
    validationResult: IValidationResult;
}

export { ILineHeaderPrimaryKey };
