import { ILine } from '~/models';
import IExternalLine from '~/models/externals/IExternalLine.ts';
import IExternalRoute from '~/models/externals/IExternalRoute.ts';
import ISearchLineRoute from '~/models/searchModels/ISearchLineRoute';
import ISearchLine from '~/models/searchModels/ISearchLine';

class LineFactory {
    public static createLine = (externalLine: IExternalLine): ILine => {
        return {
            routes: [],
            transitType: externalLine.linverkko,
            id: externalLine.lintunnus,
            lineBasicRoute: externalLine.linperusreitti,
            lineStartDate: new Date(externalLine.linvoimast),
            lineEndDate: new Date(externalLine.linvoimviimpvm),
            publicTransportType: externalLine.linjoukkollaji,
            clientOrganization: externalLine.lintilorg,
            modifiedBy: externalLine.linkuka,
            modifiedOn: externalLine.linviimpvm
                ? new Date(externalLine.linviimpvm)
                : undefined,
            publicTransportDestination: externalLine.linjlkohde,
            exchangeTime: externalLine.vaihtoaika,
            lineReplacementType: externalLine.linkorvtyyppi
        };
    };

    public static createNewLine = (): ILine => {
        const defaultDate = new Date();
        defaultDate.setHours(0, 0, 0, 0);

        return {
            routes: [],
            id: '',
            lineBasicRoute: '',
            lineStartDate: new Date(defaultDate),
            lineEndDate: new Date(defaultDate),
            publicTransportType: '',
            clientOrganization: 'HSL',
            modifiedBy: '',
            modifiedOn: undefined,
            publicTransportDestination: '',
            exchangeTime: 0,
            lineReplacementType: ''
        };
    };

    public static createSearchLine = (
        externalLine: IExternalLine
    ): ISearchLine => {
        const routes = externalLine.reittisByLintunnus.nodes.map(
            (route: IExternalRoute): ISearchLineRoute => {
                return {
                    id: route.reitunnus,
                    name: _getRouteName(route),
                    date: route.reiviimpvm
                        ? new Date(route.reiviimpvm)
                        : undefined
                };
            }
        );

        return {
            routes,
            transitType: externalLine.linverkko,
            id: externalLine.lintunnus
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
