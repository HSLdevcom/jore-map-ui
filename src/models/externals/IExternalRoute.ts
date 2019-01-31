import IExternalRoutePath from './IExternalRoutePath';
import IGraphqlList from './graphqlModelHelpers/IGraphqlList';
import IExternalLine from './IExternalLine';

export default interface IExternalRoute {
    reitinsuuntasByReitunnus: IGraphqlList<IExternalRoutePath>;
    linjaByLintunnus: IExternalLine;
    lintunnus: string;
    reikuka: string;
    reinimi: string;
    reinimilyh: string;
    reinimilyhr: string;
    reinimir: string;
    reitunnus: string;
    reiviimpvm: string;
}
