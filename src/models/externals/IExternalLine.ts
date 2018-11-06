import IExternalRoute from './IExternalRoute';

export default interface IExternalLine {
    linjoukkollaji: string;
    lintunnus: string;
    linverkko: string;
    externalRoutes: IExternalRoute[];
}
