import IExternalRoutePathLink from './IExternalRoutePathLink';
import IGraphqlList from './graphqlModelHelpers/IGraphqlList';
import IExternalRoute from './IExternalRoute';

export default interface IExternalRoutePath {
    reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta: IGraphqlList<
        IExternalRoutePathLink
    >;

    reittiByReitunnus: IExternalRoute;
    reitunnus: string;
    suusuunta: string;
    suuvoimast: Date;
    suuvoimviimpvm: Date;
    suulahpaik: string;
    suunimi: string;
    suunimir: string;
    suupaapaik: string;
    suupaapaikr: string;
    suulahpaikr: string;
    suunimilyh: string;
    suunimilyhr: string;
    suukuka?: string;
    suuviimpvm?: Date;
    suupituus: number;
    kirjaan?: string;
    kirjasarake?: number;
    poikkeusreitti?: string;
}
