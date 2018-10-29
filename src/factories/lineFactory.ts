import { ILine, ILineRoute } from '~/models';
import IExternalLine  from '~/models/externals/IExternalLine.ts';
import TransitTypeHelper from '~/util/transitTypeHelper';

class LineFactory {
    // linja to ILine
    public static createLine = (linja: IExternalLine): ILine => {
        const transitType = TransitTypeHelper.convertTransitTypeCodeToTransitType(linja.linverkko);
        const routes = linja.reittisByLintunnus.nodes.map((route: any): ILineRoute => {
            return {
                id: route.reitunnus,
                name: _getRouteName(route),
                date: route.reiviimpvm,
            };
        });

        return {
            transitType,
            routes,
            lineId: linja.lintunnus,
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
