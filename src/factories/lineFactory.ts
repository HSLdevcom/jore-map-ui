import { ILine, ILineRoute } from '~/models';
import IExternalLine  from '~/models/externals/IExternalLine.ts';
import IExternalRoute  from '~/models/externals/IExternalRoute.ts';
import TransitTypeHelper from '~/util/transitTypeHelper';

class LineFactory {
    public static createLine = (externalLine: IExternalLine): ILine => {
        const transitType = TransitTypeHelper
            .convertTransitTypeCodeToTransitType(externalLine.linverkko);

        const routes = externalLine.externalRoutes.map((route: IExternalRoute): ILineRoute => {
            return {
                id: route.reitunnus,
                name: _getRouteName(route),
                date: route.reiviimpvm,
            };
        });

        return {
            transitType,
            routes,
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
