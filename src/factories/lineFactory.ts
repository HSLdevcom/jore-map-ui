import { ILine } from '~/models';
import IExternalLine from '~/models/externals/IExternalLine.ts';
import IExternalRoute from '~/models/externals/IExternalRoute.ts';
import ISearchLine from '~/models/searchModels/ISearchLine';
import ISearchLineRoute from '~/models/searchModels/ISearchLineRoute';

class LineFactory {
    public static mapExternalLine = (externalLine: IExternalLine): ILine => {
        return {
            transitType: externalLine.linverkko,
            id: externalLine.lintunnus,
            lineBasicRoute: externalLine.linperusreitti,
            publicTransportType: externalLine.linjoukkollaji,
            clientOrganization: externalLine.lintilorg,
            modifiedBy: externalLine.linkuka,
            modifiedOn: externalLine.linviimpvm ? new Date(externalLine.linviimpvm) : undefined,
            publicTransportDestination: externalLine.linjlkohde,
            exchangeTime: externalLine.vaihtoaika,
            lineReplacementType: externalLine.linkorvtyyppi,
        };
    };

    public static createNewLine = (): ILine => {
        return {
            id: '',
            lineBasicRoute: '',
            publicTransportType: '',
            clientOrganization: 'HSL',
            modifiedBy: '',
            modifiedOn: undefined,
            publicTransportDestination: '',
            exchangeTime: 0,
            lineReplacementType: '',
        };
    };

    public static createSearchLine = (externalLine: IExternalLine): ISearchLine => {
        const routes = externalLine.reittisByLintunnus.nodes.map(
            (route: IExternalRoute): ISearchLineRoute => {
                return {
                    id: route.reitunnus,
                    name: _getRouteName(route),
                    isUsedByRoutePath: route.isUsedByRoutePath!,
                    date: route.reiviimpvm ? new Date(route.reiviimpvm) : undefined,
                };
            }
        );

        return {
            routes,
            transitType: externalLine.linverkko,
            id: externalLine.lintunnus,
        };
    };
}

const _getRouteName = (route: any) => {
    if (!route || !route.reinimi) {
        return 'Reitillä ei nimeä';
    }
    return route.reinimi;
};

export default LineFactory;
