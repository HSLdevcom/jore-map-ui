import { ILink, IRoute } from '~/models';

type LinkKeys = keyof ILink;
type ILinkPropertyCodeList = { [key in LinkKeys]: string };
const linkPropertyCodeList: ILinkPropertyCodeList = {
    transitType: 'VERKKO',
    startNode: 'ALKUSOLMU',
    endNode: 'LOPPUSOLMU',
    geometry: 'GEOMETRIA',
    municipalityCode: 'KUNTA',
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

export { linkPropertyCodeList, routePropertyCodeList };
