import { ILine, ILineHeader, ILink, INode, IRoute, IRoutePath, IStop, IStopArea } from '~/models';

type NodeKeys = keyof INode;
type INodePropertyCodeList = { [key in NodeKeys]: string };
const nodePropertyCodeList: INodePropertyCodeList = {
    id: '',
    idSuffix: '',
    shortIdLetter: 'LYHYTTUNNUS (2 kirj.)',
    shortIdString: 'LYHYTTUNNUS (4 num)',
    type: 'TYYPPI',
    stop: '',
    coordinates: 'MITATTU PISTE',
    coordinatesProjection: 'PROJISOITU PISTE',
    measurementDate: 'MITTAUS PVM',
    measurementType: 'MITTAUSTAPA',
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
    routePaths: 'REITINSUUNNAT',
    routeName: 'NIMI',
    routeNameShort: 'LYHYT NIMI',
    routeNameSw: 'NIMI RUOTSIKSI',
    routeNameShortSw: 'LYHYT NIMI RUOTSIKSI',
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

type LineKeys = keyof ILine;
type ILinePropertyCodeList = { [key in LineKeys]: string };
const linePropertyCodeList: ILinePropertyCodeList = {
    id: 'LINJAN TUNNUS',
    transitType: 'VERKKO',
    lineBasicRoute: 'LINJAN PERUS REITTI',
    lineStartDate: 'LINJAN VOIM.AST.PVM',
    lineEndDate: 'LINJAN VIIM. VOIM.OLOPVM',
    publicTransportType: 'JOUKKOLIIKENNELAJI',
    clientOrganization: 'TILAAJAORGANISAATIO',
    modifiedBy: '',
    modifiedOn: '',
    publicTransportDestination: 'JOUKKOLIIKENNEKOHDE',
    exchangeTime: 'VAIHTOAJAN PIDENNYS (min)',
    lineReplacementType: 'LINJAN KORVAAVA TYYPPI',
    routes: ''
};

type RoutePathKeys = keyof IRoutePath;
type IRoutePathPropertyCodeList = { [key in RoutePathKeys]: string };
const routePathPropertyCodeList: IRoutePathPropertyCodeList = {
    routeId: '',
    direction: 'SUUNTA',
    startTime: 'VOIM. AST',
    internalId: '',
    color: '',
    visible: '',
    transitType: '',
    lineId: '',
    routePathLinks: 'SOLMUT JA LINKIT',
    name: 'NIMI SUOMEKSI',
    nameSw: 'NIMI RUOTSIKSI',
    endTime: 'VIIM.VOIM.OLO',
    originFi: 'LÄHTÖPAIKKA SUOMEKSI',
    originSw: 'LÄHTÖPAIKKA RUOTSIKSI',
    destinationFi: 'PÄÄTEPAIKKA SUOMEKSI',
    destinationSw: 'PÄÄTEPAIKKA RUOTSIKSI',
    shortName: 'LYHENNE SUOMEKSI',
    shortNameSw: 'LYHENNE RUOTSIKSI',
    length: 'PITUUS (m)',
    isStartNodeUsingBookSchedule: '',
    startNodeBookScheduleColumnNumber: '',
    exceptionPath: 'POIKKEUSREITTI',
    modifiedOn: '',
    modifiedBy: ''
};

type LineHeaderKeys = keyof ILineHeader;
type ILineHeaderPropertyCodeList = { [key in LineHeaderKeys]: string };
const lineHeaderPropertyCodeList: ILineHeaderPropertyCodeList = {
    lineId: 'LINJAN TUNNUS',
    originalStartDate: '',
    startDate: 'VOIM.AST.PVM',
    endDate: 'VIIM. VOIM.OLOPVM',
    lineNameFi: 'LINJAN NIMI',
    lineShortNameFi: 'LINJAN LYHYT NIMI',
    lineNameSw: 'LINJAN NIMI RUOTSIKSI',
    lineShortNameSw: 'LINJAN LYHYT NIMI RUOTSIKSI',
    lineStartPlace1Fi: 'LÄHTÖPAIKKA SUUNNASSA 1',
    lineStartPlace1Sw: 'LÄHTÖPAIKKA SUUNNASSA 1 RUOTSIKSI',
    lineStartPlace2Fi: 'LÄHTÖPAIKKA SUUNNASSA 2',
    lineStartPlace2Sw: 'LÄHTÖPAIKKA SUUNNASSA 2 RUOTSIKSI',
    modifiedBy: '',
    modifiedOn: ''
};

export default {
    node: nodePropertyCodeList,
    stop: stopPropertyCodeList,
    link: linkPropertyCodeList,
    route: routePropertyCodeList,
    stopArea: stopAreaPropertyCodeList,
    line: linePropertyCodeList,
    routePath: routePathPropertyCodeList,
    lineHeader: lineHeaderPropertyCodeList
};
