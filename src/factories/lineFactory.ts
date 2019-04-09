import { ILine } from '~/models';
import IExternalLine  from '~/models/externals/IExternalLine.ts';
import IExternalRoute  from '~/models/externals/IExternalRoute.ts';
import ISearchLineRoute from '~/models/searchModels/ISearchLineRoute';
import ISearchLine from '~/models/searchModels/ISearchLine';
import TransitType from '~/enums/transitType';

class LineFactory {
    public static createLine = (externalLine: IExternalLine): ILine => {
        return {
            routes: [],
            transitType: externalLine.linverkko,
            id: externalLine.lintunnus,
            lineBasicRoute: externalLine.linperusreitti,
            lineStartDate: externalLine.linvoimast,
            lineEndDate: externalLine.linvoimviimpvm,
            publicTransportType: externalLine.linjoukkollaji,
            clientOrganization: externalLine.lintilorg,
            lineGroup: externalLine.linryhma,
            modifiedBy: externalLine.linkuka,
            modifiedOn: externalLine.linviimpvm,
            publicTransportDestination: externalLine.linjlkohde,
            exchangeTime: externalLine.vaihtoaika,
            lineReplacementType: externalLine.linkorvtyyppi,
        };
    }

    public static createNewLine = (): ILine => {
        return {
            routes: [],
            transitType: TransitType.BUS,
            id: '',
            lineBasicRoute: '',
            lineStartDate: '',
            lineEndDate: '',
            publicTransportType: '',
            clientOrganization: '',
            lineGroup: '',
            modifiedBy: '',
            modifiedOn: '',
            publicTransportDestination: '',
            exchangeTime: 0,
            lineReplacementType: '',
        };
    }

    public static createSearchLine = (externalLine: IExternalLine): ISearchLine => {
        const routes = externalLine.reittisByLintunnus.nodes.map(
            (route: IExternalRoute): ISearchLineRoute => {
                return {
                    id: route.reitunnus,
                    name: _getRouteName(route),
                    date: new Date(route.reiviimpvm),
                };
            });

        return {
            routes,
            transitType: externalLine.linverkko,
            id: externalLine.lintunnus,
        };
    }
}

const _getRouteName = (route: any) => {
    if (!route || !route.reinimi) {
        return 'Reitillä ei nimeä';
    }
    return route.reinimi;
};

export default LineFactory;
