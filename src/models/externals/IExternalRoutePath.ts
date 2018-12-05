import IExternalRoutePathLink from './IExternalRoutePathLink';

export default interface IExternalRoutePath {
    poikkeusreitti: string;
    externalRoutePathLinks: IExternalRoutePathLink[];
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
    suupituus: number;
}
