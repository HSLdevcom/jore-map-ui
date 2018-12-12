import IExternalRoute from './IExternalRoute';
import IGraphqlList from './graphqlModelHelpers/IGraphqlList';

export default interface IExternalLine {
    reittisByLintunnus: IGraphqlList<IExternalRoute>;
    linjoukkollaji: string;
    lintunnus: string;
    linverkko: string;
}
