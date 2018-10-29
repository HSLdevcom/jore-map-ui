import IExternalRoute from './IExternalRoute';

export default interface IExternalLine {
    linjoukkollaji: string;
    lintunnus: string;
    linverkko: string;
    reittisByLintunnus: {
        nodes: IExternalRoute[],
    };
}
