import TransitType from '~/enums/transitType';
import IExternalRoute from './IExternalRoute';
import IGraphqlList from './graphqlModelHelpers/IGraphqlList';

export default interface IExternalLine {
    reittisByLintunnus: IGraphqlList<IExternalRoute>;
    lintunnus: string;
    linperusreitti: string;
    linvoimast: string;
    linvoimviimpvm: string;
    linjoukkollaji: string;
    lintilorg: string;
    linverkko: TransitType;
    linryhma: string;
    linkuka: string;
    linviimpvm: string;
    linjlkohde: string;
    vaihtoaika: number;
    linkorvtyyppi: string;
}
