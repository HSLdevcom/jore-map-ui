import { ILine, ILineRoute } from '~/models';
import IExternalLine  from '~/models/externals/IExternalLine.ts';
import IExternalRoute  from '~/models/externals/IExternalRoute.ts';
import TransitTypeHelper from '~/util/transitTypeHelper';

class LineFactory {
    public static createLine = (line: IExternalLine): ILine => {
        const transitType = TransitTypeHelper.convertTransitTypeCodeToTransitType(line.linverkko);
        const routes = line.reittisByLintunnus.nodes.map((route: IExternalRoute): ILineRoute => {
            return {
                id: route.reitunnus,
                name: _getRouteName(route),
                date: route.reiviimpvm,
            };
        });

        return {
            transitType,
            routes,
            lineId: line.lintunnus,
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
