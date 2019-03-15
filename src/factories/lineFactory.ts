import { ILine, ILineRoute } from '~/models';
import IExternalLine  from '~/models/externals/IExternalLine.ts';
import IExternalRoute  from '~/models/externals/IExternalRoute.ts';

class LineFactory {
    public static createLine = (externalLine: IExternalLine): ILine => {
        const routes = externalLine.reittisByLintunnus.nodes.map(
            (route: IExternalRoute): ILineRoute => {
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
