import IExternalRoutePathLink from './IExternalRoutePathLink';
import IGraphqlList from './graphqlModelHelpers/IGraphqlList';
import IExternalRoute from './IExternalRoute';

export default interface IExternalRoutePath {
    poikkeusreitti: string;
    reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta: IGraphqlList<
        IExternalRoutePathLink
    >;
    reittiByReitunnus: IExternalRoute;
    reitunnus: string;
    suulahpaik: string;
    suunimi: string;
    suunimir: string;
    suupaapaik: string;
    suupaapaikr: string;
    suulahpaikr: string;
    suunimilyh: string;
    suunimilyhr: string;
    suusuunta: string;
    suukuka?: string;
    suuviimpvm?: string;
    suuvoimast: string;
    suuvoimviimpvm: string;
    suupituus: number;
    kirjaan: string;
    kirjasarake: number;
}
