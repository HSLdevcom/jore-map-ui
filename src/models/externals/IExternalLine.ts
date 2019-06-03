import TransitType from '~/enums/transitType';
import IExternalRoute from './IExternalRoute';
import IGraphqlList from './graphqlModelHelpers/IGraphqlList';

export default interface IExternalLine {
    reittisByLintunnus: IGraphqlList<IExternalRoute>;
    lintunnus: string;
    linperusreitti: string;
    linvoimast: Date;
    linvoimviimpvm: Date;
    linjoukkollaji: string;
    lintilorg: string;
    linverkko: TransitType;
    linkuka?: string;
    linviimpvm?: Date;
    linjlkohde?: string;
    vaihtoaika?: number;
    linkorvtyyppi?: string;
}
