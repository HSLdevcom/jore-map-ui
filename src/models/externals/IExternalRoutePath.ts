import IExternalRoutePathLink from './IExternalRoutePathLink';
import IGraphqlList from './graphqlModelHelpers/IGraphqlList';
import IExternalLine from './IExternalLine';

export default interface IExternalRoutePath {
    poikkeusreitti: string;
    reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta: IGraphqlList<IExternalRoutePathLink>;
    reittiByReitunnus: IExternalLine;
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
