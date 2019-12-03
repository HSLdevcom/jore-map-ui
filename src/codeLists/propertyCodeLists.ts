import { ILink, INode, IRoute, IStop, IStopArea } from '~/models';

type NodeKeys = keyof INode;
type INodePropertyCodeList = { [key in NodeKeys]: string };
const nodePropertyCodeList: INodePropertyCodeList = {
    id: '',
    shortIdLetter: 'LYHYTTUNNUS (2 kirj.)',
    shortIdString: 'LYHYTTUNNUS (4 num)',
    type: 'TYYPPI',
    stop: '',
    coordinates: 'MITATTU PISTE',
    coordinatesProjection: 'PROJISOITU PISTE',
    measurementDate: 'MITTAUS PVM',
    measurementType: 'MITTAUSTAPA',
    tripTimePoint: 'MATKA-AIKAPISTE',
    modifiedBy: 'MUOKANNUT',
    modifiedOn: 'MUOKATTU PVM',
    transitTypes: 'VERKKO'
};

type StopKeys = keyof IStop;
type IStopPropertyCodeList = { [key in StopKeys]: string };
const stopPropertyCodeList: IStopPropertyCodeList = {
    nodeId: '',
    municipality: 'KUNTA',
    nameFi: 'NIMI',
    nameSw: 'NIMI RUOTSIKSI',
    placeNameFi: 'PAIKAN NIMI',
    placeNameSw: 'PAIKAN NIMI RUOTSIKSI',
    addressFi: 'OSOITE',
    addressSw: 'OSOITE RUOTSIKSI',
    modifiedBy: 'MUOKANNUT',
    modifiedOn: 'MUOKATTU PVM',
    platform: 'LAITURI',
    radius: 'SÄDE',
    hastusId: 'HASTUS-PAIKKA',
    stopAreaId: 'PYSÄKKIALUE',
    elyNumber: 'ELYNUMERO',
    nameLongFi: 'PITKÄ NIMI',
    nameLongSw: 'PITKÄ NIMI RUOTSIKSI',
    nameModifiedOn: 'PITKÄ NIMI MUOKATTU PVM',
    section: 'VYÖHYKE',
    postalNumber: 'POSTINUMERO',
    transitType: 'VERKKO'
};

type LinkKeys = keyof ILink;
type ILinkPropertyCodeList = { [key in LinkKeys]: string };
const linkPropertyCodeList: ILinkPropertyCodeList = {
    transitType: 'VERKKO',
    startNode: 'ALKUSOLMU',
    endNode: 'LOPPUSOLMU',
    geometry: 'GEOMETRIA',
    streetName: 'KATU',
    length: 'LASKETTU PITUUS (m)',
    measuredLength: 'MITATTU PITUUS (m)',
    modifiedBy: 'MUOKANNUT',
    modifiedOn: 'MUOKATTU PVM'
};

type RouteKeys = keyof IRoute;
type IRoutePropertyCodeList = { [key in RouteKeys]: string };
const routePropertyCodeList: IRoutePropertyCodeList = {
    id: '',
    routePaths: '',
    routeName: 'REITIN NIMI',
    routeNameShort: 'REITIN LYHYT NIMI',
    routeNameSw: 'REITIN NIMI RUOTSIKSI',
    routeNameShortSw: 'REITIN LYHYT NIMI RUOTSIKSI',
    lineId: '',
    line: '',
    modifiedBy: 'MUOKANNUT',
    modifiedOn: 'MUOKATTU PVM'
};

type StopAreaKeys = keyof IStopArea;
type IStopAreaPropertyCodeList = { [key in StopAreaKeys]: string };
const stopAreaPropertyCodeList: IStopAreaPropertyCodeList = {
    id: '',
    transitType: 'VERKKO',
    nameFi: 'NIMI',
    nameSw: 'NIMI RUOTSIKSI',
    terminalAreaId: 'TERMINAALIALUE',
    modifiedBy: 'MUOKANNUT',
    modifiedOn: 'MUOKATTU PVM',
    stopAreaGroupId: 'PYSÄKKIALUE'
};

export default {
    node: nodePropertyCodeList,
    stop: stopPropertyCodeList,
    link: linkPropertyCodeList,
    route: routePropertyCodeList,
    stopArea: stopAreaPropertyCodeList
};
