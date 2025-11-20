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
    tariffi: string;
    elyNumber?: string;
    nameLongFi?: string;
    nameLongSw?: string;
    section: string;
    postalNumber?: string;
}

interface IStopItem {
    coordinates?: L.LatLng;
    stopAreaId: string;
    nodeId: string;
    nameFi: string;
    nameSw: string;
}

export { IStopItem, IStopPrimaryKey };
