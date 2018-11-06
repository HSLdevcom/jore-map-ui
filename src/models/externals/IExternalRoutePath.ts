import IExternalRoutePathLink from './IExternalRoutePathLink';

export default interface IExternalRoutePath {
    externalRoutePathLinks: IExternalRoutePathLink[];
    geojson: string; // TODO: remove this?
    positions: string; // TODO: remove this?
    lintunnus: string;
    suulahpaik: string;
    suunimi: string;
    suunimir: string;
    suupaapaik: string;
    suupaapaikr: string;
    suulahpaikr: string;
    suunimilyh: string;
    suunimilyhr: string;
    suusuunta: string;
    suukuka: string;
    suuviimpvm: string;
    suuvoimast: string;
    suuvoimviimpvm: string;
}
