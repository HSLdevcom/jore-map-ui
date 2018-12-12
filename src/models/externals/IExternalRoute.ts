import IExternalRoutePath from './IExternalRoutePath';
import IGraphqlList from './graphqlModelHelpers/IGraphqlList';

export default interface IExternalRoute {
    reitinsuuntasByReitunnus: IGraphqlList<IExternalRoutePath>;
    lintunnus: string;
    reikuka: string;
    reinimi: string;
    reinimilyh: string;
    reinimilyhr: string;
    reinimir: string;
    reitunnus: string;
    reiviimpvm: string;
}
