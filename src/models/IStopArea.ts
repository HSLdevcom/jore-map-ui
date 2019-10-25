import TransitType from '~/enums/transitType';

export default interface IStopArea {
    id: string;
    transitType?: TransitType;
    nameFi: string;
    nameSw: string;
    modifiedBy?: string;
    modifiedOn?: Date;
    stopAreaGroupId?: string;
}
