import TransitType from '~/enums/transitType';

interface IStopPrimaryKey {
    nodeId: string;
}

export default interface IStop extends IStopPrimaryKey {
    municipality: string;
    nameFi: string;
    nameSw: string;
    placeNameFi?: string;
    placeNameSw?: string;
    addressFi: string;
    addressSw: string;
    modifiedBy?: string;
    modifiedOn?: Date;
    platform?: string;
    radius: number;
    hastusId?: string;
    stopAreaId?: string;
    elyNumber?: string;
    nameLongFi?: string;
    nameLongSw?: string;
    nameModifiedOn?: Date;
    section: string;
    postalNumber?: string;
    transitType?: TransitType; // Only used for creating a soltunnus
}

interface IStopItem {
    stopAreaId: string;
    nodeId: string;
    nameFi: string;
    nameSw: string;
}

export { IStopItem, IStopPrimaryKey };
