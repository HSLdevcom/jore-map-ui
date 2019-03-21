export default interface IStop {
    nodeId: string;
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
}
