import TransitType from '~/enums/transitType';

interface IStopPrimaryKey {
    nodeId: string;
}

export default interface IStop extends IStopPrimaryKey {
    municipality: string;
    nameFi: string;
    nameSe: string;
    placeNameFi: string;
    placeNameSe: string;
    addressFi: string;
    addressSe: string;
    modifiedBy: string;
    modifiedOn: Date;
    platform: string;
    radius: number;
    hastusId: string;
    areaId: string;
    elyNumber: string;
    nameLongFi: string;
    nameLongSe: string;
    nameModifiedOn: Date;
    section: string;
    postalNumber: string;
    transitType?: TransitType;
}

export { IStopPrimaryKey };
