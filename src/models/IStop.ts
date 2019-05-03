import TransitType from '~/enums/transitType';

interface IStopPrimaryKey {
    nodeId: string;
}

export default interface IStop extends IStopPrimaryKey {
    municipality: string;
    nameFi: string;
    nameSe: string; // TODO: rename as nameSw
    placeNameFi: string;
    placeNameSe: string;
    addressFi: string;
    addressSe: string;
    exchangeStop: string;
    modifiedBy: string;
    modifiedOn: Date;
    platform: string;
    roof: string;
    type: string;
    radius: number;
    direction: string;
    courseDirection: string;
    hastusId: string;
    terminal: string;
    kutsuplus: string;
    kutsuplusPriority: string;
    kutsuplusSection: string;
    id: number;
    areaId: string;
    rate: string;
    elyNumber: string;
    nameLongFi: string;
    nameLongSe: string;
    nameModifiedOn: Date;
    section: string;
    postalNumber: string;
    transitType?: TransitType; // Only used for creating a soltunnus
}

export { IStopPrimaryKey };
